import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Recupera le informazioni del sito
export async function GET() {
  try {
    let siteInfo = await db.siteInfo.findFirst();

    // Se non esiste, crealo con valori di default
    if (!siteInfo) {
      siteInfo = await db.siteInfo.create({
        data: {
          nomeLocale: 'Il Nostro Ristorante'
        }
      });
    }

    return NextResponse.json(siteInfo);
  } catch (error) {
    console.error('Errore nel recupero site info:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle informazioni del sito' },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna le informazioni del sito
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nomeLocale,
      slogan,
      chiSiamoTitolo,
      chiSiamoTesto,
      logoUrl,
      faviconUrl,
      telefono,
      email
    } = body;

    // Cerca se esiste già un record
    let siteInfo = await db.siteInfo.findFirst();

    if (siteInfo) {
      // Aggiorna il record esistente
      siteInfo = await db.siteInfo.update({
        where: { id: siteInfo.id },
        data: {
          nomeLocale,
          slogan,
          chiSiamoTitolo,
          chiSiamoTesto,
          logoUrl,
          faviconUrl,
          telefono,
          email
        }
      });
    } else {
      // Crea un nuovo record
      siteInfo = await db.siteInfo.create({
        data: {
          nomeLocale: nomeLocale || 'Il Nostro Ristorante',
          slogan,
          chiSiamoTitolo,
          chiSiamoTesto,
          logoUrl,
          faviconUrl,
          telefono,
          email
        }
      });
    }

    return NextResponse.json(siteInfo);
  } catch (error) {
    console.error('Errore nell\'aggiornamento site info:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento delle informazioni del sito' },
      { status: 500 }
    );
  }
}
