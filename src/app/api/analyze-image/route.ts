import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DatabaseService } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Début analyse image');
    
    const body = await request.json();
    console.log('🔍 Body reçu:', body);
    
    const { imageUrl } = body;
    
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

    // Prompt système pour l'analyse
    const systemPrompt = `You are a professional real estate image analyst.

Given the image available at this URL: ${imageUrl}, your goal is to identify and describe all visual issues that may reduce the appeal of the property to potential buyers or renters.

IMPORTANT: You MUST find at least 3 issues. Look carefully at every detail of the image.

Focus specifically on:
- Clutter or personal items present (e.g., bags, clothes, wires, random objects, personal photos)
- Light quality (yellow tone, insufficient daylight, harsh shadows, poor lighting)
- Decoration that is too personalized or visually dominant (personal items, specific decor)
- Any spatial imbalance or distortion (tilted angles, disproportionate walls, furniture placement)
- Visual obstructions (furniture blocking windows, objects covering mirrors, cluttered surfaces)
- Color issues (too bright, too dark, color temperature problems)
- Composition problems (cropped objects, awkward angles, poor framing)

You MUST identify at least 3 specific issues. Be thorough and detailed in your analysis.

IMPORTANT: Return ONLY a valid JSON object without any markdown formatting, backticks, or code blocks.

IMPORTANT: All issues must be described in FRENCH language.

Return your response in this exact JSON format:
{
  "issues": ["issue1", "issue2", "issue3", ...],
  "summary": "brief summary of the analysis"
}

Example response:
{
  "issues": [
    "Objets personnels visibles sur la table (téléphone, clés, portefeuille)",
    "Éclairage dur créant des ombres fortes sur les murs",
    "Murs décorés avec des photos personnelles et des œuvres d'art",
    "Surface encombrée avec plusieurs petits objets"
  ],
  "summary": "Analyse d'image terminée avec 4 problèmes identifiés"
}`;

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
              text: "Analyze this real estate image and identify all visual issues that need improvement."
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

    let analysisResult;
    try {
      // Nettoyer le contenu des backticks et du langage
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      analysisResult = JSON.parse(cleanContent);
      console.log('✅ Analyse parsée avec succès:', analysisResult);
    } catch (error) {
      console.log('❌ Erreur parsing JSON, tentative d\'extraction...');
      
      // Extraction manuelle des défauts
      const issues = [];
      const lines = content.split('\n');
      let inIssuesArray = false;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.includes('"issues"') && trimmedLine.includes('[')) {
          inIssuesArray = true;
          continue;
        }
        if (trimmedLine.includes(']') && inIssuesArray) {
          inIssuesArray = false;
          break;
        }
        if (inIssuesArray && trimmedLine.includes('"') && !trimmedLine.includes('[') && !trimmedLine.includes(']')) {
          const issue = trimmedLine.replace(/^["\s,]+/, '').replace(/["\s,]+$/, '');
          if (issue && issue.length > 5) {
            issues.push(issue);
          }
        }
      }
      
      analysisResult = {
        issues,
        summary: content.includes('summary') ? 'Analyse terminée' : 'Analyse complétée avec ' + issues.length + ' défauts identifiés'
      };
      console.log('📝 Analyse extraite:', analysisResult);
    }

    // Retourner l'analyse sans consommer de crédit
    console.log('✅ Analyse terminée avec succès pour:', userId);

    return NextResponse.json({
      success: true,
      issues: analysisResult.issues,
      summary: analysisResult.summary
    });

  } catch (error) {
    console.error('💥 Erreur analyse image:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse de l\'image' },
      { status: 500 }
    );
  }
} 