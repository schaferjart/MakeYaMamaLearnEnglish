import { supabase } from '@/integrations/supabase/client'

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
  targetLang: string = 'DE', 
  sourceLang?: string
): Promise<TranslationResult> => {
  const { data, error } = await supabase.functions.invoke('deepl-translate', {
    body: { 
      text, 
      target_lang: targetLang,
      source_lang: sourceLang 
    }
  })

  if (error) {
    throw new Error(`Translation failed: ${error.message}`)
  }

  return data
}

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
  book_id?: string
  cfi?: string
  user_id?: string
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

export const whisperTranscribe = async (audioBlob: Blob): Promise<WhisperSTTResult> => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')

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