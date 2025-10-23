import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { invokeAiTutor, whisperTranscribe } from '@/lib/api'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { supabase } from '@/integrations/supabase/client'
import { t } from '@/lib/i18n'
import { toast } from '@/hooks/use-toast'
import { LanguageCode } from '@/lib/languages'
import { useLocale } from '@/lib/locale'

interface ConversationTutorProps {
  sessionId: string | null
  bookId: string
  readContent: string
  onEnd: () => void
  bookLanguage?: LanguageCode // NEW: Book's language
}

interface ChatMessage {
  role: 'user' | 'ai'
  content: string
}

export const ConversationTutor = ({ sessionId, bookId, readContent, onEnd, bookLanguage = 'en' }: ConversationTutorProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3 * 60) // Default to 3 minutes
  const [totalTime, setTotalTime] = useState(3 * 60)
  const [elapsed, setElapsed] = useState(0)
  const [isWaitingForTtsCompletion, setIsWaitingForTtsCompletion] = useState(false)
  const [conversationEnded, setConversationEnded] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [didRetry, setDidRetry] = useState(false)
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);
  const [speechRetryCount, setSpeechRetryCount] = useState(0)
  const cancelTokenRef = useRef(0)
  const recognitionRef = useRef<any>(null)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaChunksRef = useRef<BlobPart[]>([])
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recordingStartTimeRef = useRef<number>(0)

  // Get user's native language from locale
  const { locale } = useLocale();

  // Use locale as the user's native language for AI tutor responses
  const userTargetLanguage = locale as LanguageCode;

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

  // Simple browser Speech Synthesis TTS
  const [isPlaying, setIsPlaying] = useState(false)
  
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = getTTSLanguageCode(bookLanguage) // Use book's language
      utterance.rate = 0.8
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      // Try to select a voice for the book's language
      const voices = window.speechSynthesis.getVoices()
      const targetLang = getTTSLanguageCode(bookLanguage)
      
      // Try to find a voice for the book's language
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
        console.log(`ConversationTutor selected voice for ${bookLanguage}:`, selectedVoice.name)
      }
      
      utterance.onstart = () => {
        setIsPlaying(true)
      }
      
      utterance.onend = () => {
        setIsPlaying(false)
        
        // Check if we were waiting for TTS to complete before ending conversation
        if (isWaitingForTtsCompletion && conversationEnded) {
          console.log('AI speech completed, now ending conversation gracefully')
          void finalizeAndEnd()
        }
      }
      
      utterance.onerror = () => {
        setIsPlaying(false)
        
        // If we were waiting for completion, proceed with conversation end
        if (isWaitingForTtsCompletion && conversationEnded) {
          console.log('AI speech error during graceful completion, proceeding with conversation end')
          void finalizeAndEnd()
        }
      }
      
      speechSynthesis.speak(utterance)
    }
  }
  
  const stop = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      setIsPlaying(false)
    }
  }

  const readContentSummary = useMemo(() => readContent.slice(0, 1000), [readContent])

  useEffect(() => {
    // load CEFR level then start the conversation
    let cancelled = false
    const kickOff = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id
        const { data, error } = await supabase
          .from('profiles')
          .select('cefr_level')
          .eq('id', userId || '')
          .single()
        if (error) throw error
        const cefrLevel = data?.cefr_level || 'A1'
        const history = [] as Array<{ role: 'user' | 'ai'; content: string }>
        const tutorParams = {
          sessionId: sessionId || undefined,
          userMessage: '',
          cefrLevel,
          bookId,
          readContentSummary,
          history,
          sourceLanguage: bookLanguage,
          targetLanguage: userTargetLanguage // Use the correct target language
        };
        const { reply } = await invokeAiTutor(tutorParams);
        if (cancelled) return
        console.log('Initial AI reply:', reply)
        if (reply && reply.trim()) {
          setMessages([{ role: 'ai', content: reply }])
          console.log('Speaking AI reply:', reply)
          speak(reply)
        } else {
          const fallbackMessage = t('tutor.idk')
          setMessages([{ role: 'ai', content: fallbackMessage }])
          console.log('Speaking fallback message:', fallbackMessage)
          speak(fallbackMessage)
        }
      } catch (e) {
        const fallbackMessage = t('tutor.idk')
        setMessages([{ role: 'ai', content: fallbackMessage }])
        speak(fallbackMessage)
        toast({ title: 'Error', description: t('tutor.networkError') })
      }
    }
    kickOff()
    const timer = setInterval(() => {
      setTimeLeft((s) => {
        const next = s - 1
        setElapsed((e) => e + 1)
        if (next <= 0) {
          clearInterval(timer)
          console.log('Conversation timer expired, checking if TTS is active')
          
          // Check both our state and the actual speech synthesis queue
          const isSpeechActive = isPlaying || speechSynthesis.speaking || speechSynthesis.pending;
          
          // Always wait a moment to catch any TTS that might be starting
          console.log('Timer expired - TTS state check (isPlaying:', isPlaying, 'speechSynthesis.speaking:', speechSynthesis.speaking, 'speechSynthesis.pending:', speechSynthesis.pending, ')')
          console.log('Setting up graceful completion monitoring...')
          setIsWaitingForTtsCompletion(true)
          setConversationEnded(true)
          
          // If no speech is active, the monitor will end the conversation quickly
          // If speech starts later, the monitor will wait for it to complete
          
          return 0
        }
        return next
      })
    }, 1000)

    // Monitor speech synthesis end when waiting for completion
    const checkSpeechEnd = () => {
      if (isWaitingForTtsCompletion && conversationEnded) {
        const isSpeechActive = isPlaying || speechSynthesis.speaking || speechSynthesis.pending;
        
        if (!isSpeechActive) {
          console.log('All speech synthesis completed, ending conversation gracefully')
          void finalizeAndEnd()
        } else {
          console.log('Still waiting for TTS completion (isPlaying:', isPlaying, 'speechSynthesis.speaking:', speechSynthesis.speaking, 'speechSynthesis.pending:', speechSynthesis.pending, ')')
        }
      }
    }

    // Start monitoring with a small delay to catch any TTS that might be starting
    const speechEndInterval = setInterval(checkSpeechEnd, 200) // Check every 200ms

    return () => {
      cancelled = true
      clearInterval(timer)
      clearInterval(speechEndInterval)
      // Ensure all TTS is stopped when component unmounts
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finalizeAndEnd = async () => {
    try {
      if (sessionId) {
        await supabase
          .from('sessions')
          .update({ talk_ms: elapsed * 1000 })
          .eq('id', sessionId)
      }
    } catch {}
    
    // Stop any active TTS immediately
    stop()
    
    // Add graceful pause before ending conversation
    console.log('Conversation ending, adding graceful pause before returning to reading');
    setTimeout(() => {
      console.log('Ending conversation after graceful pause');
      onEnd();
    }, 1500); // 1.5 second pause
  }

  const supportsSTT = () => typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  const startRecording = async () => {
    if (!supportsSTT()) {
      toast({ title: 'Error', description: t('tutor.networkError') })
      return
    }
    
    // Check if online
    if (!navigator.onLine) {
      toast({ title: 'Error', description: t('tutor.networkError') })
      return
    }

    // Force HTTPS and check microphone permissions explicitly
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      console.error('Microphone permission error:', error)
      toast({ title: t('tutor.permissionDenied'), description: t('tutor.recordStartTooltip') })
      return
    }
    
    // Reset retry count when manually starting (not from retry)
    if (speechRetryCount === 0) {
      console.log('Starting fresh recording session')
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = getTTSLanguageCode(bookLanguage) // Use book's language for speech recognition
    console.log(`Speech recognition set to: ${recognition.lang} for book language: ${bookLanguage}`)
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false
    
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ''
      if (!transcript.trim() || isProcessingTranscript) return
      
      setIsProcessingTranscript(true)
      console.log('Web Speech API transcription:', transcript)
      setSpeechRetryCount(0)
      setInput((prev) => prev ? `${prev} ${transcript.trim()}` : transcript.trim())
  toast({ title: 'Success', description: t('tutor.speechRecognized') })
      
      setTimeout(() => setIsProcessingTranscript(false), 1000)
    };
    
    recognition.onerror = (event: any) => {
      console.error('Web Speech API error:', event.error)
      setIsRecording(false)
      
      if (event.error === 'network') {
        if (!navigator.onLine) {
          toast({ title: t('tutor.networkError'), description: t('tutor.retryFailed') })
          return // Don't retry
        }
        setSpeechRetryCount(prev => {
          const newCount = prev + 1
          if (newCount <= 3) { // Increase to 3 for more grace
            console.log(`Retrying... (attempt ${newCount}/3)`)
            setTimeout(startRecording, 2000 * newCount) // Exponential backoff: 2s, 4s, 6s
            return newCount
          } else {
            toast({ title: 'Error', description: t('tutor.retryFailed') })
            return 0 // Reset counter
          }
        })
        return
      }
      
      // Reset retry count for non-network errors
      setSpeechRetryCount(0)
      
      if (event.error === 'no-speech') {
        toast({ title: 'Info', description: t('tutor.noSpeech') })
      } else if (event.error === 'not-allowed') {
        toast({ title: t('tutor.permissionDenied'), description: t('tutor.recordStartTooltip') })
      } else if (event.error === 'audio-capture') {
        toast({ title: 'Error', description: t('tutor.networkError') })
      } else {
        toast({ title: 'Error', description: t('tutor.retryFailed') })
      }
    }
    
    recognition.onstart = () => {
      console.log('Web Speech API started listening')
      setIsRecording(true)
    }
    
    recognition.onend = () => {
      console.log('Web Speech API stopped listening')
      setIsRecording(false)
    }
    
    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch (e) {
      console.error('Failed to start Web Speech API:', e)
      setIsRecording(false)
  toast({ title: 'Error', description: t('tutor.retryFailed') })
    }
  }

  const stopRecording = () => {
    try { recognitionRef.current?.stop?.() } catch {}
    setIsRecording(false)
  }

  // MediaRecorder-based audio recording (hold to record)
  const isAudioRecordingSupported = () => typeof window !== 'undefined' && !!navigator.mediaDevices && 'MediaRecorder' in window

  const startAudioRecording = async () => {
    if (!isAudioRecordingSupported()) {
      toast({ title: 'Error', description: t('tutor.networkError') })
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      mediaChunksRef.current = []
      
      // Use the best supported audio format
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm'
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4'
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '' // Let browser choose
      }
      
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      
      mediaRecorderRef.current = recorder
      recordingStartTimeRef.current = Date.now()
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          mediaChunksRef.current.push(event.data)
        }
      }
      
      recorder.onstop = async () => {
        const duration = Date.now() - recordingStartTimeRef.current
        if (duration < 500) {
          toast({ title: 'Error', description: t('tutor.retryFailed') })
          return
        }
        
        if (mediaChunksRef.current.length === 0) {
          toast({ title: 'Error', description: t('tutor.noSpeech') })
          return
        }
        
        const audioBlob = new Blob(mediaChunksRef.current, { type: mimeType || 'audio/webm' })
        console.log('Audio blob size:', audioBlob.size, 'bytes', 'type:', audioBlob.type)
        
        if (audioBlob.size === 0) {
          toast({ title: 'Error', description: t('tutor.noSpeech') })
          return
        }
        
        // Upload to Whisper STT
        try {
          console.log('Uploading audio blob:', { 
            size: audioBlob.size, 
            type: audioBlob.type,
            duration: Date.now() - recordingStartTimeRef.current
          })

          const result = await whisperTranscribe(audioBlob, bookLanguage)
          console.log('Whisper transcription result:', result)
          
          if (result && result.text && result.text.trim()) {
            setInput(result.text.trim())
            toast({ title: 'Success', description: t('tutor.speechRecognized') })
          } else {
            toast({ title: t('tutor.noSpeech'), description: t('tutor.retryFailed'), variant: 'destructive' })
          }
        } catch (error) {
          console.error('Transcription error:', error)
          const errorMessage = error instanceof Error ? error.message : t('tutor.retryFailed')
          toast({ title: 'Error', description: errorMessage, variant: 'destructive' })
        }        
        // Cleanup
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop())
          mediaStreamRef.current = null
        }
      }
      
      recorder.start(100) // Collect data every 100ms
      setIsRecordingAudio(true)
      
    } catch (error) {
      console.error('Microphone access error:', error)
      toast({ title: t('tutor.permissionDenied'), description: t('tutor.recordStartTooltip') })
    }
  }

  const stopAudioRecordingAndTranscribe = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop()
      setIsRecordingAudio(false)
    }
    if (isRecording) {
      stopRecording()
    }
  }

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const userText = input
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userText }])
    setSending(true)
    setIsThinking(true)
    const myToken = ++cancelTokenRef.current
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      const { data, error } = await supabase
        .from('profiles')
        .select('cefr_level')
        .eq('id', userId || '')
        .single()
      if (error) throw error
      const cefrLevel = data?.cefr_level || 'A2'
      const history = messages.slice(-8)
      const tutorParams = {
        sessionId: sessionId || undefined,
        userMessage: userText,
        cefrLevel,
        bookId,
        readContentSummary,
        history,
        sourceLanguage: bookLanguage,
        targetLanguage: userTargetLanguage
      };
      const { reply } = await invokeAiTutor(tutorParams);
      if (myToken !== cancelTokenRef.current) return
      setMessages((prev) => [...prev, { role: 'ai', content: reply }])
      speak(reply)
      setDidRetry(false)
    } catch (e) {
      if (!didRetry) {
        setDidRetry(true)
        try {
          const tutorParams = {
            sessionId: sessionId || undefined,
            userMessage: userText,
            bookId,
            readContentSummary,
            sourceLanguage: bookLanguage,
            targetLanguage: userTargetLanguage
          };
          const { reply } = await invokeAiTutor(tutorParams);
          if (myToken !== cancelTokenRef.current) return
          setMessages((prev) => [...prev, { role: 'ai', content: reply }])
          speak(reply)
        } catch {
          const errorMessage = t('tutor.retryFailed')
          setMessages((prev) => [...prev, { role: 'ai', content: errorMessage }])
          speak(errorMessage)
          toast({ title: 'Error', description: t('tutor.retryFailed') })
        }
      } else {
        const errorMessage = t('tutor.retryFailed')
        setMessages((prev) => [...prev, { role: 'ai', content: errorMessage }])
        speak(errorMessage)
        toast({ title: 'Error', description: t('tutor.retryFailed') })
      }
    } finally {
      setSending(false)
      setIsThinking(false)
    }
  }

  const format = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2, '0')}`

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>{t('tutor.start')}</div>
          <div>{format(timeLeft)}</div>
        </div>
        
        {/* Timer duration options */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t('tutor.duration')}:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, .1].map((minutes) => (
              <Button
                key={minutes}
                variant={totalTime === minutes * 60 ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newTime = minutes * 60;
                  console.log(`Setting conversation time to ${minutes} minutes (${newTime} seconds)`);
                  setTimeLeft(newTime);
                  setTotalTime(newTime);
                }}
                                 disabled={messages.some(m => m.role === 'user')} // Disable once user has responded
                className="h-6 px-2 text-xs"
              >
                {minutes}m
              </Button>
            ))}
          </div>
        </div>
        {isThinking && (
          <div className="text-xs text-muted-foreground">{t('tutor.thinking')}</div>
        )}
        <div className="space-y-3 max-h-96 overflow-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'ai' ? 'text-primary' : 'text-foreground'}>
              {m.content}
            </div>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[t('tutor.idk'), t('tutor.hint'), t('tutor.nextQuestion')].map((q) => (
            <Button key={q} variant="outline" size="sm" onClick={() => { setInput(''); setMessages((prev)=>[...prev, { role: 'user', content: q }]); setTimeout(()=>handleSend(), 0) }}>
              {q}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('tutor.typeResponse')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
          />
          {/* Hold-to-record button (MediaRecorder); falls back to Web Speech on unsupported browsers */}
                    <Button
            variant={(isRecordingAudio || isRecording) ? 'default' : 'secondary'}
            onClick={() => {
              if (isRecording || isRecordingAudio) {
                stopRecording()
                stopAudioRecordingAndTranscribe()
              } else {
                startAudioRecording()
              }
            }}
            disabled={isThinking || sending}
            title={(isRecording || isRecordingAudio) ? t('tutor.recordStopTooltip') : t('tutor.recordStartTooltip')}
          >
            {(isRecordingAudio || isRecording) ? t('tutor.stopRecording') : `🎤 ${t('tutor.record')}`}
          </Button>
          <Button variant="outline" onClick={() => { cancelTokenRef.current++; setIsThinking(false); }} disabled={!isThinking}>
            {t('tutor.cancel')}
          </Button>
          <Button onClick={handleSend} disabled={sending || !input.trim()}>
            {t('tutor.send')}
          </Button>
          <Button variant="outline" onClick={() => { if (isPlaying) stop(); void finalizeAndEnd(); }}>
            {t('tutor.close')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 