import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash } from 'crypto'

// POST - Forza l'aggregazione dei dati analytics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type = 'all' } = body

    const results: any = {}

    // Esegui aggregazione giornaliera
    if (type === 'all' || type === 'daily') {
      results.daily = await aggregateDaily()
    }

    // Esegui aggregazione settimanale
    if (type === 'all' || type === 'weekly') {
      results.weekly = await aggregateWeekly()
    }

    // Esegui aggregazione mensile
    if (type === 'all' || type === 'monthly') {
      results.monthly = await aggregateMonthly()
    }

    // Esegui aggregazione annuale
    if (type === 'all' || type === 'yearly') {
      results.yearly = await aggregateYearly()
    }

    // Pulisci eventi vecchi (più di 15 giorni)
    if (type === 'all') {
      await cleanupOldEvents()
    }

    return NextResponse.json({
      success: true,
      message: 'Aggregazione completata con successo',
      results
    })
  } catch (error: any) {
    console.error('Errore nell\'aggregazione:', error)
    return NextResponse.json(
      { error: error?.message || 'Errore nell\'aggregazione dei dati' },
      { status: 500 }
    )
  }
}

// Aggregazione giornaliera - Eventi → AnalyticsDaily
async function aggregateDaily() {
  const today = new