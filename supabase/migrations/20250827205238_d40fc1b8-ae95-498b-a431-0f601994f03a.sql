-- Create reading_progress table to track user progress through books
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

-- Enable Row Level Security
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for reading progress
CREATE POLICY "Users can view their own reading progress" 
ON public.reading_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reading progress" 
ON public.reading_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress" 
ON public.reading_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading progress" 
ON public.reading_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reading_progress_updated_at
BEFORE UPDATE ON public.reading_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_reading_progress_user_book ON public.reading_progress(user_id, book_id);
CREATE INDEX idx_reading_progress_session ON public.reading_progress(session_id);
CREATE INDEX idx_reading_progress_last_read ON public.reading_progress(last_read_at);

-- Create reading_statistics table for daily/weekly stats
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

-- Enable Row Level Security
ALTER TABLE public.reading_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies for reading statistics
CREATE POLICY "Users can view their own reading statistics" 
ON public.reading_statistics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reading statistics" 
ON public.reading_statistics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading statistics" 
ON public.reading_statistics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reading_statistics_updated_at
BEFORE UPDATE ON public.reading_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_reading_statistics_user_date ON public.reading_statistics(user_id, date);
CREATE INDEX idx_reading_statistics_date ON public.reading_statistics(date);