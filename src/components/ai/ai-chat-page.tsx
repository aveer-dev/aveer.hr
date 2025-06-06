'use client';

import React from 'react';
import { AIChat } from './ai-chat';
import { ChatProvider } from './chat-context';

interface AIChatPageProps {
  apiKey: string;
}

export const AIChatPage: React.FC<AIChatPageProps> = ({ apiKey }) => {
  return (
    <div className="h-screen w-full">
      <ChatProvider apiKey={apiKey}>
        <AIChat className="h-full" />
      </ChatProvider>
    </div>
  );
};