import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import JSZip from 'https://esm.sh/jszip@3.10.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // List all EPUB files in the storage bucket
    const { data: files, error: listError } = await supabase.storage
      .from('ebooks')
      .list('', {
        limit: 100,
        offset: 0,
      })

    if (listError) {
      throw listError
    }

    const epubFiles = files?.filter(file => file.name.endsWith('.epub')) || []
    console.log(`Found ${epubFiles.length} EPUB files`)

    const results = []

    for (const file of epubFiles) {
      try {
        // Check if book already exists in database
        const { data: existingBook } = await supabase
          .from('books')
          .select('id')
          .eq('epub_path', file.name)
          .single()

        if (existingBook) {
          console.log(`Book ${file.name} already exists, skipping`)
          continue
        }

        // Try to extract metadata from EPUB file
        let author = 'Unknown Author'
        let title = 'Unknown Title'
        let translator = ''

        try {
          // Download the EPUB file
          const { data: epubData, error: downloadError } = await supabase.storage
            .from('ebooks')
            .download(file.name)

          if (!downloadError && epubData) {
            const arrayBuffer = await epubData.arrayBuffer()
            const zip = new JSZip()
            const contents = await zip.loadAsync(arrayBuffer)

            // Read container.xml to find OPF file
            const containerFile = contents.file('META-INF/container.xml')
            if (containerFile) {
              const containerText = await containerFile.async('text')
              const opfPathMatch = containerText.match(/full-path="([^"]+)"/)
              
              if (opfPathMatch) {
                const opfPath = opfPathMatch[1]
                const opfFile = contents.file(opfPath)
                
                if (opfFile) {
                  const opfText = await opfFile.async('text')
                  
                  // Extract title
                  const titleMatch = opfText.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/)
                  if (titleMatch) {
                    title = titleMatch[1].trim()
                  }
                  
                  // Extract author
                  const authorMatch = opfText.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/)
                  if (authorMatch) {
                    author = authorMatch[1].trim()
                  }
                }
              }
            }
          }
        } catch (metadataError) {
          console.log(`Could not extract metadata from ${file.name}, using filename parsing:`, metadataError)
          
          // Fallback to filename parsing
          const nameWithoutExt = file.name.replace('.epub', '')
          const parts = nameWithoutExt.split('_')
          
          if (parts.length >= 2) {
            author = parts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            title = parts[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            
            if (parts.length >= 3) {
              translator = parts[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
          }
        }

        // Get signed URL for the EPUB file
        const { data: signedUrlData } = await supabase.storage
          .from('ebooks')
          .createSignedUrl(file.name, 3600)

        const bookData = {
          title: title,
          author: author,
          epub_path: file.name,
          source: translator ? `Translated by ${translator}` : 'Standard Ebooks',
          year: null,
          opf_json: null,
          cover_url: null
        }

        // Insert book into database
        const { data: newBook, error: insertError } = await supabase
          .from('books')
          .insert(bookData)
          .select()
          .single()

        if (insertError) {
          console.error(`Error inserting book ${file.name}:`, insertError)
          results.push({ file: file.name, status: 'error', error: insertError.message })
        } else {
          console.log(`Successfully inserted book: ${title} by ${author}`)
          results.push({ file: file.name, status: 'success', book_id: newBook.id })
        }

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        results.push({ file: file.name, status: 'error', error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${epubFiles.length} files`,
        results 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in sync-books function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})