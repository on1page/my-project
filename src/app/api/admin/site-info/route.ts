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
    console.log('PUT /api/admin/site-info - Body ricevuto:', body);

    const {
      nomeLocale,
      slogan,
      chiSiamoTitolo,
      chiSiamoTesto,
      logoUrl,
      faviconUrl,
      telefono,
      email,
      prenotazioniAttive
    } = body;

    // Cerca se esiste già un record
    let siteInfo = await db.siteInfo.findFirst();
    console.log('SiteInfo trovato:', siteInfo ? 'Sì' : 'No');

    const updateData: any = {}
    if (nomeLocale !== undefined) updateData.nomeLocale = nomeLocale
    if (slogan !== undefined) updateData.slogan = slogan
    if (chiSiamoTitolo !== undefined) updateData.chiSiamoTitolo = chiSiamoTitolo
    if (chiSiamoTesto !== undefined) updateData.chiSiamoTesto = chiSiamoTesto
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl
    if (faviconUrl !== undefined) updateData.faviconUrl = faviconUrl
    if (telefono !== undefined) updateData.telefono = telefono
    if (email !== undefined) updateData.email = email
    if (prenotazioniAttive !== undefined) updateData.prenotazioniAttive = prenotazioniAttive

    console.log('UpdateData:', updateData);

    if (siteInfo) {
      // Aggiorna il record esistente
      siteInfo = await db.siteInfo.update({
        where: { id: siteInfo.id },
        data: updateData
      });
      console.log('SiteInfo aggiornato:', siteInfo);
    } else {
      // Crea un nuovo record
      const createData: any = {
        nomeLocale: nomeLocale || 'Il Nostro Ristorante',
        slogan,
        chiSiamoTitolo,
        chiSiamoTesto,
        logoUrl,
        faviconUrl,
        telefono,
        email
      }

      if (prenotazioniAttive !== undefined) {
        createData.prenotazioniAttive = prenotazioniAttive
      } else {
        createData.prenotazioniAttive = true
      }

      console.log('CreateData:', createData);

      siteInfo = await db.siteInfo.create({
        data: createData
      });
      console.log('SiteInfo creato:', siteInfo);
    }

    return NextResponse.json(siteInfo);
  } catch (error) {
    console.error('Errore nell\'aggiornamento site info:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento delle informazioni del sito', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
