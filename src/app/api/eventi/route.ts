import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const eventi = await db.evento.findMany({
      orderBy: [
        { inEvidenza: 'desc' },
        { data: 'asc' }
      ]
    })

    // Filtra eventi passati
    const oggi = new Date()
    oggi.setHours(0, 0, 0, 0)

    const eventiFuturi = eventi.filter(e => {
      const dataEvento = new Date(e.data)
      return dataEvento >= oggi
    })

    return NextResponse.json({ data: eventiFuturi })
  } catch (error) {
    console.error('Errore nel recupero eventi pubblici:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero degli eventi' },
      { status: 500 }
    )
  }
}
