import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { EdgeTTSClient } from '@/services/tts/EdgeTTSClient';
import { TTSVoice } from '@/services/tts/types';

interface UseTextToSpeechOptions {
  voice?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<string>('');

  const ttsClientRef = useRef<EdgeTTSClient | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { voice, onStart, onEnd, onError } = options;

  useEffect(() => {
    const initializeTts = async () => {
      const client = new EdgeTTSClient();
      await client.init();
      if (client.initialized) {
        ttsClientRef.current = client;
        const allVoices = await client.getAllVoices();
        setVoices(allVoices);
        const selectedVoice = allVoices.find(v => v.id === voice) || allVoices.find(v => v.lang.startsWith('en-US')) || allVoices[0];
        if (selectedVoice) {
          setCurrentVoice(selectedVoice.id);
          await client.setVoice(selectedVoice.id);
        }
      } else {
        toast({
          title: "TTS Initialization Failed",
          description: "Could not connect to the TTS service.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    initializeTts();

    return () => {
      ttsClientRef.current?.shutdown();
    };
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!ttsClientRef.current || !text.trim()) {
      toast({
        title: "No text to speak",
        description: "Please provide some text to convert to speech.",
        variant: "destructive",
      });
      return;
    }

    if (isPlaying) {
      await stop();
    }

    setIsPlaying(true);
    onStart?.();

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const client = ttsClientRef.current;
      const lang = client.getVoiceId().slice(0, 5); // e.g., 'en-US'
      const ssml = `<speak version="1.0" xml:lang="${lang}"><voice name="${client.getVoiceId()}"><prosody rate="${client['#rate']}" pitch="${client['#pitch']}">${text}</prosody></voice></speak>`;

      const speakIterator = client.speak(ssml, signal);
      for await (const event of speakIterator) {
        if (event.code === 'error') {
          throw new Error(event.message);
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Text-to-speech failed');
      onError?.(err);
      toast({
        title: "Speech generation failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsPlaying(false);
      onEnd?.();
    }
  }, [isPlaying, onStart, onEnd, onError]);

  const stop = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (ttsClientRef.current) {
      await ttsClientRef.current.stop();
    }
    setIsPlaying(false);
  }, []);

  const pause = useCallback(async () => {
    if (ttsClientRef.current) {
      await ttsClientRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(async () => {
    if (ttsClientRef.current) {
      await ttsClientRef.current.resume();
      setIsPlaying(true);
    }
  }, []);

  const setVoice = useCallback(async (voiceId: string) => {
    if (ttsClientRef.current) {
      await ttsClientRef.current.setVoice(voiceId);
      setCurrentVoice(voiceId);
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isLoading,
    isPlaying,
    voices,
    currentVoice,
    setVoice,
  };
};
