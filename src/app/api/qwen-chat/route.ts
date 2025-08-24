import { NextRequest, NextResponse } from 'next/server';

// Force le runtime Node.js
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!process.env.QWEN_API_KEY) {
    console.error('💥 [API-QWEN] Variable d\'environnement Qwen manquante');
    return NextResponse.json(
      { error: 'Configuration serveur incomplète. Le service est indisponible.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { message, needsImageAnalysis = false, hasImage = false, conversationHistory = [] } = body;
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Le paramètre "message" est manquant ou invalide.' },
        { status: 400 }
      );
    }

    // Vérification de l'authentification (via middleware)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      console.error('❌ [API-QWEN] Pas d\'ID utilisateur dans le header');
      return NextResponse.json(
        { error: 'Authentification requise. Session invalide ou expirée.' },
        { status: 401 }
      );
    }

    console.info(`[API-QWEN] Requête de conversation pour l'utilisateur: ${userId}`);
    console.info(`[API-QWEN] Message reçu: ${message}`);

    // Construire l'historique des messages avec le contexte
    const messages = [
      {
        role: 'system',
        content: `Tu es ImmoPix AI, un assistant IA spécialisé dans l'amélioration d'images immobilières.

CONTEXTE IMPORTANT: Tu participes à une conversation continue. L'utilisateur peut répondre "oui", "non", "d'accord" à tes suggestions précédentes.

PERSONNALITÉ:
- Professionnel mais chaleureux
- Expert en photographie immobilière  
- Comprend le contexte de la conversation
- Utilise des emojis avec modération

CAPACITÉS PRINCIPALES:
- Analyse gratuite d'images immobilières (via GPT Vision)
- Retouches payantes (1 crédit par retouche)
- Suppression d'objets, amélioration éclairage, modification décoration

RÈGLES DE CONVERSATION:
- Si l'utilisateur dit "oui" après avoir proposé une analyse → Demande l'image à améliorer
- Si l'utilisateur dit "non" → Propose autre chose ou reste disponible
- Si l'utilisateur dit "d'accord" → Continue selon le contexte (souvent demander l'image)
- Si l'utilisateur dit "améliore ces défauts/les défauts" après avoir analysé une image → REDIRECT VERS GPT pour traitement automatique
- IMPORTANT: Si tu as déjà analysé une image dans cette conversation et que l'utilisateur demande des améliorations, redirige vers GPT
- TIENS COMPTE de tes analyses précédentes dans la conversation
- Évite de répéter "Bonjour" si la conversation a déjà commencé

RÈGLES DE REDIRECTION:
- Si l'utilisateur envoie UNIQUEMENT une image → Redirige vers l'analyse GPT Vision
- Si l'utilisateur demande explicitement une "analyse détaillée" → Redirige vers GPT
- Sinon, traite la conversation normalement

INSTRUCTIONS:
- Réponds toujours en français
- Reste dans le contexte immobilier et de la conversation
- Sois concis mais informatif
- Adapte ta réponse au contexte précédent

Si tu détectes qu'une redirection vers GPT est nécessaire, réponds exactement: "REDIRECT_TO_GPT: [raison]"`
      }
    ];

    // Ajouter les 3 derniers messages de conversation pour le contexte
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentMessages = conversationHistory.slice(-6); // 3 échanges (user + assistant)
      recentMessages.forEach(msg => {
        if (msg.type === 'user') {
          messages.push({
            role: 'user',
            content: msg.text || message
          });
        } else if (msg.type === 'assistant' || msg.type === 'ai') {
          messages.push({
            role: 'assistant',
            content: msg.text || ''
          });
        }
      });
    }

    // Ajouter le message actuel
    messages.push({
      role: 'user',
      content: needsImageAnalysis ? 
        `L'utilisateur a envoyé une image seule pour analyse. Redirige vers GPT Vision. Message: "${message}"` :
        hasImage ? 
          `L'utilisateur a envoyé une image avec ce message: "${message}". L'image est déjà fournie dans la conversation.` :
          message
    });

    // Appel à l'API Qwen via OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://immopix.ai',
        'X-Title': 'ImmoPix AI'
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-72b-instruct',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API Qwen: ${response.status}`);
    }

    const data = await response.json();
    const qwenResponse = data.choices[0]?.message?.content;
    
    if (!qwenResponse) {
      throw new Error('Pas de réponse générée par Qwen');
    }

    console.info(`[API-QWEN] Réponse générée avec succès pour l'utilisateur: ${userId}`);

    // Vérifier si Qwen demande une redirection vers GPT
    if (qwenResponse.startsWith('REDIRECT_TO_GPT:')) {
      return NextResponse.json({
        success: true,
        response: qwenResponse.trim(),
        redirectToGPT: true,
      });
    }

    return NextResponse.json({
      success: true,
      response: qwenResponse.trim(),
      redirectToGPT: false,
    });

  } catch (error) {
    console.error('💥 [API-QWEN] Erreur lors de la génération de réponse:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
    
    return NextResponse.json(
      { error: `Erreur lors de la génération de réponse: ${errorMessage}` },
      { status: 500 }
    );
  }
}
