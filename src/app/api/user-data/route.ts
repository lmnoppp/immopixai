import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

// Forcer le rendu dynamique pour cette route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les données utilisateur depuis les headers (middleware)
    const userId = request.headers.get('x-user-id');
    const email = request.headers.get('x-user-email');
    const sessionToken = request.headers.get('x-session-token');

    console.log('🔍 Headers reçus dans /api/user-data:', { 
      userId, 
      email, 
      sessionToken 
    });

    if (!userId || !email || !sessionToken) {
      console.error('❌ Données utilisateur manquantes dans /api/user-data:', { 
        userId: !!userId, 
        email: !!email, 
        sessionToken: !!sessionToken 
      });
      return NextResponse.json({ 
        error: 'Données utilisateur manquantes',
        details: { userId: !!userId, email: !!email, sessionToken: !!sessionToken }
      }, { status: 401 });
    }

    // Vérifier que l'ID est un UUID valide
    if (userId === 'current-user-id' || userId === 'undefined' || !userId.includes('-')) {
      console.error('❌ ID utilisateur invalide:', userId);
      return NextResponse.json({ 
        error: 'ID utilisateur invalide',
        details: { userId }
      }, { status: 400 });
    }

    // Récupérer les données complètes depuis la base de données
    const userData = await DatabaseService.getUserData(userId);
    
    if (!userData) {
      console.error('❌ Utilisateur non trouvé dans la base de données:', userId);
      return NextResponse.json({ 
        error: 'Utilisateur non trouvé',
        details: { userId }
      }, { status: 404 });
    }

    // Retourner les données utilisateur complètes
    const responseData = {
      id: userId,
      email,
      credits: userData.credits,
      plan: userData.plan,
      session_token: sessionToken,
      login_date: new Date().toISOString()
    };

    console.log('✅ Données utilisateur retournées:', responseData);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('💥 Erreur récupération données utilisateur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 