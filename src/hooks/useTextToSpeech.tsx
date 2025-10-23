import { useState, useRef, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'
import { LanguageCode } from '@/lib/languages'

interface UseTextToSpeechOptions {
  voice?: string
  language?: LanguageCode // NEW: Language for TTS
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
}

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isUsingWebSpeechRef = useRef<boolean>(false)

  const { 
    voice = 'Aria', 
    language = 'en', // Default to English
    onStart,
    onEnd,
    onError,
  } = options

  // Helper function to get TTS language code
  const getTTSLanguageCode = (languageCode: LanguageCode): string => {
    const languageMap: Record<LanguageCode, string> = {
      'en': 'en-US',
      'it': 'it-IT',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'es': 'es-ES',
      'hi': 'hi-IN',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'ar': 'ar-SA'
    };
    return languageMap[languageCode] || 'en-US';
  };

  const speak = useCallback(async (text: string) => {
    if (!text || typeof text !== 'string' || !text.trim()) {
      console.warn('Invalid text for TTS:', { text, type: typeof text })
      toast({
        title: "No text to speak",
        description: "Please provide some text to convert to speech.",
        variant: "destructive"
      })
      return
    }

    console.log('TTS speaking:', { text: text.substring(0, 50), length: text.length })

    try {
      setIsLoading(true)
      
      // Stop any ongoing Web Speech synthesis
      if (utteranceRef.current) {
        try { window.speechSynthesis?.cancel() } catch {}
        utteranceRef.current = null
        isUsingWebSpeechRef.current = false
      }

      // Use Web Speech API directly
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = getTTSLanguageCode(language) // Use the language parameter
        utterance.rate = 0.8
        utterance.pitch = 1.0
        utterance.volume = 1.0
        
        // Try to select a voice for the specified language
        const voices = window.speechSynthesis.getVoices()
        const targetLang = getTTSLanguageCode(language)
        
        // Try to find a voice for the specified language
        let selectedVoice = voices.find(v => v.lang === targetLang)
        
        // If no exact match, try to find a voice that starts with the language code
        if (!selectedVoice) {
          const langPrefix = targetLang.split('-')[0]
          selectedVoice = voices.find(v => v.lang.startsWith(langPrefix))
        }
        
        // Fallback to any available voice
        if (!selectedVoice && voices.length > 0) {
          selectedVoice = voices[0]
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice
          console.log(`TTS selected voice for ${language}:`, selectedVoice.name)
        }

        utterance.onstart = () => {
          isUsingWebSpeechRef.current = true
          setIsPlaying(true)
          onStart?.()
        }
        utterance.onend = () => {
          setIsPlaying(false)
          utteranceRef.current = null
          isUsingWebSpeechRef.current = false
          onEnd?.()
        }
        utterance.onerror = () => {
          setIsPlaying(false)
          utteranceRef.current = null
          isUsingWebSpeechRef.current = false
          const error = new Error('Web Speech synthesis failed')
          onError?.(error)
          toast({
            title: "Speech failed",
            description: "Could not play the speech.",
            variant: "destructive"
          })
        }

        utteranceRef.current = utterance
        try { window.speechSynthesis.cancel() } catch {}
        window.speechSynthesis.speak(utterance)
      } else {
        throw new Error('Web Speech API not supported in this browser')
      }
    } catch (error) {
      console.error('TTS failed:', error)
      const err = error instanceof Error ? error : new Error('Text-to-speech failed')
      onError?.(err)
      toast({
        title: "Speech generation failed",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [voice, language, onStart, onEnd, onError])

  const stop = useCallback(() => {
    if (utteranceRef.current || isUsingWebSpeechRef.current) {
      try { window.speechSynthesis?.cancel() } catch {}
      utteranceRef.current = null
      isUsingWebSpeechRef.current = false
      setIsPlaying(false)
    }
  }, [])

  const pause = useCallback(() => {
    if ((utteranceRef.current || isUsingWebSpeechRef.current) && typeof window !== 'undefined') {
      try { window.speechSynthesis?.pause() } catch {}
      setIsPlaying(false)
    }
  }, [])

  const resume = useCallback(() => {
    if ((utteranceRef.current || isUsingWebSpeechRef.current) && typeof window !== 'undefined') {
      try { window.speechSynthesis?.resume() } catch {}
      setIsPlaying(true)
    }
  }, [])

  return {
    speak,
    stop,
    pause,
    resume,
    isLoading,
    isPlaying
  }
}
