import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Recupera i dati aziendali e legali
export async function GET() {
  try {
    let companyData = await db.companyData.findFirst();

    // Se non esiste, crealo con valori di default
    if (!companyData) {
      companyData = await db.companyData.create({
        data: {
          showCookieBanner: true,
          cookieBannerText: "Questo sito utilizza cookie tecnici e analitici per migliorare la tua esperienza di navigazione. Cliccando su 'Autorizzo', accetti l'uso dei cookie.",
          cookieAcceptText: "Autorizzo",
          cookieDeclineText: "Annulla",
          cookieTecnici: true,
          cookieAnalitici: true,
          cookieMarketing: true,
          privacyEnabled: true,
          cookiesEnabled: true
        }
      });
    }

    return NextResponse.json(companyData);
  } catch (error) {
    console.error('Errore nel recupero company data:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei dati aziendali' },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna i dati aziendali e legali
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('PUT /api/admin/company-data - Ricevuto body:', JSON.stringify(body, null, 2));

    const {
      id,
      ragioneSociale,
      partitaIva,
      codiceFiscale,
      indirizzo,
      citta,
      cap,
      provincia,
      paese,
      telefono,
      email,
      pec,
      dpoNome,
      dpoEmail,
      dpoIndirizzo,
      privacyPolicy,
      privacyEnabled,
      cookiesPolicy,
      cookiesEnabled,
      cookieTecnici,
      cookieAnalitici,
      cookieMarketing,
      terminiServizio,
      privacyUrl,
      cookiesUrl,
      terminiUrl,
      showCookieBanner,
      cookieBannerText,
      cookieAcceptText,
      cookieDeclineText,
      thirdPartyScriptsEnabled,
      googleAnalyticsId,
      facebookPixelId,
      amazonTagId
    } = body;

    let companyData = await db.companyData.findFirst();

    const updateData: any = {};

    // Aggiorna solo i campi forniti
    if (ragioneSociale !== undefined) updateData.ragioneSociale = ragioneSociale;
    if (partitaIva !== undefined) updateData.partitaIva = partitaIva;
    if (codiceFiscale !== undefined) updateData.codiceFiscale = codiceFiscale;
    if (indirizzo !== undefined) updateData.indirizzo = indirizzo;
    if (citta !== undefined) updateData.citta = citta;
    if (cap !== undefined) updateData.cap = cap;
    if (provincia !== undefined) updateData.provincia = provincia;
    if (paese !== undefined) updateData.paese = paese;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (email !== undefined) updateData.email = email;
    if (pec !== undefined) updateData.pec = pec;
    if (dpoNome !== undefined) updateData.dpoNome = dpoNome;
    if (dpoEmail !== undefined) updateData.dpoEmail = dpoEmail;
    if (dpoIndirizzo !== undefined) updateData.dpoIndirizzo = dpoIndirizzo;
    if (privacyPolicy !== undefined) updateData.privacyPolicy = privacyPolicy;
    if (privacyEnabled !== undefined) updateData.privacyEnabled = privacyEnabled;
    if (cookiesPolicy !== undefined) updateData.cookiesPolicy = cookiesPolicy;
    if (cookiesEnabled !== undefined) updateData.cookiesEnabled = cookiesEnabled;
    if (cookieTecnici !== undefined) updateData.cookieTecnici = cookieTecnici;
    if (cookieAnalitici !== undefined) updateData.cookieAnalitici = cookieAnalitici;
    if (cookieMarketing !== undefined) updateData.cookieMarketing = cookieMarketing;
    if (terminiServizio !== undefined) updateData.terminiServizio = terminiServizio;
    if (privacyUrl !== undefined) updateData.privacyUrl = privacyUrl;
    if (cookiesUrl !== undefined) updateData.cookiesUrl = cookiesUrl;
    if (terminiUrl !== undefined) updateData.terminiUrl = terminiUrl;
    if (showCookieBanner !== undefined) updateData.showCookieBanner = showCookieBanner;
    if (cookieBannerText !== undefined) updateData.cookieBannerText = cookieBannerText;
    if (cookieAcceptText !== undefined) updateData.cookieAcceptText = cookieAcceptText;
    if (cookieDeclineText !== undefined) updateData.cookieDeclineText = cookieDeclineText;
    if (thirdPartyScriptsEnabled !== undefined) updateData.thirdPartyScriptsEnabled = thirdPartyScriptsEnabled;
    if (googleAnalyticsId !== undefined) updateData.googleAnalyticsId = googleAnalyticsId;
    if (facebookPixelId !== undefined) updateData.facebookPixelId = facebookPixelId;
    if (amazonTagId !== undefined) updateData.amazonTagId = amazonTagId;

    // Aggiorna data ultima modifica
    if (privacyPolicy !== undefined || Object.keys(updateData).some(k => k.includes('privacy'))) {
      updateData.privacyPolicyUpdate = new Date();
    }
    if (cookiesPolicy !== undefined || Object.keys(updateData).some(k => k.includes('cookie'))) {
      updateData.cookiesPolicyUpdate = new Date();
    }

    if (companyData) {
      companyData = await db.companyData.update({
        where: { id: companyData.id },
        data: updateData
      });
      console.log('Company data aggiornato con successo');
    } else {
      const createData: any = {
        ragioneSociale: ragioneSociale || null,
        partitaIva: partitaIva || null,
        codiceFiscale: codiceFiscale || null,
        indirizzo: indirizzo || null,
        citta: citta || null,
        cap: cap || null,
        provincia: provincia || null,
        paese: paese || null,
        telefono: telefono || null,
        email: email || null,
        pec: pec || null,
        dpoNome: dpoNome || null,
        dpoEmail: dpoEmail || null,
        dpoIndirizzo: dpoIndirizzo || null,
        privacyPolicy: privacyPolicy || null,
        privacyEnabled: privacyEnabled !== undefined ? privacyEnabled : true,
        cookiesPolicy: cookiesPolicy || null,
        cookiesEnabled: cookiesEnabled !== undefined ? cookiesEnabled : true,
        cookieTecnici: cookieTecnici !== undefined ? cookieTecnici : true,
        cookieAnalitici: cookieAnalitici !== undefined ? cookieAnalitici : true,
        cookieMarketing: cookieMarketing !== undefined ? cookieMarketing : true,
        terminiServizio: terminiServizio || null,
        privacyUrl: privacyUrl || null,
        cookiesUrl: cookiesUrl || null,
        terminiUrl: terminiUrl || null,
        showCookieBanner: showCookieBanner !== undefined ? showCookieBanner : true,
        cookieBannerText: cookieBannerText || "Questo sito utilizza cookie tecnici e analitici per migliorare la tua esperienza di navigazione. Cliccando su 'Autorizzo', accetti l'uso dei cookie.",
        cookieAcceptText: cookieAcceptText || "Autorizzo",
        cookieDeclineText: cookieDeclineText || "Annulla",
        thirdPartyScriptsEnabled: thirdPartyScriptsEnabled !== undefined ? thirdPartyScriptsEnabled : true,
        googleAnalyticsId: googleAnalyticsId || null,
        facebookPixelId: facebookPixelId || null,
        amazonTagId: amazonTagId || null,
        privacyPolicyUpdate: new Date(),
        cookiesPolicyUpdate: new Date()
      };

      companyData = await db.companyData.create({
        data: createData
      });
      console.log('Company data creato con successo');
    }

    return NextResponse.json(companyData);
  } catch (error) {
    console.error('Errore nell\'aggiornamento company data:', error);

    if (error instanceof Error) {
      console.error('Nome errore:', error.name);
      console.error('Messaggio errore:', error.message);
      console.error('Stack trace:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Errore nell\'aggiornamento dei dati aziendali',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    );
  }
}
