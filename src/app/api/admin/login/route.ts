import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono richiesti' },
        { status: 400 }
      )
    }

    // Cerca l'utente nel database
    const user = await db.user.findUnique({
      where: { email },
      include: { permessi: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      )
    }

    // Verifica la password (in produzione usa hash!)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      )
    }

    // Genera un token semplice (in produzione usa JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    // Rimuovi la password dalla risposta
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      token,
      user: {
        ...userWithoutPassword,
        permessi: user.permessi
      }
    })
  } catch (error) {
    console.error('Errore login:', error)
    return NextResponse.json(
      { error: 'Errore durante il login' },
      { status: 500 }
    )
  }
}
