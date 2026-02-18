import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Aggiorna un utente e i suoi permessi
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { email, nome, cognome, password, ruolo, permessi } = body;

    // Aggiorna l'utente
    const user = await db.user.update({
      where: { id: params.id },
      data: {
        email,
        nome,
        cognome,
        password: password || undefined,
        ruolo
      }
    });

    // Aggiorna i permessi se specificati
    if (permessi) {
      const existingPermissions = await db.permission.findUnique({
        where: { userId: params.id }
      });

      if (existingPermissions) {
        await db.permission.update({
          where: { userId: params.id },
          data: {
            puoGestireMenu: permessi.puoGestireMenu,
            puoGestireFooter: permessi.puoGestireFooter,
            puoGestireTemi: permessi.puoGestireTemi,
            puoGestireProfili: permessi.puoGestireProfili
          }
        });
      } else {
        await db.permission.create({
          data: {
            userId: params.id,
            puoGestireMenu: permessi.puoGestireMenu ?? true,
            puoGestireFooter: permessi.puoGestireFooter ?? true,
            puoGestireTemi: permessi.puoGestireTemi ?? true,
            puoGestireProfili: permessi.puoGestireProfili ?? false
          }
        });
      }
    }

    // Recupera l'utente completo con i permessi
    const userCompleto = await db.user.findUnique({
      where: { id: params.id },
      include: {
        permessi: true
      }
    });

    return NextResponse.json(userCompleto);
  } catch (error) {
    console.error('Errore nell\'aggiornamento utente:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dell\'utente' },
      { status: 500 }
    );
  }
}

// DELETE - Elimina un utente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore nell\'eliminazione utente:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'utente' },
      { status: 500 }
    );
  }
}
