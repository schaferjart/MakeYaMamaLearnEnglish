import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WordLookupRequest {
  word: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { word }: WordLookupRequest = await req.json()

    const wordnikApiKey = Deno.env.get('WORDNIK_API_KEY')
    if (!wordnikApiKey) {
      throw new Error('WORDNIK_API_KEY not configured')
    }

    // Get word definitions
    const definitionsResponse = await fetch(
      `https://api.wordnik.com/v4/word.json/${encodeURIComponent(word)}/definitions?limit=3&includeRelated=false&sourceDictionaries=wiktionary,wordnet&useCanonical=true&includeTags=false&api_key=${wordnikApiKey}`
    )

    // Get word examples
    const examplesResponse = await fetch(
      `https://api.wordnik.com/v4/word.json/${encodeURIComponent(word)}/examples?includeDuplicates=false&useCanonical=true&skip=0&limit=3&api_key=${wordnikApiKey}`
    )

    let definitions = []
    let examples = []

    if (definitionsResponse.ok) {
      definitions = await definitionsResponse.json()
    }

    if (examplesResponse.ok) {
      const exampleData = await examplesResponse.json()
      examples = exampleData.examples || []
    }

    // Extract the most relevant definition and example
    const primaryDefinition = definitions[0]
    const primaryExample = examples[0]

    return new Response(
      JSON.stringify({
        word: word,
        lemma: word.toLowerCase(),
        headword: word.toLowerCase(),
        pos: primaryDefinition?.partOfSpeech || null,
        sense: primaryDefinition?.text || null,
        example: primaryExample?.text || null,
        definitions: definitions.slice(0, 3).map(def => ({
          text: def.text,
          partOfSpeech: def.partOfSpeech,
          source: def.sourceDictionary
        })),
        examples: examples.slice(0, 3).map(ex => ex.text)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Word lookup error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})