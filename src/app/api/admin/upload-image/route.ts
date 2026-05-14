import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Validazione delle estensioni dei file
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file inviato' },
        { status: 400 }
      );
    }

    // Validazione dimensione file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Il file supera la dimensione massima di 5MB' },
        { status: 400 }
      );
    }

    // Validazione estensione file
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: 'Formato file non supportato. Formati ammessi: jpg, jpeg, png, gif, webp' },
        { status: 400 }
      );
    }

    // Genera nome file unico con timestamp
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${safeName}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

    // Assicura che la directory esista
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory già esistente, continua
    }

    // Converti il file in Buffer e salvalo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Restituisci l'URL del file
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Errore durante l\'upload:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'upload del file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
