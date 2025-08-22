import { NextRequest, NextResponse } from 'next/server';
import { ImageKitService } from '@/lib/imagekit';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Validation des dépendances critiques (variables d'environnement ImageKit)
  if (
    !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
    !process.env.IMAGEKIT_PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
  ) {
    console.error('💥 [API-UPLOAD] Variables d\'environnement ImageKit manquantes.');
    return NextResponse.json(
      { error: 'Configuration serveur incomplète. Le service d\'upload est indisponible.' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Aucune image fournie' },
        { status: 400 }
      );
    }

    // Validation du fichier
    if (!imageFile.type.match(/image\/(jpeg|jpg|png)/)) {
      return NextResponse.json(
        { error: 'Format d\'image non supporté. Utilisez JPEG ou PNG.' },
        { status: 400 }
      );
    }

    if (imageFile.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image trop volumineuse. Taille maximum : 15 Mo' },
        { status: 400 }
      );
    }

    // Upload sur ImageKit
    const imageUrl = await ImageKitService.uploadImage(imageFile);

    return NextResponse.json({
      success: true,
      imageUrl
    });

  } catch (error) {
    console.error('Erreur upload image:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de l\'image' },
      { status: 500 }
    );
  }
} 