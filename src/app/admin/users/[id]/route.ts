import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Aggiorna un utente e i suoi permessi
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Next.js 16: params è una Promise, deve essere awaitata
  const { id } = await params

  try {
    const body = await request.json();
    const { email, nome, cognome, password, ruolo, permessi } = body;

    console.log('PUT - Dati ricevuti:', { id, email, nome, cognome, hasPassword: !!password, ruolo, permessi })

    // Prepara i dati per l'aggiornamento
    const updateData: any = {
      email,
      nome,
      cognome,
      ruolo
    }

    // Aggiorna la password solo se fornita (non vuota)
    if (password && password.trim() !== '') {
      updateData.password = password
    }

    console.log('PUT - Dati update:', updateData)

    // Aggiorna l'utente
    const user = await db.user.update({
      where: { id },
      data: updateData
    });

    console.log('PUT - Utente aggiornato:', user.id)

    // Aggiorna i permessi se specificati
    if (permessi) {
      const existingPermissions = await db.permission.findUnique({
        where: { userId: id }
      });

      if (existingPermissions) {
        await db.permission.update({
          where: { userId: id },
          data: {
            puoGestireMenu: permessi.puoGestireMenu,
            puoGestireFooter: permessi.puoGestireFooter,
            puoGestireTemi: permessi.puoGestireTemi,
            puoGestirePrenotazioni: permessi.puoGestirePrenotazioni,
            puoGestireDatiAzienda: permessi.puoGestireDatiAzienda,
            puoGestireProfili: permessi.puoGestireProfili
          }
        });
      } else {
        await db.permission.create({
          data: {
            userId: id,
            puoGestireMenu: permessi.puoGestireMenu ?? true,
            puoGestireFooter: permessi.puoGestireFooter ?? true,
            puoGestireTemi: permessi.puoGestireTemi ?? true,
            puoGestirePrenotazioni: permessi.puoGestirePrenotazioni ?? true,
            puoGestireDatiAzienda: permessi.puoGestireDatiAzienda ?? true,
            puoGestireProfili: permessi.puoGestireProfili ?? false
          }
        });
      }
    }

    // Recupera l'utente completo con i permessi
    const userCompleto = await db.user.findUnique({
      where: { id },
      include: {
        permessi: true
      }
    });

    console.log('PUT - Utente completo restituito')
    return NextResponse.json(userCompleto);
  } catch (error: any) {
    console.error('Errore nell\'aggiornamento utente:', error);
    console.error('Dettagli errore:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    });
    return NextResponse.json(
      {
        error: 'Errore nell\'aggiornamento dell\'utente',
        details: error?.message || 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

// DELETE - Elimina un utente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Next.js 16: params è una Promise, deve essere awaitata
  const { id } = await params

  try {
    await db.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Errore nell\'eliminazione utente:', error);
    console.error('Dettagli errore:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    });
    return NextResponse.json(
      {
        error: 'Errore nell\'eliminazione dell\'utente',
        details: error?.message || 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}