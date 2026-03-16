import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Recupera l'utente corrente e i suoi permessi
export async function GET(request: NextRequest) {
  try {
    // Recupera il token dall'header Authorization
    const authHeader = request.headers.get('authorization');
    console.log('/api/admin/me - Auth header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('/api/admin/me - No Bearer token found');
      return NextResponse.json(
        { error: 'Token non fornito' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('/api/admin/me - Token (first 20 chars):', token.substring(0, 20) + '...');

    // Decodifica il token base64 (formato: userId:timestamp)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      console.log('/api/admin/me - Decoded token:', decoded);

      const [userId] = decoded.split(':');

      if (!userId) {
        console.log('/api/admin/me - No userId in token');
        return NextResponse.json(
          { error: 'Token non valido' },
          { status: 401 }
        );
      }

      console.log('/api/admin/me - Searching for user:', userId);

      // Recupera l'utente con i permessi
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          permessi: true
        }
      });

      if (!user) {
        console.log('/api/admin/me - User not found:', userId);
        return NextResponse.json(
          { error: 'Utente non trovato' },
          { status: 404 }
        );
      }

      console.log('/api/admin/me - User found:', user.email, 'Role:', user.ruolo);
      console.log('/api/admin/me - Permissions:', user.permessi);

      // Ritorna solo i dati necessari (senza la password)
      const response = {
        id: user.id,
        email: user.email,
        nome: user.nome,
        cognome: user.cognome,
        ruolo: user.ruolo,
        permessi: user.permessi
      };

      console.log('/api/admin/me - Returning response');
      return NextResponse.json(response);
    } catch (decodeError) {
      console.error('Errore nella decodifica del token:', decodeError);
      return NextResponse.json(
        { error: 'Token non valido' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Errore nel recupero utente:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'utente' },
      { status: 500 }
    );
  }
}
