'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/hooks/use-user';
import { useParams } from 'next/navigation';
import { GeminiService } from '@/lib/ai/gemini.service';
import { ChatStorageService } from '@/lib/ai/chat-storage.service';
import { getAllMCPTools } from '@/lib/ai/mcp-tools';
import {
  Chat,
  ChatMessage,
  GeminiModel,
  ChatContextType,
  MessageFeedbackInsert,
  ChatToolUsageInsert,
  StreamingResponse,
} from '@/type/ai-chat.types';
import { toast } from 'sonner';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
  apiKey: string;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children, apiKey }) => {
  const { user } = useUser();
  const params = useParams();
  const org = params.org as string;

  // Services
  const geminiServiceRef = useRef<GeminiService | null>(null);
  const storageServiceRef = useRef<ChatStorageService | null>(null);

  // State
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Map<number, ChatMessage[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [thinkingStatus, setThinkingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-1.5-flash');

  // Initialize services
  useEffect(() => {
    if (!geminiServiceRef.current) {
      geminiServiceRef.current = new GeminiService(apiKey);
      geminiServiceRef.current.initModel(selectedModel);

      // Register MCP tools
      const tools = getAllMCPTools();
      tools.forEach(tool => {
        geminiServiceRef.current!.registerTool(tool);
      });
    }

    if (!storageServiceRef.current) {
      storageServiceRef.current = new ChatStorageService();
    }

    return () => {
      storageServiceRef.current?.destroy();
    };
  }, [apiKey, selectedModel]);

  // Load chats on mount
  useEffect(() => {
    if (user && org && storageServiceRef.current) {
      loadChats();
    }
  }, [user, org]);

  const loadChats = async () => {
    if (!user || !storageServiceRef.current) return;

    try {
      const loadedChats = await storageServiceRef.current.initialize(user.id, org);
      setChats(loadedChats);

      // Load messages for the most recent chat
      if (loadedChats.length > 0 && !currentChatId) {
        await selectChat(loadedChats[0].id);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    }
  };

  const createChat = async (title?: string): Promise<Chat> => {
    if (!user || !storageServiceRef.current) {
      throw new Error('Not authenticated');
    }

    try {
      const newChat = await storageServiceRef.current.createChat({
        profile_id: user.id,
        org,
        title: title || 'New Chat',
        model: selectedModel,
        is_archived: false,
        metadata: {},
      });

      setChats(prev => [newChat, ...prev]);
      await selectChat(newChat.id);
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
      throw error;
    }
  };

  const selectChat = async (chatId: number) => {
    if (!storageServiceRef.current) return;

    try {
      setCurrentChatId(chatId);
      
      // Load messages if not already loaded
      if (!messages.has(chatId)) {
        const chatMessages = await storageServiceRef.current.getMessages(chatId);
        setMessages(prev => new Map(prev).set(chatId, chatMessages));
      }

      // Initialize Gemini chat session with history
      const chatMessages = messages.get(chatId) || [];
      const history = chatMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: msg.content,
      }));

      geminiServiceRef.current?.startChat(history);
    } catch (error) {
      console.error('Error selecting chat:', error);
      toast.error('Failed to load chat');
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentChatId || !user || !storageServiceRef.current || !geminiServiceRef.current) {
      toast.error('Please select a chat first');
      return;
    }

    try {
      setIsLoading(true);
      setIsStreaming(true);
      setError(null);
      setStreamingMessage('');

      // Save user message
      const userMessage = await storageServiceRef.current.saveMessage({
        chat_id: currentChatId,
        role: 'user',
        content,
        model: null,
        metadata: {},
        is_deleted: false,
        parent_message_id: null,
      });

      // Update local state
      setMessages(prev => {
        const updated = new Map(prev);
        const chatMessages = updated.get(currentChatId) || [];
        updated.set(currentChatId, [...chatMessages, userMessage]);
        return updated;
      });

      // Create assistant message placeholder
      const assistantMessagePlaceholder: ChatMessage = {
        id: Date.now(),
        chat_id: currentChatId,
        role: 'assistant',
        content: '',
        model: selectedModel,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {},
        is_deleted: false,
        parent_message_id: null,
      };

      setMessages(prev => {
        const updated = new Map(prev);
        const chatMessages = updated.get(currentChatId) || [];
        updated.set(currentChatId, [...chatMessages, assistantMessagePlaceholder]);
        return updated;
      });

      // Stream response
      let fullResponse = '';
      const startTime = Date.now();

      for await (const chunk of geminiServiceRef.current.streamMessage(content, setThinkingStatus)) {
        handleStreamingChunk(chunk, assistantMessagePlaceholder.id, fullResponse);
        
        if (chunk.type === 'content') {
          fullResponse += chunk.content || '';
        }
      }

      // Save complete assistant message
      const assistantMessage = await storageServiceRef.current.saveMessage({
        chat_id: currentChatId,
        role: 'assistant',
        content: fullResponse,
        model: selectedModel,
        metadata: {
          temperature: 0.7,
          executionTime: Date.now() - startTime,
        },
        is_deleted: false,
        parent_message_id: userMessage.id,
      });

      // Update with real message
      setMessages(prev => {
        const updated = new Map(prev);
        const chatMessages = updated.get(currentChatId) || [];
        const filtered = chatMessages.filter(m => m.id !== assistantMessagePlaceholder.id);
        updated.set(currentChatId, [...filtered, assistantMessage]);
        return updated;
      });

      // Update chat's last message time
      await storageServiceRef.current.updateChat(currentChatId, {
        last_message_at: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setThinkingStatus(null);
      setStreamingMessage('');
    }
  };

  const handleStreamingChunk = (chunk: StreamingResponse, messageId: number, currentContent: string) => {
    switch (chunk.type) {
      case 'thinking':
        setThinkingStatus(chunk.content || null);
        break;
      case 'reasoning':
        // Could show reasoning in UI if desired
        break;
      case 'content':
        setStreamingMessage(prev => prev + (chunk.content || ''));
        // Update message in real-time
        setMessages(prev => {
          const updated = new Map(prev);
          const chatMessages = updated.get(currentChatId!) || [];
          const msgIndex = chatMessages.findIndex(m => m.id === messageId);
          if (msgIndex !== -1) {
            chatMessages[msgIndex] = {
              ...chatMessages[msgIndex],
              content: currentContent + (chunk.content || ''),
            };
            updated.set(currentChatId!, [...chatMessages]);
          }
          return updated;
        });
        break;
      case 'error':
        setError(chunk.error || 'Unknown error');
        toast.error(chunk.error || 'Unknown error');
        break;
    }
  };

  const giveFeedback = async (messageId: number, type: 'like' | 'dislike' | 'comment', comment?: string) => {
    if (!user || !storageServiceRef.current) return;

    try {
      await storageServiceRef.current.saveFeedback({
        message_id: messageId,
        profile_id: user.id,
        feedback_type: type,
        comment: comment || null,
      });

      toast.success('Feedback saved');
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Failed to save feedback');
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!storageServiceRef.current || !currentChatId) return;

    try {
      await storageServiceRef.current.deleteMessage(messageId);
      
      setMessages(prev => {
        const updated = new Map(prev);
        const chatMessages = updated.get(currentChatId) || [];
        updated.set(currentChatId, chatMessages.filter(m => m.id !== messageId));
        return updated;
      });

      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const regenerateMessage = async (messageId: number) => {
    if (!currentChatId) return;

    const chatMessages = messages.get(currentChatId) || [];
    const messageIndex = chatMessages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1 || messageIndex === 0) return;

    // Get the previous user message
    const userMessage = chatMessages[messageIndex - 1];
    if (userMessage.role !== 'user') return;

    // Delete the assistant message
    await deleteMessage(messageId);

    // Resend the user message
    await sendMessage(userMessage.content);
  };

  const deleteChat = async (chatId: number) => {
    if (!storageServiceRef.current) return;

    try {
      await storageServiceRef.current.updateChat(chatId, { is_archived: true });
      
      setChats(prev => prev.filter(c => c.id !== chatId));
      
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }

      toast.success('Chat deleted');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const archiveChat = async (chatId: number) => {
    await deleteChat(chatId); // Same as delete for now
  };

  const updateChatTitle = async (chatId: number, title: string) => {
    if (!storageServiceRef.current) return;

    try {
      await storageServiceRef.current.updateChat(chatId, { title });
      
      setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, title } : c
      ));

      toast.success('Chat title updated');
    } catch (error) {
      console.error('Error updating chat title:', error);
      toast.error('Failed to update chat title');
    }
  };

  const searchChats = async (query: string) => {
    if (!user || !storageServiceRef.current) return [];

    try {
      return await storageServiceRef.current.searchChats(user.id, query);
    } catch (error) {
      console.error('Error searching chats:', error);
      toast.error('Failed to search chats');
      return [];
    }
  };

  const reconnect = async () => {
    // Reconnection is handled automatically by the storage service
    await loadChats();
  };

  const pauseStreaming = () => {
    geminiServiceRef.current?.stopStreaming();
  };

  const resumeStreaming = () => {
    // Not implemented - would need to track position and resume
  };

  const value: ChatContextType = {
    currentChat: chats.find(c => c.id === currentChatId) || null,
    messages: messages.get(currentChatId || 0) || [],
    isLoading,
    isStreaming,
    streamingMessage,
    thinkingStatus,
    error,
    selectedModel,
    createChat,
    selectChat,
    sendMessage,
    deleteChat,
    archiveChat,
    updateChatTitle,
    setSelectedModel,
    giveFeedback,
    deleteMessage,
    regenerateMessage,
    searchChats,
    reconnect,
    pauseStreaming,
    resumeStreaming,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};