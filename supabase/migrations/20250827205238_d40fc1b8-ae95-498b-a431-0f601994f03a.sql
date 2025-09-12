-- Idempotent creation of reading_progress table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'reading_progress'
  ) THEN
    CREATE TABLE public.reading_progress (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL,
      book_id UUID NOT NULL,
      session_id UUID,
      progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
      current_position INTEGER NOT NULL DEFAULT 0,
      total_length INTEGER,
      words_read INTEGER DEFAULT 0,
      reading_speed_wpm INTEGER DEFAULT 0,
      time_spent_seconds INTEGER DEFAULT 0,
      last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  END IF;
END$$;

-- Enable Row Level Security
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for reading progress
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reading_progress' AND policyname='Users can view their own reading progress') THEN
    CREATE POLICY "Users can view their own reading progress" 
    ON public.reading_progress 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reading_progress' AND policyname='Users can create their own reading progress') THEN
    CREATE POLICY "Users can create their own reading progress" 
    ON public.reading_progress 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reading_progress' AND policyname='Users can update their own reading progress') THEN
    CREATE POLICY "Users can update their own reading progress" 
    ON public.reading_progress 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reading_progress' AND policyname='Users can delete their own reading progress') THEN
    CREATE POLICY "Users can delete their own reading progress" 
    ON public.reading_progress 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create trigger for automatic timestamp updates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_reading_progress_updated_at'
  ) THEN
    CREATE TRIGGER update_reading_progress_updated_at
    BEFORE UPDATE ON public.reading_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create indexes for better performance
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_reading_progress_user_book') THEN
    CREATE INDEX idx_reading_progress_user_book ON public.reading_progress(user_id, book_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_reading_progress_session') THEN
    CREATE INDEX idx_reading_progress_session ON public.reading_progress(session_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_reading_progress_last_read') THEN
    CREATE INDEX idx_reading_progress_last_read ON public.reading_progress(last_read_at);
  END IF;
END $$;

-- Create reading_statistics table for daily/weekly stats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'reading_statistics'
  ) THEN
    CREATE TABLE public.reading_statistics (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL,
      date DATE NOT NULL,
      total_time_seconds INTEGER NOT NULL DEFAULT 0,
      words_read INTEGER NOT NULL DEFAULT 0,
      pages_read INTEGER NOT NULL DEFAULT 0,
      sessions_count INTEGER NOT NULL DEFAULT 0,
      average_speed_wpm INTEGER DEFAULT 0,
      books_started INTEGER DEFAULT 0,
      books_completed INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(user_id, date)
    );
  END IF;
END$$;

-- Enable Row Level Security
ALTER TABLE public.reading_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies for reading statistics
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reading_statistics' AND policyname='Users can view their own reading statistics') THEN
    CREATE POLICY "Users can view their own reading statistics" 
    ON public.reading_statistics 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reading_statistics' AND policyname='Users can create their own reading statistics') THEN
    CREATE POLICY "Users can create their own reading statistics" 
    ON public.reading_statistics 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reading_statistics' AND policyname='Users can update their own reading statistics') THEN
    CREATE POLICY "Users can update their own reading statistics" 
    ON public.reading_statistics 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create trigger for automatic timestamp updates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_reading_statistics_updated_at'
  ) THEN
    CREATE TRIGGER update_reading_statistics_updated_at
    BEFORE UPDATE ON public.reading_statistics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create index for better performance
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_reading_statistics_user_date') THEN
    CREATE INDEX idx_reading_statistics_user_date ON public.reading_statistics(user_id, date);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_reading_statistics_date') THEN
    CREATE INDEX idx_reading_statistics_date ON public.reading_statistics(date);
  END IF;
END $$;