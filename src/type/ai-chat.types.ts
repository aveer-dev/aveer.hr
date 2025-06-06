import { Database } from './database.types';

// Database types - manually defined until database types are regenerated
export interface Chat {
  id: number;
  profile_id: string;
  contract_id: number | null;
  org: string;
  title: string | null;
  model: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  is_archived: boolean;
  metadata: Record<string, any>;
}

export type ChatInsert = Omit<Chat, 'id' | 'created_at' | 'updated_at' | 'last_message_at'> & {
  id?: number;
  created_at?: string;
  updated_at?: string;
  last_message_at?: string;
};

export type ChatUpdate = Partial<ChatInsert>;

export interface ChatMessage {
  id: number;
  chat_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  is_deleted: boolean;
  parent_message_id: number | null;
}

export type ChatMessageInsert = Omit<ChatMessage, 'id' | 'created_at' | 'updated_at'> & {
  id?: number;
  created_at?: string;
  updated_at?: string;
};

export type ChatMessageUpdate = Partial<ChatMessageInsert>;

export interface MessageFeedback {
  id: number;
  message_id: number;
  profile_id: string;
  feedback_type: 'like' | 'dislike' | 'comment';
  comment: string | null;
  created_at: string;
}

export type MessageFeedbackInsert = Omit<MessageFeedback, 'id' | 'created_at'> & {
  id?: number;
  created_at?: string;
};

export interface ChatToolUsage {
  id: number;
  message_id: number;
  tool_name: string;
  tool_input: Record<string, any> | null;
  tool_output: Record<string, any> | null;
  execution_time_ms: number | null;
  created_at: string;
}

export type ChatToolUsageInsert = Omit<ChatToolUsage, 'id' | 'created_at'> & {
  id?: number;
  created_at?: string;
};

// Gemini Models
export const GEMINI_MODELS = {
  'gemini-1.5-flash': 'Gemini 1.5 Flash',
  'gemini-1.5-flash-8b': 'Gemini 1.5 Flash 8B',
  'gemini-1.5-pro': 'Gemini 1.5 Pro',
  'gemini-2.0-flash-exp': 'Gemini 2.0 Flash (Experimental)',
} as const;

export type GeminiModel = keyof typeof GEMINI_MODELS;

// Chat state types
export interface ChatState {
  currentChatId: number | null;
  chats: Chat[];
  messages: Map<number, ChatMessage[]>;
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessage: string;
  thinkingStatus: string | null;
  error: string | null;
  reconnecting: boolean;
}

// Message metadata types
export interface MessageMetadata {
  model?: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  tools?: string[];
  searchResults?: SearchResult[];
  reasoning?: string;
  connectionInterrupted?: boolean;
  resumeToken?: string;
}

// Search result type
export interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  displayLink: string;
}

// Streaming response types
export interface StreamingResponse {
  type: 'thinking' | 'reasoning' | 'content' | 'error' | 'done';
  content?: string;
  error?: string;
  metadata?: MessageMetadata;
}

// MCP Tool types
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (input: any) => Promise<any>;
}

// Chat context type for providers
export interface ChatContextType {
  // State
  currentChat: Chat | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessage: string;
  thinkingStatus: string | null;
  error: string | null;
  selectedModel: GeminiModel;

  // Actions
  createChat: (title?: string) => Promise<Chat>;
  selectChat: (chatId: number) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteChat: (chatId: number) => Promise<void>;
  archiveChat: (chatId: number) => Promise<void>;
  updateChatTitle: (chatId: number, title: string) => Promise<void>;
  setSelectedModel: (model: GeminiModel) => void;
  
  // Message actions
  giveFeedback: (messageId: number, type: 'like' | 'dislike' | 'comment', comment?: string) => Promise<void>;
  deleteMessage: (messageId: number) => Promise<void>;
  regenerateMessage: (messageId: number) => Promise<void>;
  
  // Search
  searchChats: (query: string) => Promise<Array<{chat: Chat, messages: ChatMessage[]}>>;
  
  // Connection management
  reconnect: () => Promise<void>;
  pauseStreaming: () => void;
  resumeStreaming: () => void;
}

// Local storage types
export interface LocalChatData {
  chatId: number;
  messages: ChatMessage[];
  lastSynced: string;
  pendingMessages: ChatMessageInsert[];
}

// Event types for streaming
export interface StreamEvent {
  type: 'start' | 'chunk' | 'end' | 'error' | 'thinking';
  data?: any;
  error?: Error;
}