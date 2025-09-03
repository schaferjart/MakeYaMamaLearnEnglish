import { useState, useRef, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'

interface UseTextToSpeechOptions {
  voice?: string
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
    onStart,
    onEnd,
    onError,
  } = options

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
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        utterance.pitch = 1.0
        utterance.volume = 1.0
        
        // Try to select a good English voice
        const voices = window.speechSynthesis.getVoices()
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.name.includes('Female')
        ) || voices.find(voice => voice.lang.startsWith('en'))
        
        if (englishVoice) utterance.voice = englishVoice

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
  }, [voice, onStart, onEnd, onError])

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
