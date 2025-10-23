import { supabase } from '@/integrations/supabase/client'
import { SUPPORTED_LANGUAGES, type LanguageCode, type LanguagePair } from '@/lib/languages'

export interface WordLookupResult {
  word: string
  lemma: string
  headword: string
  pos: string | null
  sense: string | null
  example: string | null
  definitions: Array<{
    text: string
    partOfSpeech: string
    source: string
  }>
  examples: string[]
}

export interface TranslationResult {
  translation: string
  detected_source_language?: string
}

export const lookupWord = async (word: string): Promise<WordLookupResult> => {
  const { data, error } = await supabase.functions.invoke('wordnik-lookup', {
    body: { word }
  })

  if (error) {
    throw new Error(`Word lookup failed: ${error.message}`)
  }

  return data
}

export const translateText = async (
  text: string,
  fromLang: LanguageCode,
  toLang: LanguageCode
): Promise<TranslationResult> => {
  const fromCode = SUPPORTED_LANGUAGES[fromLang]?.deeplCode;
  const toCode = SUPPORTED_LANGUAGES[toLang]?.deeplCode;
  
  const { data, error } = await supabase.functions.invoke('deepl-translate', {
    body: { 
      text, 
      target_lang: toCode,
      source_lang: fromCode 
    }
  });

  if (error) {
    throw new Error(`Translation failed: ${error.message}`);
  }

  return data;
};

export const syncBooksFromStorage = async () => {
  console.log('Calling sync-books edge function...');
  const { data, error } = await supabase.functions.invoke('sync-books')
  console.log('Edge function response:', { data, error });

  if (error) {
    throw new Error(`Book sync failed: ${error.message}`)
  }

  return data
}


export interface VocabularyEntry {
  id?: string
  headword: string
  lemma?: string
  pos?: string
  sense?: string
  example?: string
  synonym?: string
  translation_de?: string
  translation_en?: string
  translation_fr?: string
  translation_hi?: string
  book_id?: string
  cfi?: string
  user_id?: string
  source_language?: string
  target_language?: string
}

export const saveVocabulary = async (vocabularyData: VocabularyEntry): Promise<VocabularyEntry> => {
  const { data, error } = await supabase
    .from('vocabulary')
    .insert({
      headword: vocabularyData.headword,
      lemma: vocabularyData.lemma,
      pos: vocabularyData.pos,
      sense: vocabularyData.sense,
      example: vocabularyData.example,
      synonym: vocabularyData.synonym,
      translation_de: vocabularyData.translation_de,
      translation_en: vocabularyData.translation_en,
      translation_fr: vocabularyData.translation_fr,
      translation_hi: vocabularyData.translation_hi,
      source_language: vocabularyData.source_language,
      target_language: vocabularyData.target_language,
      book_id: vocabularyData.book_id,
      cfi: vocabularyData.cfi,
      user_id: vocabularyData.user_id
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save vocabulary: ${error.message}`)
  }

  return data
}

export const getUserVocabulary = async (bookId?: string): Promise<VocabularyEntry[]> => {
  let query = supabase
    .from('vocabulary')
    .select('*')
    .order('created_at', { ascending: false })

  if (bookId) {
    query = query.eq('book_id', bookId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch vocabulary: ${error.message}`)
  }

  return data || []
}

export interface AiTutorReply {
  reply: string
}

export const invokeAiTutor = async (args: {
  sessionId?: string
  userMessage?: string
  cefrLevel?: string | null
  bookId?: string
  readContentSummary?: string
  history?: Array<{ role: 'user' | 'ai'; content: string }>
  sourceLanguage?: string // NEW: Language being learned
  targetLanguage?: string // NEW: User's native language
}): Promise<AiTutorReply> => {
  const { data, error } = await supabase.functions.invoke('ai-tutor', {
    body: args
  })

  if (error) {
    throw new Error(`AI Tutor failed: ${error.message}`)
  }

  return data
}

export interface WhisperSTTResult {
  text: string
}

export const whisperTranscribe = async (audioBlob: Blob, language: string = 'en'): Promise<WhisperSTTResult> => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('language', language) // Pass the language parameter

  const { data, error } = await supabase.functions.invoke('whisper-stt', {
    body: formData
  })

  if (error) {
    throw new Error(`Transcription failed: ${error.message}`)
  }

  return data
}

export interface ConversationEntry {
  id: string
  session_id?: string | null
  messages_jsonb?: any
  transcript_text?: string | null
  created_at: string | null
  sessions: {
    book_id: string | null
  } | null
}

export const getUserConversations = async (bookId?: string): Promise<ConversationEntry[]> => {
  let query = supabase
    .from('conversations')
    .select('id, session_id, messages_jsonb, transcript_text, created_at, sessions(book_id)')
    .order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`)
  }

  return data || []
}

// Language Pair Management Functions
export const getUserLanguagePairs = async (): Promise<LanguagePair[]> => {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('User not authenticated, returning empty array');
      return [];
    }

    const { data, error } = await supabase
      .from('user_language_pairs')
      .select('*')
      .eq('user_id', user.id) // Explicitly filter by user_id
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet, return empty array
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('user_language_pairs table not found, returning empty array');
        return [];
      }
      throw new Error(`Failed to fetch language pairs: ${error.message}`);
    }

    return (data || []) as LanguagePair[];
  } catch (error) {
    console.log('Error fetching language pairs:', error);
    return []; // Return empty array as fallback
  }
};

export const createLanguagePair = async (
  sourceLanguage: LanguageCode, 
  targetLanguage: LanguageCode
): Promise<LanguagePair> => {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User must be authenticated to create language pairs');
    }

    const { data, error } = await supabase
      .from('user_language_pairs')
      .insert({
        user_id: user.id, // Explicitly set user_id
        source_language: sourceLanguage,
        target_language: targetLanguage,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist yet, throw a more helpful error
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        throw new Error('Language pairs feature is not yet available. Please run the database migration first.');
      }
      throw new Error(`Failed to create language pair: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.log('Error creating language pair:', error);
    throw error;
  }
};

export const updateLanguagePair = async (
  id: string,
  updates: Partial<Pick<LanguagePair, 'is_active' | 'proficiency_level'>>
): Promise<LanguagePair> => {
  const { data, error } = await supabase
    .from('user_language_pairs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update language pair: ${error.message}`);
  }

  return data;
};

export const deleteLanguagePair = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('user_language_pairs')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete language pair: ${error.message}`);
  }
};

// Book Management Functions
export const getBooksByLanguage = async (languageCode?: LanguageCode) => {
  try {
    let query = supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (languageCode) {
      query = query.eq('language_code', languageCode);
    }

    const { data, error } = await query;

    if (error) {
      // If language_code column doesn't exist yet, fall back to all books
      if (error.message.includes('language_code') && error.message.includes('does not exist')) {
        console.log('language_code column not found, fetching all books');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackError) {
          throw new Error(`Failed to fetch books: ${fallbackError.message}`);
        }
        return fallbackData || [];
      }
      throw new Error(`Failed to fetch books: ${error.message}`);
    }

    return (data || []) as LanguagePair[];
  } catch (error) {
    console.log('Error fetching books:', error);
    return []; // Return empty array as fallback
  }
};

export const getBooksByLanguagePair = async (
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode
) => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('language_code', sourceLanguage)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch books for language pair: ${error.message}`);
  }

  return data || [];
};