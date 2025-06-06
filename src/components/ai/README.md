# AI Chat System

This is a comprehensive AI chat system built with Google Gemini, featuring real-time streaming, MCP tools integration, and full chat persistence.

## Features

- **Google Gemini Integration**: Support for multiple Gemini models (1.5 Flash, 1.5 Pro, 2.0 Flash)
- **Real-time Streaming**: Messages are streamed character by character with thinking/reasoning indicators
- **MCP Tools**: Integrated tools for employee management, searching, and data retrieval
- **Chat Persistence**: Full chat history with local storage fallback and automatic sync
- **Offline Support**: Messages are queued locally when offline and synced when connection is restored
- **Search**: Full-text search across all chat messages
- **Feedback System**: Like, dislike, and comment on AI responses
- **Markdown Support**: Custom markdown components for rich formatting
- **Responsive Design**: Works seamlessly on desktop and mobile

## Setup

1. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env.local` file:
     ```
     NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
     ```

2. **Run Database Migrations**:
   ```bash
   supabase migration up
   ```

3. **Install Dependencies** (if not already installed):
   ```bash
   npm install @google/generative-ai react-markdown remark-gfm framer-motion
   ```

## Usage

### As a Dialog (Floating Button)

Add the AI chat dialog to any page:

```tsx
import { AIChatDialog } from '@/components/ai/ai-chat-dialog';

export default function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <AIChatDialog apiKey={process.env.NEXT_PUBLIC_GEMINI_API_KEY} />
    </div>
  );
}
```

### As a Full Page

The AI chat is available at:
- Organization route: `/[org]/ai`
- Employee route: `/employee/[org]/[contract]/ai`

### Custom Trigger Button

```tsx
<AIChatDialog 
  apiKey={apiKey}
  trigger={
    <Button>
      <Sparkles className="mr-2" />
      Open AI Assistant
    </Button>
  }
/>
```

## MCP Tools

The following tools are available for the AI:

### Employee Management
- `getEmployeeInfo`: Get employee details by ID or email
- `searchEmployees`: Search employees by name, role, or team
- `getTeamInfo`: Get team information and members
- `getLeaveBalance`: Check employee leave balances
- `getAppraisalInfo`: Get appraisal history

### Organization
- `getOrganizationStats`: Get dashboard statistics
- `getOpenRoles`: List open positions
- `searchDocuments`: Search documents and templates
- `getCalendarEvents`: Get calendar events
- `getEmployeeBenefits`: Get compensation details

## Architecture

### Components
- `AIChat`: Main chat interface component
- `AIChatDialog`: Alert dialog wrapper for floating chat
- `AIChatPage`: Full page wrapper
- `ChatContext`: React context for state management
- `markdown-components`: Custom markdown renderers

### Services
- `GeminiService`: Handles Gemini API integration
- `ChatStorageService`: Manages persistence and sync
- `mcp-tools`: MCP tool implementations

### Database Schema
- `chats`: Chat sessions
- `chat_messages`: Individual messages
- `message_feedback`: User feedback on messages
- `chat_tool_usage`: Tool execution tracking

## Customization

### Adding New MCP Tools

1. Add tool definition in `src/lib/ai/mcp-tools.ts`:

```typescript
export const myNewTool: MCPTool = {
  name: 'myToolName',
  description: 'What this tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameter description' }
    },
    required: ['param1']
  },
  handler: async ({ param1 }) => {
    // Tool implementation
    return result;
  }
};
```

2. Add to the tools array in `getAllMCPTools()`.

### Custom Markdown Components

Edit `src/components/ai/markdown-components.tsx` to customize how markdown is rendered.

### Styling

The chat uses Tailwind CSS with a minimal black/white/gray theme. Key classes:
- Chat bubbles: `bg-gray-900` (user), `bg-gray-100` (assistant)
- Animations: Framer Motion for smooth transitions
- Typography: Custom prose styles

## Performance Optimization

- **Local Storage**: Messages are cached locally for instant loading
- **Lazy Loading**: Messages are loaded on-demand when switching chats
- **Debounced Sync**: Changes are synced every 30 seconds
- **Connection Management**: Automatic reconnection on network changes

## Security Considerations

1. **API Key**: Store Gemini API key securely, never commit to version control
2. **Row Level Security**: Database uses RLS to ensure users only see their own chats
3. **Input Validation**: All user inputs are sanitized before processing
4. **Tool Permissions**: MCP tools respect organization boundaries

## Troubleshooting

### "Failed to load chats"
- Check Supabase connection
- Verify RLS policies are correctly set up
- Check browser console for specific errors

### Messages not streaming
- Verify Gemini API key is valid
- Check network connection
- Look for rate limiting errors

### Offline sync not working
- Check localStorage permissions
- Verify sync interval is running
- Look for sync errors in console

## Future Enhancements

- [ ] Voice input/output
- [ ] File attachments
- [ ] Code execution sandbox
- [ ] Multi-language support
- [ ] Export chat history
- [ ] Share conversations
- [ ] Custom AI personas
- [ ] Advanced search filters