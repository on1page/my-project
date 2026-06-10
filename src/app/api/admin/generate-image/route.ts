import { NextRequest, NextResponse } from 'next/server'

// Hugging Face Inference API - gratuito
// Per rate limiti più alti, puoi aggiungere una API key gratuita su https://huggingface.co/settings/tokens
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || ''

// Lista di servizi in ordine di priorità (Pollinations prima perché più affidabile)
const SERVICES = [
  { name: 'pollinations', type: 'pollinations' },
  { name: 'stabilityai/stable-diffusion-xl-base-1.0', type: 'huggingface' }, // Modello migliore
  { name: 'runwayml/stable-diffusion-v1-5', type: 'huggingface' },           // Buon compromesso
  { name: 'CompVis/stable-diffusion-v1-4', type: 'huggingface' }             // Fallback
]

async function generateWithPollinations(prompt: string): Promise<ArrayBuffer> {
  const encodedPrompt = encodeURIComponent(prompt)
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`

  const response = await fetch(imageUrl, {
    signal: AbortSignal.timeout(120000) // timeout 2 minuti
  })

  if (!response.ok) {
    throw new Error(`Pollinations error (${response.status})`)
  }

  return await response.arrayBuffer()
}

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
          num_inference_steps: 25,
          guidance_scale: 7.5,
          width: 1024,
          height: 1024
        }
      }),
      signal: AbortSignal.timeout(180000) // timeout 3 minuti per cold start
    }
  )

  const errorText = await response.text().catch(() => 'Errore sconosciuto')

  if (!response.ok) {
    throw new Error(`Hugging Face (${model}): ${errorText}`)
  }

  return await response.arrayBuffer()
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 3000
): Promise<T> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries) throw error
      console.log(`Retry ${i + 1}/${maxRetries} dopo ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Retry failed')
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

    const prompt = buildFoodPrompt(nome, descrizione)
    let lastError: Error | null = null

    console.log(`🎨 Inizio generazione immagine per: ${nome}`)

    // Prova ogni servizio finché uno funziona
    for (const service of SERVICES) {
      try {
        console.log(`🔄 Tentativo con servizio: ${service.name}`)

        let imageBuffer: ArrayBuffer
        if (service.type === 'pollinations') {
          imageBuffer = await retryWithBackoff(() => generateWithPollinations(prompt))
        } else {
          imageBuffer = await retryWithBackoff(() => generateWithHuggingFace(prompt, service.name), 1, 5000)
        }

        const base64 = Buffer.from(imageBuffer).toString('base64')
        const dataUrl = `data:image/png;base64,${base64}`

        console.log(`✅ Successo! Immagine generata con: ${service.name}`)

        return NextResponse.json({
          success: true,
          url: dataUrl,
          service: service.name
        })
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`❌ Errore con ${service.name}:`, lastError.message)
        continue
      }
    }

    throw lastError || new Error('Tutti i servizi di generazione immagini non sono disponibili')
  } catch (error: unknown) {
    console.error('💥 Errore generazione immagine:', error)
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
