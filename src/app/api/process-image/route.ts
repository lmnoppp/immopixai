import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Replicate from 'replicate';
import { DatabaseService } from '@/lib/supabase';

// Force le runtime Node.js et désactive le cache. Essentiel pour les libs utilisées.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  // 1. Validation des dépendances critiques (variables d'environnement)
  if (!process.env.OPENAI_API_KEY || !process.env.REPLICATE_API_TOKEN) {
    console.error('💥 [API-PROCESS] Variables d\'environnement manquantes (OpenAI ou Replicate)');
    return NextResponse.json(
      { error: 'Configuration serveur incomplète. Le service est indisponible.' },
      { status: 500 }
    );
  }

  try {
    // 2. Validation du corps de la requête
    const body = await request.json();
    const { imageUrl, issues, processingOptions, isAutomatic } = body;
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Le paramètre "imageUrl" est manquant ou invalide.' },
        { status: 400 }
      );
    }

    // 3. Validation de l'authentification (via middleware)
    const userId = request.headers.get('x-user-id');
    console.info(`[API-PROCESS] Requête reçue pour l'utilisateur: ${userId}`);
    
    if (!userId) {
      console.error('❌ [API-PROCESS] Pas d\'ID utilisateur dans le header. Le middleware a-t-il échoué ?');
      return NextResponse.json(
        { error: 'Authentification requise. Session invalide ou expirée.' },
        { status: 401 }
      );
    }

    // 4. Validation des crédits de l'utilisateur
    const user = await DatabaseService.getUserEmailAndCredits(userId);
    if (!user || user.credits <= 0) {
      console.warn(`[API-PROCESS] Crédits insuffisants pour l'utilisateur: ${userId}`);
      return NextResponse.json(
        { error: 'Crédits insuffisants pour effectuer cette opération.' },
        { status: 402 } // 402 Payment Required est sémantiquement correct ici
      );
    }

    console.info(`[API-PROCESS] Utilisateur autorisé avec ${user.credits} crédits.`);

    // 5. Génération du prompt final basé sur les issues détectées
    let finalPrompt = `Analyse et améliore cette image pour une annonce immobilière.`; // Placeholder
    // NOTE: La logique complexe de génération de prompt a été retirée de cet extrait pour se concentrer sur les correctifs
    
    if (isAutomatic) {
      // Mode automatique - prompt basé uniquement sur les issues détectées
      
      // Créer des instructions spécifiques basées sur les défauts
      const specificInstructions = issues.map((issue: string) => {
        if (issue.includes('vaisselle') || issue.includes('égouttoir') || issue.includes('ustensiles') || issue.includes('casseroles')) {
          return 'remove all dishes, utensils, kitchen items, and cooking equipment from countertops and sink area';
        }
        if (issue.includes('éclairage') || issue.includes('sombre') || issue.includes('insuffisant') || issue.includes('ambiance sombre')) {
          return 'enhance natural lighting, brighten the room, improve overall illumination, and create a warm, inviting atmosphere';
        }
        if (issue.includes('plafond') || issue.includes('incliné') || issue.includes('confinement') || issue.includes('restreint') || issue.includes('oppressant')) {
          return 'minimize the visual impact of the sloped ceiling, create a more open and spacious feeling, improve room proportions';
        }
        if (issue.includes('désordre') || issue.includes('encombré') || issue.includes('clutter')) {
          return 'remove all clutter and personal items, organize the space for a clean, minimalist, and professional look';
        }
        if (issue.includes('décoration') || issue.includes('personnalisée') || issue.includes('dominante')) {
          return 'neutralize personalized decor and create a universal, neutral atmosphere suitable for all potential buyers';
        }
        if (issue.includes('pipes') || issue.includes('inachevé') || issue.includes('finition')) {
          return 'hide or improve the appearance of visible pipes and unfinished areas, create a polished look';
        }
        // Fallback pour les autres défauts
        return `fix: ${issue}`;
      });
      
      finalPrompt = `Do: ${specificInstructions.join(', ')}
Don't: change room structure, add new furniture, alter walls or windows, distort perspective, modify architectural elements`;
    } else {
      // Mode personnalisé - prompt basé sur les issues + préférences utilisateur
      const { removeObjects, improveLighting, neutralizeDecor, preserveElements } = processingOptions;
      
      const specificInstructions = [];
      
      if (removeObjects) {
        const objectIssues = issues.filter((issue: string) => 
          issue.includes('vaisselle') || issue.includes('égouttoir') || issue.includes('ustensiles') || 
          issue.includes('désordre') || issue.includes('encombré') || issue.includes('clutter')
        );
        if (objectIssues.length > 0) {
          specificInstructions.push('remove all personal items, dishes, utensils, and clutter from all surfaces');
        }
      }
      
      if (improveLighting) {
        const lightingIssues = issues.filter((issue: string) => 
          issue.includes('éclairage') || issue.includes('sombre') || issue.includes('insuffisant') || issue.includes('ambiance')
        );
        if (lightingIssues.length > 0) {
          specificInstructions.push('enhance natural lighting, brighten the room, and create a warm, inviting atmosphere');
        }
      }
      
      if (neutralizeDecor) {
        const decorIssues = issues.filter((issue: string) => 
          issue.includes('décoration') || issue.includes('personnalisée') || issue.includes('dominante')
        );
        if (decorIssues.length > 0) {
          specificInstructions.push('neutralize personalized decor and create a universal, neutral atmosphere');
        }
      }
      
      const dontActions = ['change room structure', 'add new furniture', 'distort perspective'];
      if (preserveElements && preserveElements.trim()) {
        dontActions.push(`alter ${preserveElements.trim()}`);
      }
      
      finalPrompt = `Do: ${specificInstructions.join(', ')}
Don't: ${dontActions.join(', ')}`;
    }

    console.log('✅ Prompt généré avec succès pour:', userId);
    console.log('🔍 Prompt envoyé à Replicate:', finalPrompt);
    console.log('🔍 URL image envoyée à Replicate:', imageUrl);
    console.log('🔍 Type de l\'URL image:', typeof imageUrl);
    console.log('🔍 L\'URL image commence par http:', imageUrl.startsWith('http'));

    // 6. Appel au service externe (Replicate) avec une gestion d'erreur spécifique
    let processedImageUrl: string;
    const startTime = Date.now(); // <-- CORRECTION: Réintroduction de startTime
    try {
      console.info(`[API-PROCESS] Lancement du traitement Replicate pour l'utilisateur: ${userId}`);
      
      const replicateInput = {
        input_image: imageUrl, // CORRECTION: Le paramètre s'appelle "input_image" et non "image"
        prompt: finalPrompt,
        num_inference_steps: 20,
        guidance_scale: 7.5
      };

      const prediction = await replicate.predictions.create({
        version: "0f1178f5a27e9aa2d2d39c8a43c110f7fa7cbf64062ff04a04cd40899e546065",
        input: {
          input_image: imageUrl, // CORRECTION: Appliquer aussi ici
          prompt: finalPrompt,
          num_inference_steps: 20,
          guidance_scale: 7.5
        },
      });

      const result = await replicate.wait(prediction);
      
      if (result.status === 'succeeded' && result.output) {
        // Gérer les deux cas de figure : une URL seule (string) ou un tableau d'URLs
        if (Array.isArray(result.output) && result.output.length > 0) {
          processedImageUrl = result.output[0];
        } else if (typeof result.output === 'string') {
          processedImageUrl = result.output;
        } else {
          // Si le format n'est ni un tableau non vide, ni une string, c'est une erreur de format
          console.error('[API-PROCESS] Le format de sortie de Replicate est inattendu.', result.output);
          throw new Error('Le format de la réponse du service d\'images est invalide.');
        }
        console.info(`[API-PROCESS] Traitement Replicate réussi pour l'utilisateur: ${userId}`);
      } else {
        console.error(`[API-PROCESS] Le traitement Replicate a échoué ou a été annulé. Status: ${result.status}`, result.error);
        throw new Error(`Le service de traitement d'images a retourné un statut inattendu: ${result.status}`);
      }
    } catch (replicateError) {
      console.error('💥 [API-PROCESS] Erreur lors de l\'appel à Replicate:', replicateError);
      return NextResponse.json(
        { error: 'Le service externe de traitement d\'images a rencontré une erreur. Vos crédits n\'ont pas été débités.' },
        { status: 503 } // 503 Service Unavailable
      );
    }

    // 7. Consommation de crédit (uniquement en cas de succès)
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    await DatabaseService.consumeCredit(userId, ipAddress);
    console.info(`[API-PROCESS] Un crédit a été consommé pour l'utilisateur: ${userId}`);

    // 7. Réponse en cas de succès
    return NextResponse.json({
      success: true,
      processedImageUrl,
      latency: Date.now() - startTime,
    });

  } catch (error) {
    console.error('💥 [API-PROCESS] Erreur interne inattendue:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
    return NextResponse.json(
      { error: `Erreur interne du serveur: ${errorMessage}` },
      { status: 500 }
    );
  }
}
