import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { invokeAiTutor, whisperTranscribe } from '@/lib/api'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { supabase } from '@/integrations/supabase/client'
import { t } from '@/lib/i18n'
import { toast } from '@/hooks/use-toast'

interface ConversationTutorProps {
  sessionId: string | null
  bookId: string
  readContent: string
  onEnd: () => void
}

interface ChatMessage {
  role: 'user' | 'ai'
  content: string
}

export const ConversationTutor = ({ sessionId, bookId, readContent, onEnd }: ConversationTutorProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3 * 60) // Default to 3 minutes
  const [totalTime, setTotalTime] = useState(3 * 60)
  const [elapsed, setElapsed] = useState(0)
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

  // Simple browser Speech Synthesis TTS
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      // Prioritize high-quality English voices
      const voices = speechSynthesis.getVoices()
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Female')
      ) || voices.find(voice => voice.lang.startsWith('en'))
      
      if (englishVoice) utterance.voice = englishVoice
      speechSynthesis.speak(utterance)
    }
  }
  const isPlaying = false
  const stop = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
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
        const cefrLevel = data?.cefr_level || 'A2'
        const history = [] as Array<{ role: 'user' | 'ai'; content: string }>
        const { reply } = await invokeAiTutor({
          sessionId: sessionId || undefined,
          userMessage: '',
          cefrLevel,
          bookId,
          readContentSummary,
          history,
        })
        if (cancelled) return
        console.log('Initial AI reply:', reply)
        if (reply && reply.trim()) {
          setMessages([{ role: 'ai', content: reply }])
          console.log('Speaking AI reply:', reply)
          speak(reply)
        } else {
          const fallbackMessage = 'I am ready to talk about what you have read.'
          setMessages([{ role: 'ai', content: fallbackMessage }])
          console.log('Speaking fallback message:', fallbackMessage)
          speak(fallbackMessage)
        }
      } catch (e) {
        const fallbackMessage = 'I am ready to talk about what you have read.'
        setMessages([{ role: 'ai', content: fallbackMessage }])
        speak(fallbackMessage)
        toast({ title: 'Error', description: 'The tutor is temporarily unavailable.' })
      }
    }
    kickOff()
    const timer = setInterval(() => {
      setTimeLeft((s) => {
        const next = s - 1
        setElapsed((e) => e + 1)
        if (next <= 0) {
          clearInterval(timer)
          if (isPlaying) stop()
          void finalizeAndEnd()
          return 0
        }
        return next
      })
    }, 1000)

    return () => {
      cancelled = true
      clearInterval(timer)
      if (isPlaying) stop()
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
    onEnd()
  }

  const supportsSTT = () => typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  const startRecording = async () => {
    if (!supportsSTT()) {
      toast({ title: 'Error', description: 'Speech recognition not supported in this browser.' })
      return
    }
    
    // Check if online
    if (!navigator.onLine) {
      toast({ title: 'Error', description: 'Internet connection required for speech recognition.' })
      return
    }

    // Force HTTPS and check microphone permissions explicitly
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      console.error('Microphone permission error:', error)
      toast({ title: 'Mic Access Needed', description: 'Please allow microphone in browser prompt.' })
      return
    }
    
    // Reset retry count when manually starting (not from retry)
    if (speechRetryCount === 0) {
      console.log('Starting fresh recording session')
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'en-US'
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
      toast({ title: 'Success', description: 'Speech recognized successfully!' })
      
      setTimeout(() => setIsProcessingTranscript(false), 1000)
    };
    
    recognition.onerror = (event: any) => {
      console.error('Web Speech API error:', event.error)
      setIsRecording(false)
      
      if (event.error === 'network') {
        if (!navigator.onLine) {
          toast({ title: 'Network Error', description: 'No internet connection. Please check and try again.' })
          return // Don't retry
        }
        setSpeechRetryCount(prev => {
          const newCount = prev + 1
          if (newCount <= 3) { // Increase to 3 for more grace
            console.log(`Retrying... (attempt ${newCount}/3)`)
            setTimeout(startRecording, 2000 * newCount) // Exponential backoff: 2s, 4s, 6s
            return newCount
          } else {
            toast({ title: 'Speech Recognition Failed', description: 'Max retries reached. Please use text input.' })
            return 0 // Reset counter
          }
        })
        return
      }
      
      // Reset retry count for non-network errors
      setSpeechRetryCount(0)
      
      if (event.error === 'no-speech') {
        toast({ title: 'Info', description: 'No speech detected. Please try again.' })
      } else if (event.error === 'not-allowed') {
        toast({ title: 'Permission Denied', description: 'Microphone access is required. Please enable in browser settings.' })
      } else if (event.error === 'audio-capture') {
        toast({ title: 'Audio Error', description: 'Microphone not available. Please check device settings.' })
      } else {
        toast({ title: 'Error', description: 'Speech recognition failed. Please try again.' })
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
      toast({ title: 'Error', description: 'Could not start speech recognition.' })
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
      toast({ title: 'Error', description: 'Audio recording not supported in this browser.' })
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
          toast({ title: 'Recording too short', description: 'Please record for at least 0.5 seconds.' })
          return
        }
        
        if (mediaChunksRef.current.length === 0) {
          toast({ title: 'No audio recorded', description: 'Please check your microphone.' })
          return
        }
        
        const audioBlob = new Blob(mediaChunksRef.current, { type: mimeType || 'audio/webm' })
        console.log('Audio blob size:', audioBlob.size, 'bytes', 'type:', audioBlob.type)
        
        if (audioBlob.size === 0) {
          toast({ title: 'Empty recording', description: 'No audio data captured.' })
          return
        }
        
        // Upload to Whisper STT
        try {
          console.log('Uploading audio blob:', { 
            size: audioBlob.size, 
            type: audioBlob.type,
            duration: Date.now() - recordingStartTimeRef.current
          })

          const result = await whisperTranscribe(audioBlob)
          console.log('Whisper transcription result:', result)
          
          if (result && result.text && result.text.trim()) {
            setInput(result.text.trim())
            toast({
              title: 'Speech recognized!',
              description: 'Audio transcribed successfully.',
            })
          } else {
            toast({
              title: 'No speech detected',
              description: 'Please try speaking more clearly or use typing.',
              variant: "destructive"
            })
          }
        } catch (error) {
          console.error('Transcription error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Please try again or use typing.'
          toast({
            title: 'Transcription failed',
            description: errorMessage,
            variant: "destructive"
          })
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
      toast({ title: 'Microphone Error', description: 'Please allow microphone access.' })
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
      const { reply } = await invokeAiTutor({
        sessionId: sessionId || undefined,
        userMessage: userText,
        cefrLevel,
        bookId,
        readContentSummary,
        history,
      })
      if (myToken !== cancelTokenRef.current) return
      setMessages((prev) => [...prev, { role: 'ai', content: reply }])
      speak(reply)
      setDidRetry(false)
    } catch (e) {
      if (!didRetry) {
        setDidRetry(true)
        try {
          const { reply } = await invokeAiTutor({
            sessionId: sessionId || undefined,
            userMessage: userText,
            bookId,
            readContentSummary,
          })
          if (myToken !== cancelTokenRef.current) return
          setMessages((prev) => [...prev, { role: 'ai', content: reply }])
          speak(reply)
        } catch {
          const errorMessage = 'Sorry, please try again.'
          setMessages((prev) => [...prev, { role: 'ai', content: errorMessage }])
          speak(errorMessage)
          toast({ title: 'Error', description: 'Please try again later.' })
        }
      } else {
        const errorMessage = 'Sorry, please try again.'
        setMessages((prev) => [...prev, { role: 'ai', content: errorMessage }])
        speak(errorMessage)
        toast({ title: 'Error', description: 'Please try again later.' })
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
          <span className="text-xs text-muted-foreground">Duration:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, .05].map((minutes) => (
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
          {['I don\'t know', 'Hint, please', 'Next question'].map((q) => (
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
            title={(isRecording || isRecordingAudio) ? "Click to stop recording" : "Click to start recording"}
          >
            {(isRecordingAudio || isRecording) ? 'Stop Recording' : '🎤 Record'}
          </Button>
          <Button variant="outline" onClick={() => { cancelTokenRef.current++; setIsThinking(false); }} disabled={!isThinking}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !input.trim()}>
            {t('tutor.send')}
          </Button>
          <Button variant="outline" onClick={() => { if (isPlaying) stop(); void finalizeAndEnd(); }}>
            {t('close')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 