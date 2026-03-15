import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT - Aggiorna una prenotazione
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('PUT /api/admin/reservations/[id] - Params:', params)

  try {
    const body = await request.json()
    const { stato, note } = body

    console.log('PUT - Body ricevuto:', { id: params.id, stato, note })

    const reservation = await db.reservation.update({
      where: { id: params.id },
      data: {
        ...(stato && { stato }),
        ...(note !== undefined && { note })
      }
    })

    console.log('PUT - Prenotazione aggiornata:', reservation)
    return NextResponse.json(reservation)
  } catch (error: any) {
    console.error('Errore nell\'aggiornamento prenotazione:', error)
    console.error('Dettagli errore:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    })
    return NextResponse.json(
      {
        error: 'Errore nell\'aggiornamento della prenotazione',
        details: error?.message || 'Errore sconosciuto'
      },
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