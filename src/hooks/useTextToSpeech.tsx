import { useState, useRef, useCallback } from 'react'
import { generateSpeech } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

interface UseTextToSpeechOptions {
  voice?: string
  model?: string
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
}

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { 
    voice = 'Aria', 
    model = 'eleven_multilingual_v2',
    onStart,
    onEnd,
    onError 
  } = options

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) {
      toast({
        title: "No text to speak",
        description: "Please provide some text to convert to speech.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
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
  }, [voice, model, onStart, onEnd, onError])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [isPlaying])

  const resume = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
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