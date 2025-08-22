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
    const { email, code, userIp } = await request.json();

    console.log('🚀 [API/LOGIN] Début processus de connexion pour:', { email, code, userIp });

    // 1. Vérifier si l'utilisateur est blacklisté
    const isBlacklisted = await DatabaseService.isBlacklisted(email, userIp);
    if (isBlacklisted) {
      console.log('🚫 [API/LOGIN] Utilisateur blacklisté:', { email, userIp });
      return NextResponse.json({ error: 'Accès refusé. Votre compte ou votre adresse IP est bloqué.' }, { status: 403 });
    }

    // 2. Vérifier le code d'accès
    const validCodes = {
      'IMMO-STARTER-2025': { plan: 'starter', credits: 40 },
      'IMMO-CONFORT-2025': { plan: 'confort', credits: 150 },
      'IMMO-PROMAX-2025': { plan: 'promax', credits: 300 },
      'IMMOPIXTESTMVP07': { plan: 'test', credits: 3 }
    };
    const codeData = validCodes[code as keyof typeof validCodes];
    
    if (!codeData) {
      console.log('❌ [API/LOGIN] Code d\'accès invalide:', code);
      return NextResponse.json({ error: 'Code d\'accès invalide' }, { status: 400 });
    }

    console.log('✅ [API/LOGIN] Code valide trouvé:', codeData);

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

    console.log('👤 [API/LOGIN] Utilisateur créé/mis à jour:', user);

    // 4. Renvoyer le token de session au client
    return NextResponse.json({ sessionToken, credits: user.credits });

  } catch (error) {
    console.error('💥 [API/LOGIN] Erreur serveur:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: `Erreur interne du serveur: ${errorMessage}` }, { status: 500 });
  }
}
