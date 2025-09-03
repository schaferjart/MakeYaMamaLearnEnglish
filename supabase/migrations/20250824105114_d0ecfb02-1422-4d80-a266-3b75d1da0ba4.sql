-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  locale VARCHAR DEFAULT 'de',
  cefr_level VARCHAR CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')) DEFAULT 'B1',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  year INT,
  cover_url TEXT,
  source TEXT,
  opf_json JSONB,
  epub_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on books (public read access)
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Books are readable by everyone
CREATE POLICY "Books are publicly readable" ON public.books
  FOR SELECT USING (true);

-- Create book progress table
CREATE TABLE public.book_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  last_cfi TEXT,
  percent NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);

-- Enable RLS on book progress
ALTER TABLE public.book_progress ENABLE ROW LEVEL SECURITY;

-- Users can only access their own progress
CREATE POLICY "Users can view own progress" ON public.book_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.book_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.book_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create vocabulary table
CREATE TABLE public.vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  cfi TEXT,
  headword TEXT NOT NULL,
  lemma TEXT,
  pos TEXT,
  sense TEXT,
  synonym TEXT,
  translation_de TEXT,
  example TEXT,
  difficulty INT CHECK (difficulty >= 1 AND difficulty <= 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on vocabulary
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;

-- Users can only access their own vocabulary
CREATE POLICY "Users can view own vocabulary" ON public.vocabulary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary" ON public.vocabulary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary" ON public.vocabulary
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vocabulary" ON public.vocabulary
  FOR DELETE USING (auth.uid() = user_id);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  read_ms INT DEFAULT 0,
  talk_ms INT DEFAULT 0
);

-- Enable RLS on sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  messages_jsonb JSONB,
  transcript_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Users can only access conversations from their own sessions
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions 
      WHERE sessions.id = conversations.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert conversations for own sessions" ON public.conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions 
      WHERE sessions.id = conversations.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('ebooks', 'ebooks', false),
  ('covers', 'covers', true);

-- Create storage policies for ebooks (admin only for upload, users can read)
CREATE POLICY "Authenticated users can view ebooks" ON storage.objects
  FOR SELECT USING (bucket_id = 'ebooks' AND auth.role() = 'authenticated');

-- Create storage policies for covers (public read)
CREATE POLICY "Anyone can view covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, locale, cefr_level)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'locale', 'de'),
    COALESCE(NEW.raw_user_meta_data ->> 'cefr_level', 'B1')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_progress_updated_at
  BEFORE UPDATE ON public.book_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();