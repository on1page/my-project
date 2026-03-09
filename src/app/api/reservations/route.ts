import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Crea una nuova prenotazione
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, cognome, email, telefono, data, ora, persone, note } = body

    if (!nome || !cognome || !email || !telefono || !data || !ora || !persone) {
      return NextResponse.json(
        { error: 'Tutti i campi obbligatori devono essere compilati' },
        { status: 400 }
      )
    }

    const reservation = await db.reservation.create({
      data: {
        nome,
        cognome,
        email,
        telefono,
        data,
        ora,
        persone: parseInt(persone),
        note: note || null
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Prenotazione ricevuta con successo!',
        reservation
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Errore nella creazione prenotazione:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione della prenotazione' },
      { status: 500 }
    )
  }
}
