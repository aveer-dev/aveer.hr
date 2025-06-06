import { GeminiModel, StreamingResponse, MCPTool, MessageMetadata } from '@/type/ai-chat.types';

// Since @google/generative-ai might not be installed, let's create a mock for now
// In production, replace this with actual import: import { GoogleGenerativeAI } from '@google/generative-ai';

interface GenerativeModel {
  generateContentStream: (request: any) => AsyncGenerator<any>;
  generateContent: (request: any) => Promise<any>;
}

interface ChatSession {
  sendMessageStream: (message: string) => AsyncGenerator<any>;
  sendMessage: (message: string) => Promise<any>;
  getHistory: () => any[];
}

// Mock Gemini service until package is installed
class MockGoogleGenerativeAI {
  constructor(apiKey: string) {}
  
  getGenerativeModel(config: { model: string }): GenerativeModel {
    return {
      async *generateContentStream(request: any) {
        // Mock streaming response
        const mockResponse = "This is a mock response. Please install @google/generative-ai package to use real Gemini AI.";
        for (const char of mockResponse) {
          yield {
            candidates: [{
              content: {
                parts: [{ text: char }]
              }
            }]
          };
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      },
      async generateContent(request: any) {
        return {
          response: {
            text: () => "Mock response"
          }
        };
      }
    };
  }
}

export class GeminiService {
  private genAI: any;
  private model: GenerativeModel | null = null;
  private session: ChatSession | null = null;
  private tools: Map<string, MCPTool> = new Map();
  private abortController: AbortController | null = null;

  constructor(apiKey: string) {
    // Use mock until real package is installed
    this.genAI = new MockGoogleGenerativeAI(apiKey);
  }

  // Initialize model with selected Gemini version
  initModel(modelName: GeminiModel) {
    this.model = this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });
  }

  // Register MCP tools
  registerTool(tool: MCPTool) {
    this.tools.set(tool.name, tool);
  }

  // Start a new chat session
  startChat(history: Array<{ role: string; parts: string }> = []) {
    if (!this.model) throw new Error('Model not initialized');
    
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts }]
    }));

    // Create chat session with tools if available
    const chatConfig: any = {
      history: formattedHistory,
    };

    if (this.tools.size > 0) {
      chatConfig.tools = Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      }));
    }

    // Mock chat session
    this.session = {
      async *sendMessageStream(message: string) {
        const mockResponse = `Mock response to: ${message}`;
        for (const char of mockResponse) {
          yield {
            candidates: [{
              content: {
                parts: [{ text: char }]
              }
            }]
          };
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      },
      async sendMessage(message: string) {
        return {
          response: {
            text: () => `Mock response to: ${message}`
          }
        };
      },
      getHistory() {
        return formattedHistory;
      }
    };
  }

  // Stream a message with thinking/reasoning support
  async *streamMessage(
    message: string,
    onThinking?: (status: string) => void
  ): AsyncGenerator<StreamingResponse> {
    if (!this.session) throw new Error('Chat session not started');

    this.abortController = new AbortController();

    try {
      // Send thinking status
      if (onThinking) {
        onThinking('Analyzing your request...');
      }
      yield { type: 'thinking', content: 'Analyzing your request...' };

      // Add reasoning phase
      yield { type: 'reasoning', content: 'Processing context and preparing response...' };

      // Stream the actual response
      const stream = this.session.sendMessageStream(message);
      let fullContent = '';

      for await (const chunk of stream) {
        if (this.abortController.signal.aborted) {
          yield { type: 'error', error: 'Stream aborted' };
          break;
        }

        const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
        fullContent += text;
        
        yield { type: 'content', content: text };

        // Handle function calls if present
        const functionCall = chunk.candidates?.[0]?.content?.parts?.find((part: any) => part.functionCall);
        if (functionCall) {
          const tool = this.tools.get(functionCall.functionCall.name);
          if (tool) {
            try {
              const result = await tool.handler(functionCall.functionCall.args);
              yield { 
                type: 'content', 
                content: `\n\n[Tool: ${tool.name}]\n${JSON.stringify(result, null, 2)}\n\n`,
                metadata: { tools: [tool.name] }
              };
            } catch (error) {
              yield { 
                type: 'error', 
                error: `Tool error: ${error instanceof Error ? error.message : 'Unknown error'}` 
              };
            }
          }
        }
      }

      yield { type: 'done', content: fullContent };
    } catch (error) {
      yield { 
        type: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      this.abortController = null;
    }
  }

  // Stop streaming
  stopStreaming() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  // Get chat history
  getChatHistory() {
    return this.session?.getHistory() || [];
  }

  // Search functionality (mock for now)
  async search(query: string): Promise<any[]> {
    // This would integrate with Google Search API if available
    return [
      {
        title: 'Mock Search Result',
        snippet: `Mock result for query: ${query}`,
        link: 'https://example.com',
        displayLink: 'example.com'
      }
    ];
  }

  // Export chat history
  exportChatHistory() {
    const history = this.getChatHistory();
    return {
      timestamp: new Date().toISOString(),
      model: this.model,
      messages: history,
      tools: Array.from(this.tools.keys()),
    };
  }
}