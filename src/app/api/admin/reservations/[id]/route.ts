import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT - Aggiorna una prenotazione
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { stato, note } = body

    const reservation = await db.reservation.update({
      where: { id: params.id },
      data: {
        ...(stato && { stato }),
        ...(note !== undefined && { note })
      }
    })

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Errore nell\'aggiornamento prenotazione:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento della prenotazione' },
      { status: 500 }
    )
  }
}

// DELETE - Elimina una prenotazione
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.reservation.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Errore nell\'eliminazione prenotazione:', error)
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione della prenotazione' },
      { status: 500 }
    )
  }
}