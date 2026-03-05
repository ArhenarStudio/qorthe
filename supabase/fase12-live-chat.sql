-- ═══════════════════════════════════════════════════════════════
-- DavidSon's Design — Supabase Tables: Live Chat
-- Fase 12.Chat: Customer ↔ Admin real-time messaging
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ══════════════════════════════════
-- TABLE: chat_conversations
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email text NOT NULL,
  customer_name text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'waiting')),
  unread_admin integer DEFAULT 0,
  unread_customer integer DEFAULT 0,
  last_message_at timestamptz DEFAULT now(),
  last_message_preview text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_email ON public.chat_conversations(customer_email);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON public.chat_conversations(status);

-- ══════════════════════════════════
-- TABLE: chat_messages
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('customer', 'admin', 'system')),
  text text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at DESC);

-- ══════════════════════════════════
-- RLS
-- ══════════════════════════════════
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Customers can see their own conversations
CREATE POLICY "Users can view own conversations"
  ON public.chat_conversations FOR SELECT
  USING (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Service role can manage all (admin)
CREATE POLICY "Service role manages all conversations"
  ON public.chat_conversations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own messages"
  ON public.chat_messages FOR SELECT
  USING (conversation_id IN (
    SELECT id FROM public.chat_conversations
    WHERE customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ));

CREATE POLICY "Users can insert own messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (conversation_id IN (
    SELECT id FROM public.chat_conversations
    WHERE customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ) AND sender = 'customer');

CREATE POLICY "Service role manages all messages"
  ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════
-- TRIGGERS
-- ══════════════════════════════════
CREATE TRIGGER chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime on both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
