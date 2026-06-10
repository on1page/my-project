import { NextRequest, NextResponse } from 'next/server'

// Hugging Face Inference API - gratuito
// Per rate limiti più alti, puoi aggiungere una API key gratuita su https://huggingface.co/settings/tokens
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || ''

// Lista di modelli di fallback in ordine di qualità
const HF_MODELS = [
  'stabilityai/stable-diffusion-xl-base-1.0', // Modello migliore
  'runwayml/stable-diffusion-v1-5',           // Buon compromesso
  'CompVis/stable-diffusion-v1-4'            // Fallback
]

async function generateWithHuggingFace(prompt: string, model: string): Promise<ArrayBuffer> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (HF_API_KEY) {
    headers['Authorization'] = `Bearer ${HF_API_KEY}`
  }

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 1024,
          height: 1024
        }
      }),
      signal: AbortSignal.timeout(90000) // timeout 90s
    }
  )

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Errore sconosciuto')
    throw new Error(`Hugging Face API error (${response.status}): ${errorText}`)
  }

  return await response.arrayBuffer()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, descrizione } = body

    if (!nome) {
      return NextResponse.json(
        { error: 'Il nome del piatto è obbligatorio' },
        { status: 400 }
      )
    }

    // Costruisci un prompt ottimizzato per food photography
    const prompt = buildFoodPrompt(nome, descrizione)

    // Prova ogni modello finché uno funziona
    let lastError: Error | null = null
    for (const model of HF_MODELS) {
      try {
        console.log(`Tentativo generazione con modello: ${model}`)
        const imageBuffer = await generateWithHuggingFace(prompt, model)
        const base64 = Buffer.from(imageBuffer).toString('base64')
        const dataUrl = `data:image/png;base64,${base64}`

        return NextResponse.json({
          success: true,
          url: dataUrl,
          model: model
        })
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`Errore con modello ${model}:`, lastError.message)
        continue
      }
    }

    // Se tutti i modelli falliscono, torna indietro a Pollinations come ultimo fallback
    console.log('Fallback a Pollinations.ai')
    try {
      const encodedPrompt = encodeURIComponent(prompt)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`

      const pollinationsResponse = await fetch(imageUrl, {
        signal: AbortSignal.timeout(60000)
      })

      if (pollinationsResponse.ok) {
        const imageBuffer = await pollinationsResponse.arrayBuffer()
        const base64 = Buffer.from(imageBuffer).toString('base64')
        const dataUrl = `data:image/png;base64,${base64}`

        return NextResponse.json({
          success: true,
          url: dataUrl,
          model: 'pollinations'
        })
      }
    } catch (error) {
      console.error('Fallback Pollinations fallito:', error)
    }

    throw lastError || new Error('Tutti i servizi di generazione immagini non sono disponibili')
  } catch (error: unknown) {
    console.error('Errore generazione immagine:', error)
    const message = error instanceof Error ? error.message : 'Errore nella generazione dell\'immagine'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

function buildFoodPrompt(nome: string, descrizione?: string): string {
  const parts = [
    'Professional food photography of',
    nome,
    'on a elegant dark plate,'
  ]

  if (descrizione && descrizione.trim()) {
    parts.push(descrizione.trim().endsWith('.') ? descrizione.trim() : descrizione.trim() + ',')
  }

  parts.push(
    'restaurant quality presentation,',
    'warm ambient lighting,',
    'shallow depth of field,',
    'top-down angle,',
    'garnished beautifully,',
    'high resolution,',
    'appetizing colors'
  )

  return parts.join(' ')
}
