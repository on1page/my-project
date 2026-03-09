import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Recupera i dati aziendali
export async function GET() {
  try {
    let companyData = await db.companyData.findFirst()

    // Se non esistono dati, creali vuoti
    if (!companyData) {
      companyData = await db.companyData.create({
        data: {}
      })
    }

    return NextResponse.json(companyData)
  } catch (error) {
    console.error('Errore nel recupero dati aziendali:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dei dati aziendali' },
      { status: 500 }
    )
  }
}

// PUT - Aggiorna i dati aziendali
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ragioneSociale, partitaIva, privacyPolicy, cookiesPolicy, terminiServizio } = body

    let companyData = await db.companyData.findFirst()

    if (companyData) {
      // Aggiorna i dati esistenti
      companyData = await db.companyData.update({
        where: { id: companyData.id },
        data: {
          ragioneSociale,
          partitaIva,
          privacyPolicy,
          cookiesPolicy,
          terminiServizio
        }
      })
    } else {
      // Crea nuovi dati
      companyData = await db.companyData.create({
        data: {
          ragioneSociale,
          partitaIva,
          privacyPolicy,
          cookiesPolicy,
          terminiServizio
        }
      })
    }

    return NextResponse.json(companyData)
  } catch (error) {
    console.error('Errore nel salvataggio dati aziendali:', error)
    return NextResponse.json(
      { error: 'Errore nel salvataggio dei dati aziendali' },
      { status: 500 }
    )
  }
}