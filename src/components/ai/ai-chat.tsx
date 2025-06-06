'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { 
  Send, 
  Plus, 
  Search, 
  Menu, 
  X, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  Trash2,
  RefreshCw,
  Settings,
  Sparkles,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from './chat-context';
import { GEMINI_MODELS, Chat, ChatMessage } from '@/type/ai-chat.types';
// We'll use a simple markdown renderer since react-markdown might not be installed
import { markdownComponents } from './markdown-components';

interface AIChatProps {
  className?: string;
}

export const AIChat: React.FC<AIChatProps> = ({ className }) => {
  const {
    currentChat,
    messages,
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
    updateChatTitle,
    setSelectedModel,
    giveFeedback,
    deleteMessage,
    regenerateMessage,
    searchChats,
  } = useChat();

  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{chat: Chat, messages: ChatMessage[]}>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [feedbackMessageId, setFeedbackMessageId] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sidebar mouse interactions
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX < 20 && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Group chats by date
  const groupChatsByDate = (chats: Chat[]) => {
    const groups: Record<string, Chat[]> = {};

    chats.forEach(chat => {
      const date = parseISO(chat.last_message_at);
      let groupKey: string;

      if (isToday(date)) {
        groupKey = 'Today';
      } else if (isYesterday(date)) {
        groupKey = 'Yesterday';
      } else {
        groupKey = format(date, 'MMMM d, yyyy');
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(chat);
    });

    return groups;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    
    if (!currentChat) {
      await createChat('New Chat');
    }
    
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await searchChats(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const renderMessage = (content: string) => {
    // Simple markdown parsing - in production, use react-markdown
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Code blocks
      if (line.startsWith('```')) {
        return null; // Handle multi-line code blocks separately
      }
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-semibold mt-3 mb-2">{line.slice(3)}</h2>;
      }
      // Lists
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
      }
      // Bold/Italic
      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-gray-100 rounded text-sm">$1</code>');
      
      return (
        <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  return (
    <div className={cn("flex h-full bg-white", className)}>
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-80 bg-gray-50 border-r flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Chats</h2>
                <Button
                  size="sm"
                  onClick={() => createChat()}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Chat
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {searchResults.length > 0 ? (
                  // Search Results
                  <div>
                    <p className="text-sm text-gray-500 px-2 py-1">
                      {searchResults.length} results
                    </p>
                    {searchResults.map(({ chat, messages }) => (
                      <div key={chat.id} className="mb-2">
                        <button
                          onClick={() => {
                            selectChat(chat.id);
                            setSearchResults([]);
                            setSearchQuery('');
                          }}
                          className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium text-sm">{chat.title}</div>
                          {messages.map((msg, i) => (
                            <div key={i} className="text-xs text-gray-500 mt-1 truncate">
                              {msg.content}
                            </div>
                          ))}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Regular Chat List
                  Object.entries(groupChatsByDate([])).map(([date, chats]) => (
                    <div key={date} className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">
                        {date}
                      </h3>
                      {chats.map(chat => (
                        <button
                          key={chat.id}
                          onClick={() => selectChat(chat.id)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg mb-1 transition-colors",
                            currentChat?.id === chat.id
                              ? "bg-gray-900 text-white"
                              : "hover:bg-gray-100"
                          )}
                        >
                          <div className="font-medium text-sm truncate">
                            {chat.title || 'Untitled Chat'}
                          </div>
                          <div className="text-xs opacity-60 mt-1">
                            {format(parseISO(chat.last_message_at), 'h:mm a')}
                          </div>
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b p-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div>
              <h1 className="font-semibold">
                {currentChat?.title || 'New Chat'}
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="h-3 w-3" />
                {GEMINI_MODELS[selectedModel]}
              </div>
            </div>
          </div>

          {/* Model Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {GEMINI_MODELS[selectedModel]}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(GEMINI_MODELS).map(([key, name]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setSelectedModel(key as any)}
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
                <p className="text-gray-500">
                  Ask me anything about your organization
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                    onMouseEnter={() => setHoveredMessageId(message.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "rounded-lg px-4 py-3 max-w-[80%]",
                        message.role === 'user'
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100"
                      )}
                    >
                      <div className="prose prose-sm max-w-none">
                        {renderMessage(message.content)}
                      </div>
                      
                      {/* Message Actions */}
                      <AnimatePresence>
                        {hoveredMessageId === message.id && message.role === 'assistant' && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200"
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => giveFeedback(message.id, 'like')}
                              className="h-7 w-7 p-0"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => giveFeedback(message.id, 'dislike')}
                              className="h-7 w-7 p-0"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => regenerateMessage(message.id)}
                              className="h-7 w-7 p-0"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <div className="space-y-3">
                                  <h4 className="font-medium text-sm">Add Comment</h4>
                                  <Textarea
                                    placeholder="Share your feedback..."
                                    value={feedbackComment}
                                    onChange={(e) => setFeedbackComment(e.target.value)}
                                    className="min-h-[80px]"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      giveFeedback(message.id, 'comment', feedbackComment);
                                      setFeedbackComment('');
                                    }}
                                  >
                                    Submit
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
                
                {/* Thinking/Streaming Status */}
                {(thinkingStatus || isStreaming) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      {thinkingStatus ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {thinkingStatus}
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[60px] pr-12 resize-none"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute bottom-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                  input.trim() && !isLoading
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-200 text-gray-400"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </motion.button>
            </div>
            
            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};