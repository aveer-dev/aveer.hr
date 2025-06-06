'use client';

import { AIChatPage } from '@/components/ai/ai-chat-page';

export default function EmployeeAIPage() {
  // In production, get the API key from environment variables or secure storage
  // For now, using a placeholder - replace with actual implementation
  const apiKey = typeof window !== 'undefined' 
    ? (window as any).GEMINI_API_KEY || 'your-gemini-api-key' 
    : 'your-gemini-api-key';

  return <AIChatPage apiKey={apiKey} />;
}