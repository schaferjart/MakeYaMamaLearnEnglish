import { useState, useRef, useCallback } from 'react'
import { generateSpeech } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

interface UseTextToSpeechOptions {
  voice?: string
  model?: string
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
  fallbackToWebSpeech?: boolean
}

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isUsingWebSpeechRef = useRef<boolean>(false)

  const { 
    voice = 'Aria', 
    model = 'eleven_multilingual_v2',
    onStart,
    onEnd,
    onError,
    fallbackToWebSpeech = false,
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
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      // Stop any ongoing Web Speech synthesis
      if (utteranceRef.current) {
        try { window.speechSynthesis?.cancel() } catch {}
        utteranceRef.current = null
        isUsingWebSpeechRef.current = false
      }

      const result = await generateSpeech(text, voice, model)
      
      // Create audio from base64 data
      const audioBlob = new Blob(
        [Uint8Array.from(atob(result.audioContent), c => c.charCodeAt(0))],
        { type: result.contentType }
      )
      
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.onloadstart = () => {
        setIsPlaying(true)
        onStart?.()
      }
      
      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
        audioRef.current = null
        onEnd?.()
      }
      
      audio.onerror = (e) => {
        const error = new Error('Audio playback failed')
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
        audioRef.current = null
        onError?.(error)
        toast({
          title: "Playback failed",
          description: "Could not play the generated audio.",
          variant: "destructive"
        })
      }

      audioRef.current = audio
      await audio.play()
      
    } catch (error) {
      console.error('ElevenLabs TTS failed:', error)
      // Fallback to Web Speech API only if enabled
      const canUseWebSpeech = fallbackToWebSpeech && typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
      if (canUseWebSpeech) {
        try {
          const utterance = new SpeechSynthesisUtterance(text)
          // Try to select a matching voice by name if available
          const voices = window.speechSynthesis.getVoices()
          const match = voices.find(v => v.name.toLowerCase() === voice.toLowerCase())
          if (match) utterance.voice = match

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
            const fallbackErr = new Error('Web Speech synthesis failed')
            onError?.(fallbackErr)
            toast({
              title: "Speech failed",
              description: fallbackErr.message,
              variant: "destructive"
            })
          }

          utteranceRef.current = utterance
          // Cancel any existing speech then speak
          try { window.speechSynthesis.cancel() } catch {}
          window.speechSynthesis.speak(utterance)
          return
        } catch (fallbackError) {
          const err = fallbackError instanceof Error ? fallbackError : new Error('Text-to-speech failed')
          onError?.(err)
          toast({
            title: "Speech generation failed",
            description: err.message,
            variant: "destructive"
          })
        }
      } else {
        const err = error instanceof Error ? error : new Error('Text-to-speech failed')
        onError?.(err)
        toast({
          title: "Speech generation failed",
          description: err.message,
          variant: "destructive"
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [voice, model, onStart, onEnd, onError, fallbackToWebSpeech])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
    if (utteranceRef.current || isUsingWebSpeechRef.current) {
      try { window.speechSynthesis?.cancel() } catch {}
      utteranceRef.current = null
      isUsingWebSpeechRef.current = false
      setIsPlaying(false)
    }
  }, [])

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
    if ((utteranceRef.current || isUsingWebSpeechRef.current) && typeof window !== 'undefined') {
      try { window.speechSynthesis?.pause() } catch {}
      setIsPlaying(false)
    }
  }, [isPlaying])

  const resume = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
      setIsPlaying(true)
    }
    if ((utteranceRef.current || isUsingWebSpeechRef.current) && typeof window !== 'undefined') {
      try { window.speechSynthesis?.resume() } catch {}
      setIsPlaying(true)
    }
  }, [isPlaying])

  return {
    speak,
    stop,
    pause,
    resume,
    isLoading,
    isPlaying
  }
}