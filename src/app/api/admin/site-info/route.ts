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
          nomeLocale: 'Il Nostro Ristorante',
          heroTitle: 'Autentica Cucina Italiana',
          heroCTAText: 'Scopri il Menu',
          specialitaTitle: 'Le Nostre Specialità'
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
      chiSiamoImageUrl,
      logoUrl,
      faviconUrl,
      telefono,
      email,
      prenotazioniAttive,
      // Hero Section
      heroTitle,
      heroSubtitle,
      heroCTAText,
      heroImageUrl,
      heroOverlayOpacity,
      // Specialità Section
      specialitaTitle,
      specialitaSubtitle
    } = body;

    // Cerca se esiste già un record
    let siteInfo = await db.siteInfo.findFirst();

    const updateData: any = {}
    if (nomeLocale !== undefined) updateData.nomeLocale = nomeLocale
    if (slogan !== undefined) updateData.slogan = slogan
    if (chiSiamoTitolo !== undefined) updateData.chiSiamoTitolo = chiSiamoTitolo
    if (chiSiamoTesto !== undefined) updateData.chiSiamoTesto = chiSiamoTesto
    if (chiSiamoImageUrl !== undefined) updateData.chiSiamoImageUrl = chiSiamoImageUrl
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl
    if (faviconUrl !== undefined) updateData.faviconUrl = faviconUrl
    if (telefono !== undefined) updateData.telefono = telefono
    if (email !== undefined) updateData.email = email
    if (prenotazioniAttive !== undefined) updateData.prenotazioniAttive = prenotazioniAttive
    
    // Hero Section
    if (heroTitle !== undefined) updateData.heroTitle = heroTitle
    if (heroSubtitle !== undefined) updateData.heroSubtitle = heroSubtitle
    if (heroCTAText !== undefined) updateData.heroCTAText = heroCTAText
    if (heroImageUrl !== undefined) updateData.heroImageUrl = heroImageUrl
    if (heroOverlayOpacity !== undefined) updateData.heroOverlayOpacity = heroOverlayOpacity
    
    // Specialità Section
    if (specialitaTitle !== undefined) updateData.specialitaTitle = specialitaTitle
    if (specialitaSubtitle !== undefined) updateData.specialitaSubtitle = specialitaSubtitle

    if (siteInfo) {
      // Aggiorna il record esistente
      siteInfo = await db.siteInfo.update({
        where: { id: siteInfo.id },
        data: updateData
      });
    } else {
      // Crea un nuovo record
      const createData: any = {
        nomeLocale: nomeLocale || 'Il Nostro Ristorante',
        slogan,
        chiSiamoTitolo,
        chiSiamoTesto,
        chiSiamoImageUrl,
        logoUrl,
        faviconUrl,
        telefono,
        email,
        heroTitle: heroTitle || 'Autentica Cucina Italiana',
        heroCTAText: heroCTAText || 'Scopri il Menu',
        specialitaTitle: specialitaTitle || 'Le Nostre Specialità'
      }

      if (prenotazioniAttive !== undefined) {
        createData.prenotazioniAttive = prenotazioniAttive
      } else {
        createData.prenotazioniAttive = true
      }

      // Aggiungi campi opzionali
      if (heroSubtitle) createData.heroSubtitle = heroSubtitle
      if (heroImageUrl) createData.heroImageUrl = heroImageUrl
      if (heroOverlayOpacity !== undefined) createData.heroOverlayOpacity = heroOverlayOpacity
      if (specialitaSubtitle) createData.specialitaSubtitle = specialitaSubtitle

      siteInfo = await db.siteInfo.create({
        data: createData
      });
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
