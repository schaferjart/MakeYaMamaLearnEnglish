import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TutorRequestBody {
  sessionId?: string
  userMessage?: string
  cefrLevel?: string | null
  bookId?: string
  readContentSummary?: string
  history?: Array<{ role: 'user' | 'ai'; content: string }>
  language?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId, userMessage, cefrLevel, bookId, readContentSummary, history = [], language = 'en' }: TutorRequestBody = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Basic guardrail: prevent rapid-fire calls per session (>= 2 seconds apart)
    if (sessionId) {
      const { data: latestRows } = await supabase
        .from('conversations')
        .select('created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
      const latest = latestRows?.[0]?.created_at
      if (latest) {
        const last = new Date(latest).getTime()
        const now = Date.now()
        if (now - last < 2000) {
          return new Response(
            JSON.stringify({ error: 'Too many requests, please wait a moment.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
          )
        }
      }
    }

    // Load prior conversation history from DB as context (last 8 exchanges)
    let prior: Array<{ role: 'user' | 'ai'; content: string }> = []
    if (sessionId) {
      const { data: rows } = await supabase
        .from('conversations')
        .select('messages_jsonb, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(16)
      for (const r of rows || []) {
        const msgs = Array.isArray(r.messages_jsonb) ? r.messages_jsonb : []
        for (const m of msgs) {
          if (m && (m.role === 'user' || m.role === 'ai') && typeof m.content === 'string') {
            prior.push({ role: m.role, content: m.content })
          }
        }
      }
      // Keep only the last 8 messages to avoid context blowup
      prior = prior.slice(-8)
    }

    // Merge any client-provided short history (if present)
    const mergedHistory = [...prior, ...history].slice(-8)

    const level = cefrLevel || 'A2'
    const contentSnippet = (readContentSummary || '').slice(0, 1200)

    const createSystemPrompt = (lang: string, lvl: string, context: string) => {
      if (lang === 'de') {
        return `ABSOLUTELY CRITICAL: You MUST respond in German ONLY. NO English words allowed at all. This is mandatory.
Role: You are a patient, empathetic German tutor for English-speaking mothers.
Level: Adapt your German to CEFR ${lvl} (very simple at A1; concise but natural at higher levels).
Policy:
- Reply in German by default, 1–2 sentences only.
- Use a brief English hint (one short sentence) only if the learner is clearly stuck (e.g., asks for help twice or answers “I don’t know”).
- Stay on-topic: Use the reading context below; if off-topic, gently steer back with one short sentence.
- Keep continuity: Do not contradict earlier turns. If asked about previous questions, refer to the last question asked.
- Be encouraging and supportive.
Reading context: "${context}"
`
      }

      // Default to English
      return `ABSOLUTELY CRITICAL: You MUST respond in English ONLY. NO German words allowed at all. This is mandatory.
Role: You are a patient, empathetic English tutor for German-speaking mothers.
Level: Adapt your English to CEFR ${lvl} (very simple at A1; concise but natural at higher levels).
Policy:
- Reply in English by default, 1–2 sentences only.
- Use a brief German hint (one short sentence) only if the learner is clearly stuck (e.g., asks for help twice or answers “I don’t know”).
- Stay on-topic: Use the reading context below; if off-topic, gently steer back with one short sentence.
- Keep continuity: Do not contradict earlier turns. If asked about previous questions, refer to the last question asked.
- Be encouraging and supportive.
Reading context: "${context}"
`
    }

    const systemPrompt = createSystemPrompt(language, level, contentSnippet);

    // Build messages for OpenAI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...mergedHistory.map((m) => ({ role: (m.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user', content: m.content })),
      {
        role: 'user',
        content: (userMessage && userMessage.trim().length > 0)
          ? userMessage
          : 'Please ask me one short comprehension question about the reading to begin.'
      }
    ]

    const payload = {
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.4,
      max_tokens: 140, // Keep replies short (1–2 sentences)
    }

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      throw new Error(`OpenAI API error: ${aiResponse.status} - ${errorText}`)
    }

    const data = await aiResponse.json()
    const aiReply: string = data.choices?.[0]?.message?.content?.trim?.() || 'Let’s begin: What is Emma’s job?'

    // Persist exchange to conversations table
    const messagesToSave = [
      { role: 'user', content: userMessage || '' },
      { role: 'ai', content: aiReply },
    ]

    await supabase.from('conversations').insert({
      session_id: sessionId || null,
      messages_jsonb: messagesToSave,
      transcript_text: messagesToSave.map((m) => `${m.role}: ${m.content}`).join('\n')
    })

    return new Response(
      JSON.stringify({ reply: aiReply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('AI Tutor error:', error)
    // Fallback minimal question
    return new Response(
      JSON.stringify({ reply: 'Let’s focus on the text: What is Emma’s job?' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
}) 