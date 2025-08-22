import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

// Forcer le rendu dynamique pour cette route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Récupérer le token depuis les headers (middleware)
    const sessionToken = request.headers.get('x-session-token');
    
    if (sessionToken) {
      // Invalider la session en base
      await DatabaseService.invalidateSession(sessionToken);
    }

    // Créer une réponse avec un cookie de session supprimé
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session_token');
    
    return response;

  } catch (error) {
    console.error('Erreur logout:', error);
    return NextResponse.json({ error: 'Erreur lors de la déconnexion' }, { status: 500 });
  }
} 