-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
    id SERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    contract_id INTEGER REFERENCES public.contracts(id) ON DELETE SET NULL,
    org VARCHAR(255) NOT NULL REFERENCES public.organisations(subdomain) ON DELETE CASCADE,
    title VARCHAR(255),
    model VARCHAR(100) DEFAULT 'gemini-1.5-flash',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    model VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    is_deleted BOOLEAN DEFAULT FALSE,
    parent_message_id INTEGER REFERENCES public.chat_messages(id) ON DELETE SET NULL
);

-- Create message feedback table
CREATE TABLE IF NOT EXISTS public.message_feedback (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('like', 'dislike', 'comment')),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat tools usage table for MCP tracking
CREATE TABLE IF NOT EXISTS public.chat_tool_usage (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    tool_name VARCHAR(255) NOT NULL,
    tool_input JSONB,
    tool_output JSONB,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_chats_profile_id ON public.chats(profile_id);
CREATE INDEX idx_chats_org ON public.chats(org);
CREATE INDEX idx_chats_last_message_at ON public.chats(last_message_at DESC);
CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_message_feedback_message_id ON public.message_feedback(message_id);

-- Enable full text search on messages
ALTER TABLE public.chat_messages ADD COLUMN search_vector tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;
CREATE INDEX idx_chat_messages_search ON public.chat_messages USING GIN(search_vector);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update chat's last_message_at when a message is inserted
CREATE OR REPLACE FUNCTION update_chat_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chats 
    SET last_message_at = NEW.created_at 
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_last_message_after_insert
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_chat_last_message_at();

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_tool_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own chats" ON public.chats
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can create their own chats" ON public.chats
    FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own chats" ON public.chats
    FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own chats" ON public.chats
    FOR DELETE USING (profile_id = auth.uid());

CREATE POLICY "Users can view messages from their chats" ON public.chat_messages
    FOR SELECT USING (
        chat_id IN (SELECT id FROM public.chats WHERE profile_id = auth.uid())
    );

CREATE POLICY "Users can create messages in their chats" ON public.chat_messages
    FOR INSERT WITH CHECK (
        chat_id IN (SELECT id FROM public.chats WHERE profile_id = auth.uid())
    );

CREATE POLICY "Users can update their own messages" ON public.chat_messages
    FOR UPDATE USING (
        chat_id IN (SELECT id FROM public.chats WHERE profile_id = auth.uid())
    );

CREATE POLICY "Users can view feedback on messages in their chats" ON public.message_feedback
    FOR SELECT USING (
        message_id IN (
            SELECT m.id FROM public.chat_messages m
            JOIN public.chats c ON m.chat_id = c.id
            WHERE c.profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can create feedback" ON public.message_feedback
    FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can view tool usage in their chats" ON public.chat_tool_usage
    FOR SELECT USING (
        message_id IN (
            SELECT m.id FROM public.chat_messages m
            JOIN public.chats c ON m.chat_id = c.id
            WHERE c.profile_id = auth.uid()
        )
    );