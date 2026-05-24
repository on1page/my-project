import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Recupera eventi pubblici
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const soloDisponibili = searchParams.get('soloDisponibili') === 'true'

    const where: any = {
      stato: { not: 'cancelled' }
    }

    if (categoria && categoria !== 'all') {
      where.categoria = categoria
    }

    if (soloDisponibili) {
      where.stato = 'available'
    }

    const eventi = await db.evento.findMany({
      where,
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
