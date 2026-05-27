import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Calcola i posti rimanenti per un evento
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventoId = params.id

    // Recupera l'evento
    const evento = await db.evento.findUnique({
      where: { id: eventoId }
    })

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento non trovato' },
        { status: 404 }
      )
    }

    // Se non ha capacità, non ci sono posti limitati
    if (evento.capacita === 0) {
      return NextResponse.json({
        capacita: 0,
        confermati: 0,
        rimanenti: null,
        postiLimitati: false
      })
    }

    // Conta le prenotazioni confermate per questo evento
    const prenotazioniConfermate = await db.reservation.count({
      where: {
        eventoId: eventoId,
        stato: 'confirmed'
      }
    })

    const rimanenti = evento.capacita - prenotazioniConfermate

    return NextResponse.json({
      capacita: evento.capacita,
      confermati: prenotazioniConfermate,
      rimanenti: rimanenti < 0 ? 0 : rimanenti,
      postiLimitati: true
    })
  } catch (error) {
    console.error('Errore nel calcolo posti rimanenti:', error)
    return NextResponse.json(
      { error: 'Errore nel calcolo dei posti rimanenti' },
      { status: 500 }
    )
  }
}