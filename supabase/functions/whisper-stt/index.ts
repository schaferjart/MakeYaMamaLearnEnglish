import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    const form = await req.formData()
    const audio = form.get('audio') as File | null

    console.log('Whisper request:', { 
      hasAudio: !!audio, 
      audioSize: audio?.size || 0, 
      audioType: audio?.type || 'unknown' 
    })

    if (!audio || !(audio instanceof File)) {
      return new Response(
        JSON.stringify({ error: "Missing 'audio' file in form-data" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (audio.size === 0) {
      console.log('Warning: Audio file is empty, returning error')
      return new Response(
        JSON.stringify({ error: "Audio file is empty" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create file with appropriate name based on type
    const isWebM = audio.type.includes('webm') || audio.name?.includes('.webm')
    const isMP4 = audio.type.includes('mp4') || audio.name?.includes('.mp4') 
    const fileName = isWebM ? 'recording.webm' : isMP4 ? 'recording.mp4' : 'recording.wav'
    const audioFile = new File([audio], fileName, { type: audio.type || 'audio/webm' })
    
    const openaiForm = new FormData()
    openaiForm.append('file', audioFile)
    openaiForm.append('model', 'whisper-1')
    openaiForm.append('language', 'en')
    openaiForm.append('response_format', 'json')
    // Add temperature for more consistent results
    openaiForm.append('temperature', '0')
    
    console.log('Sending to OpenAI:', { fileName, audioSize: audioFile.size, audioType: audioFile.type })

    // Add detailed debugging before OpenAI call
    console.log('OpenAI request details:', {
      url: 'https://api.openai.com/v1/audio/transcriptions',
      hasApiKey: !!openaiKey,
      apiKeyPrefix: openaiKey?.substring(0, 10) + '...',
      formDataEntries: Array.from(openaiForm.entries()).map(([key, value]) => [
        key, 
        value instanceof File ? `File(${value.name}, ${value.size}bytes, ${value.type})` : value
      ])
    })

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: openaiForm,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI Whisper API error:', { 
        status: response.status, 
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorText 
      })
      
      // Parse error response to get specific error details
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = null
      }

      // Return a more user-friendly error for common issues
      if (response.status === 400) {
        throw new Error('Audio format not supported or file corrupted')
      } else if (response.status === 413) {
        throw new Error('Audio file too large')
      } else if (response.status === 429) {
        if (errorData?.error?.code === 'insufficient_quota') {
          throw new Error('OpenAI API quota exceeded. Please add a valid OpenAI API key with available credits.')
        } else {
          throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.')
        }
      } else {
        throw new Error(`Transcription service error: ${response.status}`)
      }
    }

    let data
    try {
      data = await response.json()
    } catch (e) {
      console.error('Failed to parse OpenAI response as JSON:', e)
      throw new Error('Invalid response from transcription service')
    }
    
    const text: string = data?.text ?? ''
    console.log('OpenAI Whisper success:', { transcribedLength: text.length, text: text.substring(0, 100) })

    return new Response(
      JSON.stringify({ text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Whisper STT error:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name,
      cause: (error as Error).cause
    })
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Unexpected error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 