import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Force le runtime Node.js
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('💥 [API-CHAT] Variable d\'environnement OpenAI manquante');
    return NextResponse.json(
      { error: 'Configuration serveur incomplète. Le service est indisponible.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Le paramètre "message" est manquant ou invalide.' },
        { status: 400 }
      );
    }

    // Vérification de l'authentification (via middleware)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      console.error('❌ [API-CHAT] Pas d\'ID utilisateur dans le header');
      return NextResponse.json(
        { error: 'Authentification requise. Session invalide ou expirée.' },
        { status: 401 }
      );
    }

    console.info(`[API-CHAT] Requête de conversation pour l'utilisateur: ${userId}`);
    console.info(`[API-CHAT] Message reçu: ${message}`);

    // Construire l'historique des messages avec le contexte
    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      {
        role: "system" as const,
        content: `Tu es ImmoPix AI, un assistant IA spécialisé dans l'amélioration d'images immobilières. 

CONTEXTE IMPORTANT: Tu participes à une conversation continue. L'utilisateur peut répondre "oui", "non", "d'accord" à tes suggestions précédentes.

PERSONNALITÉ:
- Professionnel mais chaleureux
- Expert en photographie immobilière  
- Toujours prêt à aider
- Comprend le contexte de la conversation
- Utilise des emojis avec modération

FONCTIONNALITÉS:
- Analyse gratuite d'images immobilières
- Retouches payantes (1 crédit par retouche)
- Suppression d'objets (vaisselle, meubles, clutter)
- Amélioration de l'éclairage et des couleurs
- Modification de la décoration
- Ajout d'éléments (papier peint, couleurs murales)

RÈGLES DE CONVERSATION:
- Si l'utilisateur dit "oui" après avoir proposé une analyse → Demande l'image à améliorer
- Si l'utilisateur dit "non" → Propose autre chose ou reste disponible
- Si l'utilisateur dit "d'accord" → Continue selon le contexte (souvent demander l'image)
- Si l'utilisateur dit "améliore ces défauts" après une analyse → Demande l'image à retoucher
- TIENS COMPTE de tes analyses précédentes dans la conversation
- Évite de répéter "Bonjour" si la conversation a déjà commencé

RÈGLES:
- Réponds toujours en français
- Reste dans le contexte immobilier et de la conversation
- Pour les retouches, demande toujours une image d'abord
- Sois concis mais informatif
- Adapte ta réponse au contexte précédent
- Guide l'utilisateur vers l'upload d'image quand c'est pertinent`
      }
    ];

    // Ajouter les 3 derniers messages de conversation pour le contexte
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentMessages = conversationHistory.slice(-6); // 3 échanges (user + assistant)
      recentMessages.forEach(msg => {
        if (msg.type === 'user') {
          messages.push({
            role: 'user' as const,
            content: msg.text || message
          });
        } else if (msg.type === 'assistant' || msg.type === 'ai') {
          messages.push({
            role: 'assistant' as const,
            content: msg.text || ''
          });
        }
      });
    }

    // Ajouter le message actuel
    messages.push({
      role: "user" as const,
      content: message
    });

    // Appel à l'API OpenAI pour générer une réponse conversationnelle
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('Pas de réponse générée par OpenAI');
    }

    console.info(`[API-CHAT] Réponse générée avec succès pour l'utilisateur: ${userId}`);

    return NextResponse.json({
      success: true,
      response: response.trim(),
    });

  } catch (error) {
    console.error('💥 [API-CHAT] Erreur lors de la génération de réponse:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
    
    return NextResponse.json(
      { error: `Erreur lors de la génération de réponse: ${errorMessage}` },
      { status: 500 }
    );
  }
}
