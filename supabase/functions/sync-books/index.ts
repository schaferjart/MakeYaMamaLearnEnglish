import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import JSZip from 'https://esm.sh/jszip@3.10.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Language detection based on filename patterns
const detectBookLanguage = (filename: string): string => {
  // Simple filename-based detection
  if (filename.includes('/it/') || filename.includes('_it_') || filename.includes('-it-')) return 'it';
  if (filename.includes('/fr/') || filename.includes('_fr_') || filename.includes('-fr-')) return 'fr';  
  if (filename.includes('/de/') || filename.includes('_de_') || filename.includes('-de-')) return 'de';
  if (filename.includes('/es/') || filename.includes('_es_') || filename.includes('-es-')) return 'es';
  if (filename.includes('/pt/') || filename.includes('_pt_') || filename.includes('-pt-')) return 'pt';
  if (filename.includes('/ru/') || filename.includes('_ru_') || filename.includes('-ru-')) return 'ru';
  if (filename.includes('/ja/') || filename.includes('_ja_') || filename.includes('-ja-')) return 'ja';
  if (filename.includes('/ko/') || filename.includes('_ko_') || filename.includes('-ko-')) return 'ko';
  if (filename.includes('/zh/') || filename.includes('_zh_') || filename.includes('-zh-')) return 'zh';
  if (filename.includes('/ar/') || filename.includes('_ar_') || filename.includes('-ar-')) return 'ar';
  if (filename.includes('/hi/') || filename.includes('_hi_') || filename.includes('-hi-')) return 'hi';
  return 'en'; // Default to English
};

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

        // Try to extract metadata and cover from EPUB file
        let author = 'Unknown Author'
        let title = 'Unknown Title'
        let translator = ''
        let coverUrl = null

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
                const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1)
                
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

                  // Extract cover image
                  try {
                    console.log(`Starting cover extraction for ${file.name}`)
                    
                    // Look for cover reference in metadata
                    const coverMetaMatch = opfText.match(/<meta name="cover" content="([^"]+)"/)
                    let coverImagePath = null

                    console.log(`Cover meta match for ${file.name}:`, coverMetaMatch)

                    if (coverMetaMatch) {
                      const coverId = coverMetaMatch[1]
                      console.log(`Found cover ID: ${coverId}`)
                      const itemMatch = opfText.match(new RegExp(`<item[^>]+id="${coverId}"[^>]+href="([^"]+)"`))
                      console.log(`Item match for cover ID:`, itemMatch)
                      if (itemMatch) {
                        coverImagePath = opfDir + itemMatch[1]
                        console.log(`Cover image path from metadata: ${coverImagePath}`)
                      }
                    }

                    // Fallback: look for common cover image names
                    if (!coverImagePath) {
                      console.log(`No cover found in metadata, checking common names for ${file.name}`)
                      const commonCoverNames = [
                        'cover.jpg', 'cover.jpeg', 'cover.png', 'cover.gif',
                        'Cover.jpg', 'Cover.jpeg', 'Cover.png', 'Cover.gif',
                        'title.jpg', 'title.jpeg', 'title.png',
                        'titlepage.jpg', 'titlepage.jpeg', 'titlepage.png'
                      ]
                      
                      // List all files in the EPUB to see what's available
                      const allFiles = Object.keys(contents.files)
                      console.log(`All files in ${file.name}:`, allFiles.slice(0, 10)) // Show first 10 files
                      
                      for (const coverName of commonCoverNames) {
                        const fullPath = opfDir + coverName
                        console.log(`Checking for cover at: ${fullPath}`)
                        if (contents.file(fullPath)) {
                          coverImagePath = fullPath
                          console.log(`Found cover at: ${fullPath}`)
                          break
                        }
                      }
                      
                      // Also try root directory
                      if (!coverImagePath) {
                        for (const coverName of commonCoverNames) {
                          console.log(`Checking for cover at root: ${coverName}`)
                          if (contents.file(coverName)) {
                            coverImagePath = coverName
                            console.log(`Found cover at root: ${coverName}`)
                            break
                          }
                        }
                      }
                    }

                    // Extract and upload cover if found
                    if (coverImagePath) {
                      console.log(`Attempting to extract cover from: ${coverImagePath}`)
                      const coverFile = contents.file(coverImagePath)
                      if (coverFile) {
                        console.log(`Cover file found, extracting data...`)
                        const coverData = await coverFile.async('uint8array')
                        const coverExtension = coverImagePath.split('.').pop()?.toLowerCase() || 'jpg'
                        const coverFileName = `${file.name.replace('.epub', '')}.${coverExtension}`

                        console.log(`Uploading cover as: ${coverFileName}, size: ${coverData.length} bytes`)

                        // Upload cover to covers bucket
                        const { error: uploadError } = await supabase.storage
                          .from('covers')
                          .upload(coverFileName, coverData, {
                            contentType: `image/${coverExtension === 'jpg' ? 'jpeg' : coverExtension}`,
                            upsert: true
                          })

                        if (!uploadError) {
                          // Get public URL for the uploaded cover
                          const { data: publicUrlData } = supabase.storage
                            .from('covers')
                            .getPublicUrl(coverFileName)
                          
                          coverUrl = publicUrlData.publicUrl
                          console.log(`Successfully extracted and uploaded cover for ${title}: ${coverUrl}`)
                        } else {
                          console.log(`Failed to upload cover for ${title}:`, uploadError)
                        }
                      } else {
                        console.log(`Cover file not accessible at path: ${coverImagePath}`)
                      }
                    } else {
                      console.log(`No cover image found for ${file.name}`)
                    }
                  } catch (coverError) {
                    console.log(`Error extracting cover from ${file.name}:`, coverError)
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

        // Detect language from filename
        const languageCode = detectBookLanguage(file.name);
        console.log(`Detected language for ${file.name}: ${languageCode}`);

        const bookData = {
          title: title,
          author: author,
          epub_path: file.name,
          source: translator ? `Translated by ${translator}` : 'Standard Ebooks',
          year: null,
          opf_json: null,
          cover_url: coverUrl,
          language_code: languageCode,
          title_original: title, // For now, same as title
          author_original: author // For now, same as author
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