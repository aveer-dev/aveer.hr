import { createClient } from '@/utils/supabase/client';
import { 
  Chat, 
  ChatMessage, 
  ChatInsert, 
  ChatMessageInsert,
  LocalChatData,
  MessageFeedbackInsert,
  ChatToolUsageInsert
} from '@/type/ai-chat.types';

export class ChatStorageService {
  private supabase = createClient();
  private readonly STORAGE_KEY = 'ai_chat_local_data';
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Start sync interval
    this.startSyncInterval();
    
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.syncWithServer());
      window.addEventListener('offline', () => this.stopSyncInterval());
    }
  }

  // Initialize storage
  async initialize(userId: string, org: string) {
    // Load chats from server
    const { data: chats, error } = await this.supabase
      .from('chats')
      .select('*')
      .eq('profile_id', userId)
      .eq('org', org)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error loading chats:', error);
      return this.getLocalChats();
    }

    // Cache in local storage
    this.saveToLocal('chats', chats || []);
    return chats || [];
  }

  // Create a new chat
  async createChat(chat: ChatInsert): Promise<Chat> {
    const { data, error } = await this.supabase
      .from('chats')
      .insert(chat)
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      // Create locally with temporary ID
      const localChat: Chat = {
        ...chat,
        id: Date.now(), // Temporary ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      } as Chat;
      
      this.addToLocalQueue('chats', localChat);
      return localChat;
    }

    // Update local cache
    this.updateLocalChat(data);
    return data;
  }

  // Get messages for a chat
  async getMessages(chatId: number): Promise<ChatMessage[]> {
    // Check local cache first
    const localMessages = this.getLocalMessages(chatId);
    
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return localMessages;
    }

    // Merge with local pending messages
    const merged = this.mergeMessages(data || [], localMessages);
    this.saveLocalMessages(chatId, merged);
    
    return merged;
  }

  // Save a message
  async saveMessage(message: ChatMessageInsert): Promise<ChatMessage> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      // Save locally
      const localMessage: ChatMessage = {
        ...message,
        id: Date.now(), // Temporary ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as ChatMessage;
      
      this.addLocalMessage(message.chat_id, localMessage);
      this.addToLocalQueue('messages', localMessage);
      return localMessage;
    }

    // Update local cache
    this.addLocalMessage(data.chat_id, data);
    return data;
  }

  // Update chat
  async updateChat(chatId: number, updates: Partial<Chat>) {
    const { error } = await this.supabase
      .from('chats')
      .update(updates)
      .eq('id', chatId);

    if (error) {
      console.error('Error updating chat:', error);
      this.addToLocalQueue('chat_updates', { chatId, updates });
    }

    // Update local cache
    this.updateLocalChat({ id: chatId, ...updates } as Chat);
  }

  // Delete message (soft delete)
  async deleteMessage(messageId: number) {
    const { error } = await this.supabase
      .from('chat_messages')
      .update({ is_deleted: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      this.addToLocalQueue('message_deletes', messageId);
    }

    // Update local cache
    this.removeLocalMessage(messageId);
  }

  // Save feedback
  async saveFeedback(feedback: MessageFeedbackInsert) {
    const { error } = await this.supabase
      .from('message_feedback')
      .insert(feedback);

    if (error) {
      console.error('Error saving feedback:', error);
      this.addToLocalQueue('feedback', feedback);
    }
  }

  // Save tool usage
  async saveToolUsage(toolUsage: ChatToolUsageInsert) {
    const { error } = await this.supabase
      .from('chat_tool_usage')
      .insert(toolUsage);

    if (error) {
      console.error('Error saving tool usage:', error);
      this.addToLocalQueue('tool_usage', toolUsage);
    }
  }

  // Search chats
  async searchChats(userId: string, query: string): Promise<Array<{chat: Chat, messages: ChatMessage[]}>> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select(`
        *,
        chats!inner(*)
      `)
      .eq('chats.profile_id', userId)
      .textSearch('search_vector', query)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error searching chats:', error);
      // Fall back to local search
      return this.searchLocalChats(query);
    }

    // Group by chat
    const chatMap = new Map<number, {chat: Chat, messages: ChatMessage[]}>();
    
    data?.forEach((item: any) => {
      const chatId = item.chat_id;
      if (!chatMap.has(chatId)) {
        chatMap.set(chatId, {
          chat: item.chats,
          messages: []
        });
      }
      chatMap.get(chatId)!.messages.push(item);
    });

    return Array.from(chatMap.values());
  }

  // Local storage methods
  private saveToLocal(key: string, data: any) {
    if (typeof window === 'undefined') return;
    
    const storage = this.getLocalStorage();
    storage[key] = data;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storage));
  }

  private getLocalStorage(): any {
    if (typeof window === 'undefined') return {};
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private getLocalChats(): Chat[] {
    const storage = this.getLocalStorage();
    return storage.chats || [];
  }

  private getLocalMessages(chatId: number): ChatMessage[] {
    const storage = this.getLocalStorage();
    return storage.messages?.[chatId] || [];
  }

  private saveLocalMessages(chatId: number, messages: ChatMessage[]) {
    const storage = this.getLocalStorage();
    if (!storage.messages) storage.messages = {};
    storage.messages[chatId] = messages;
    this.saveToLocal('messages', storage.messages);
  }

  private addLocalMessage(chatId: number, message: ChatMessage) {
    const messages = this.getLocalMessages(chatId);
    messages.push(message);
    this.saveLocalMessages(chatId, messages);
  }

  private removeLocalMessage(messageId: number) {
    const storage = this.getLocalStorage();
    if (!storage.messages) return;

    Object.keys(storage.messages).forEach(chatId => {
      storage.messages[chatId] = storage.messages[chatId].filter(
        (m: ChatMessage) => m.id !== messageId
      );
    });

    this.saveToLocal('messages', storage.messages);
  }

  private updateLocalChat(chat: Chat) {
    const chats = this.getLocalChats();
    const index = chats.findIndex(c => c.id === chat.id);
    
    if (index !== -1) {
      chats[index] = { ...chats[index], ...chat };
    } else {
      chats.unshift(chat);
    }
    
    this.saveToLocal('chats', chats);
  }

  private addToLocalQueue(type: string, data: any) {
    const storage = this.getLocalStorage();
    if (!storage.queue) storage.queue = {};
    if (!storage.queue[type]) storage.queue[type] = [];
    
    storage.queue[type].push({
      data,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storage));
  }

  private mergeMessages(serverMessages: ChatMessage[], localMessages: ChatMessage[]): ChatMessage[] {
    const messageMap = new Map<number, ChatMessage>();
    
    // Add server messages
    serverMessages.forEach(msg => messageMap.set(msg.id, msg));
    
    // Add local messages that don't exist on server
    localMessages.forEach(msg => {
      if (!messageMap.has(msg.id)) {
        messageMap.set(msg.id, msg);
      }
    });
    
    return Array.from(messageMap.values()).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  private searchLocalChats(query: string): Array<{chat: Chat, messages: ChatMessage[]}> {
    const storage = this.getLocalStorage();
    const results: Array<{chat: Chat, messages: ChatMessage[]}> = [];
    const queryLower = query.toLowerCase();

    const chats = storage.chats || [];
    const messages = storage.messages || {};

    chats.forEach((chat: Chat) => {
      const chatMessages = messages[chat.id] || [];
      const matchingMessages = chatMessages.filter((msg: ChatMessage) => 
        msg.content.toLowerCase().includes(queryLower)
      );

      if (matchingMessages.length > 0 || chat.title?.toLowerCase().includes(queryLower)) {
        results.push({ chat, messages: matchingMessages });
      }
    });

    return results;
  }

  // Sync methods
  private startSyncInterval() {
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncWithServer();
      }
    }, 30000); // Sync every 30 seconds
  }

  private stopSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async syncWithServer() {
    const storage = this.getLocalStorage();
    const queue = storage.queue || {};

    // Process each queue type
    for (const [type, items] of Object.entries(queue)) {
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        try {
          await this.processSyncItem(type, item.data);
        } catch (error) {
          console.error(`Error syncing ${type}:`, error);
        }
      }
    }

    // Clear processed queue
    storage.queue = {};
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storage));
  }

  private async processSyncItem(type: string, data: any) {
    switch (type) {
      case 'chats':
        await this.supabase.from('chats').insert(data);
        break;
      case 'messages':
        await this.supabase.from('chat_messages').insert(data);
        break;
      case 'chat_updates':
        await this.supabase.from('chats').update(data.updates).eq('id', data.chatId);
        break;
      case 'message_deletes':
        await this.supabase.from('chat_messages').update({ is_deleted: true }).eq('id', data);
        break;
      case 'feedback':
        await this.supabase.from('message_feedback').insert(data);
        break;
      case 'tool_usage':
        await this.supabase.from('chat_tool_usage').insert(data);
        break;
    }
  }

  // Cleanup
  destroy() {
    this.stopSyncInterval();
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', () => this.syncWithServer());
      window.removeEventListener('offline', () => this.stopSyncInterval());
    }
  }
}