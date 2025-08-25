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
  const { data, error } = await supabase.functions.invoke('sync-books')

  if (error) {
    throw new Error(`Book sync failed: ${error.message}`)
  }

  return data
}