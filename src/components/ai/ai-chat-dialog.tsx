'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { AIChat } from './ai-chat';
import { ChatProvider } from './chat-context';

interface AIChatDialogProps {
  apiKey: string;
  trigger?: React.ReactNode;
}

export const AIChatDialog: React.FC<AIChatDialogProps> = ({ 
  apiKey,
  trigger 
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Sparkles className="h-5 w-5" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-full w-full h-full max-h-full p-0 bg-transparent">
        <div className="w-full h-full bg-white rounded-lg overflow-hidden">
          <ChatProvider apiKey={apiKey}>
            <AIChat className="h-full" />
          </ChatProvider>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};