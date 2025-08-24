import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

// Force Node.js runtime pour Supabase
export const runtime = 'nodejs';

// Fonction pour générer un UUID côté serveur
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(request: Request) {
  try {
    // Validation de l'entrée JSON
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('❌ [API/LOGIN] Erreur parsing JSON:', parseError);
      return NextResponse.json({ 
        error: 'Format de données invalide' 
      }, { status: 400 });
    }

    const { email, code, userIp } = requestData;

    // Validation des champs requis
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ 
        error: 'Email requis et doit être une chaîne de caractères' 
      }, { status: 400 });
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ 
        error: 'Code d\'accès requis et doit être une chaîne de caractères' 
      }, { status: 400 });
    }

    if (!userIp || typeof userIp !== 'string') {
      return NextResponse.json({ 
        error: 'Adresse IP requise et doit être une chaîne de caractères' 
      }, { status: 400 });
    }

    // Validation basique du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Format d\'email invalide' 
      }, { status: 400 });
    }

    console.log('🚀 [API/LOGIN] Début processus de connexion pour:', { 
      email: email.substring(0, 3) + '***', // Log partiel pour sécurité
      code: code.substring(0, 5) + '***', 
      userIp 
    });

    // 1. Vérifier si l'utilisateur est blacklisté
    const isBlacklisted = await DatabaseService.isBlacklisted(email, userIp);
    if (isBlacklisted) {
      console.log('🚫 [API/LOGIN] Utilisateur blacklisté:', { email: email.substring(0, 3) + '***', userIp });
      return NextResponse.json({ 
        error: 'Accès refusé. Votre compte ou votre adresse IP est bloqué.' 
      }, { status: 403 });
    }

    // 2. Vérifier le code d'accès - Codes IMMO en dur
    const validCodes = {
      'IMMO-CONFORT-2025': { plan: 'premium', credits: 100 },
      'IMMO-STARTER-2025': { plan: 'starter', credits: 25 },
      'IMMO-PRO-2025': { plan: 'pro', credits: 50 }
    };
    const codeData = validCodes[code as keyof typeof validCodes];
    
    if (!codeData) {
      console.log('❌ [API/LOGIN] Code d\'accès invalide:', code.substring(0, 5) + '***');
      return NextResponse.json({ 
        error: 'Code d\'accès invalide' 
      }, { status: 400 });
    }

    console.log('✅ [API/LOGIN] Code valide trouvé pour plan:', codeData.plan);

    // 3. Créer ou mettre à jour l'utilisateur
    const sessionToken = generateUUID();
    const user = await DatabaseService.createUser({
      email,
      code,
      plan: codeData.plan,
      credits: codeData.credits,
      login_date: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      session_token: sessionToken
    });

    console.log('👤 [API/LOGIN] Utilisateur créé/mis à jour avec succès');

    // 4. Renvoyer le token de session au client
    return NextResponse.json({ 
      sessionToken, 
      credits: user.credits 
    }, { status: 200 });

  } catch (error) {
    console.error('💥 [API/LOGIN] Erreur serveur:', error);
    
    // Gestion d'erreur sécurisée - ne pas exposer les détails internes
    const isDevMode = process.env.NODE_ENV === 'development';
    const errorMessage = isDevMode && error instanceof Error 
      ? error.message 
      : 'Une erreur interne s\'est produite';
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
}
