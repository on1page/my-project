import { NextRequest, NextResponse } from 'next/server'

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

    // Pollinations.ai - gratuito, senza API key
    const encodedPrompt = encodeURIComponent(prompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`

    // Scarica l'immagine generata
    const imageResponse = await fetch(imageUrl, {
      signal: AbortSignal.timeout(60000) // timeout 60s
    })

    if (!imageResponse.ok) {
      throw new Error(`Servizio non disponibile (${imageResponse.status})`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    return NextResponse.json({
      success: true,
      url: dataUrl
    })
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
