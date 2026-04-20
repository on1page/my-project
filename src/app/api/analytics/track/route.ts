import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash } from 'crypto'

// Funzione per ottenere informazioni sulla geolocalizzazione da IP (ip-api.com - gratuito senza API key)
async function getGeoInfo(ip: string): Promise<{ country?: string; city?: string } | null> {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status`)
    if (response.ok) {
      const data = await response.json()
      if (data.status === 'success') {
        return {
          country: data.country,
          city: data.city
        }
      }
    }
  } catch (error) {
    console.error('Errore nella geolocalizzazione:', error)
  }
  return null
}

// Funzione per hashare l'IP in modo anonimo
function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

// Funzione per generare un session ID unico
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// POST - Traccia un evento analytics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      eventType,
      pageUrl,
      productId,
      duration,
      referrer,
      userAgent,
      sessionId
    } = body

    // Validazione base
    if (!eventType || !pageUrl) {
      return NextResponse.json(
        { error: 'eventType e pageUrl sono richiesti' },
        { status: 400 }
      )
    }

    // Ottieni l'IP del client
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Anonimizza l'IP
    const ipHash = ip !== 'unknown' ? hashIP(ip) : null

    // Ottieni geolocalizzazione (se possibile)
    let country: string | null = null
    let city: string | null = null

    if (ip !== 'unknown') {
      const geoInfo = await getGeoInfo(ip)
      if (geoInfo) {
        country = geoInfo.country || null
        city = geoInfo.city || null
      }
    }

    // Genera o usa session ID esistente
    const finalSessionId = sessionId || generateSessionId()

    // Salva l'evento
    const event = await db.analyticsEvent.create({
      data: {
        sessionId: finalSessionId,
        eventType,
        pageUrl,
        productId: productId || null,
        duration: duration || null,
        referrer: referrer || null,
        userAgent: userAgent || null,
        ipHash,
        country,
        city
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: finalSessionId,
      eventId: event.id
    })
  } catch (error) {
    console.error('Errore nel tracciamento evento:', error)
    return NextResponse.json(
      { error: 'Errore nel tracciamento dell\'evento' },
      { status: 500 }
    )
  }
}