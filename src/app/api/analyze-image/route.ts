import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DatabaseService } from '@/lib/supabase';

// Force Node.js runtime pour Supabase et OpenAI
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Début analyse image');
    
    const body = await request.json();
    console.log('🔍 Body reçu:', body);
    
    const { imageUrl, userRequest } = body;
    
    if (!imageUrl) {
      console.error('❌ Pas d\'URL d\'image');
      return NextResponse.json(
        { error: 'URL de l\'image requise' },
        { status: 400 }
      );
    }

    console.log('🔍 URL image:', imageUrl);

    // Récupérer l'ID utilisateur depuis les headers (middleware)
    const userId = request.headers.get('x-user-id');
    console.log('🔍 ID utilisateur reçu dans /api/analyze-image:', userId);
    
    if (!userId) {
      console.error('❌ Pas d\'ID utilisateur dans /api/analyze-image');
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Vérifier que l'ID est un UUID valide
    if (userId === 'current-user-id' || userId === 'undefined' || !userId.includes('-')) {
      console.error('❌ ID utilisateur invalide dans /api/analyze-image:', userId);
      return NextResponse.json(
        { error: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }

    // Vérifier les crédits de l'utilisateur
    const user = await DatabaseService.getUserEmailAndCredits(userId);
    if (!user || user.credits <= 0) {
      console.log('❌ Crédits insuffisants pour:', userId);
      return NextResponse.json(
        { error: 'Crédits insuffisants' },
        { status: 402 }
      );
    }

    console.log('✅ Utilisateur autorisé pour analyse:', { userId, credits: user.credits });

    // Prompt système adaptatif selon la demande utilisateur
    const systemPrompt = `Tu es ImmoPix AI, un assistant IA spécialisé dans l'analyse d'images immobilières.

RÔLE PRINCIPAL : Répondre précisément à la demande spécifique de l'utilisateur concernant l'image fournie.

INSTRUCTIONS IMPORTANTES :
- Analyse TOUJOURS l'image fournie
- Réponds EXACTEMENT à la question ou demande de l'utilisateur
- Sois précis et informatif
- Si l'utilisateur demande des défauts → Liste les défauts
- Si l'utilisateur demande une localisation → Analyse les indices visuels pour localiser
- Si l'utilisateur demande une description → Décris l'image
- Si l'utilisateur demande des améliorations → Propose des améliorations
- FINI les réponses génériques d'analyse !

FORMAT DE RÉPONSE :
- Réponds en français naturel
- Pas de JSON forcé
- Réponse directe et conversationnelle
- Maximum 200 mots

EXEMPLES :
- Question: "Où est cet appartement ?" → Analyse les indices visuels (architecture, vue, style) pour donner des indices de localisation
- Question: "Quels sont les problèmes ?" → Liste les défauts spécifiques
- Question: "Décris cette pièce" → Description détaillée de la pièce
- Question: "Comment améliorer ?" → Suggestions d'amélioration`;

    // Appel à GPT-4o Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userRequest ? 
                `Demande de l'utilisateur: "${userRequest}". Réponds précisément à cette question en analysant l'image fournie.` :
                "Analyse cette image immobilière et décris ce que tu vois."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Aucune réponse de l\'IA');
    }

    console.log('🤖 Réponse brute de l\'IA:', content);

    // Retourner directement la réponse textuelle de l'IA
    console.log('✅ Analyse terminée avec succès pour:', userId);

    return NextResponse.json({
      success: true,
      response: content.trim(),
      userRequest: userRequest || null
    });

  } catch (error) {
    console.error('💥 Erreur analyse image:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse de l\'image' },
      { status: 500 }
    );
  }
} 