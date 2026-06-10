import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  console.log('🎯 API generate-image chiamata (z-ai-web-dev-sdk)')

  try {
    const body = await request.json()
    console.log('📦 Body ricevuto:', JSON.stringify(body, null, 2))

    const { nome, descrizione } = body

    if (!nome) {
      console.error('❌ Nome mancante nel body')
      return NextResponse.json(
        { error: 'Il nome del piatto è obbligatorio' },
        { status: 400 }
      )
    }

    const prompt = buildFoodPrompt(nome, descrizione)
    console.log('📝 Prompt generato:', prompt)

    console.log('🔌 Connessione a Z.ai SDK...')

    const zai = await ZAI.create()

    console.log('🎨 Inizio generazione immagine con Z.ai...')
    const startTime = Date.now()

    const response = await zai.images.generations.create({
      prompt: prompt,
      size: '1024x1024'
    })

    const duration = Date.now() - startTime
    console.log(`⏱️ Tempo impiegato: ${duration}ms`)

    const imageBase64 = response.data[0].base64
    const dataUrl = `data:image/png;base64,${imageBase64}`

    console.log(`✅ Successo! Immagine generata con Z.ai, dimensione: ${imageBase64.length} caratteri`)

    return NextResponse.json({
      success: true,
      url: dataUrl,
      service: 'z-ai-web-dev-sdk'
    })
  } catch (error: unknown) {
    console.error('💥 Errore generazione immagine:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    const message = error instanceof Error ? error.message : 'Errore nella generazione dell\'immagine'
    return NextResponse.json(
      { error: message, details: String(error) },
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