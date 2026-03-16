import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Recupera tutti gli utenti con i loro permessi
export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        permessi: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Errore nel recupero utenti:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli utenti' },
      { status: 500 }
    );
  }
}
