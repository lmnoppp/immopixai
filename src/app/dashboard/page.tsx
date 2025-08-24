'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { ChatMessage } from '@/components/ChatMessage';
import { ImageUpload } from '@/components/ImageUpload';
import { DatabaseService } from '@/lib/supabase';

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
  image?: {
    file: File;
    preview: string;
  };
  generatedImage?: {
    url: string;
    downloadName: string;
  };
  timestamp: Date;
  isAnalysis?: boolean; // Gratuit si true
  isRetrying?: boolean; // Retry gratuit
}

interface SessionMemory {
  lastUploadedImage: { file: File; preview: string } | null;
  lastGeneratedImage: { url: string; downloadName: string } | null;
  conversationHistory: Message[];
  retryCount: number;
}

// Forcer le rendu dynamique pour cette page (pas de prerender)
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  // Données utilisateur réelles (récupérées via useEffect)
  const [userData, setUserData] = useState<{
    email: string;
    credits: number;
    id: string;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      text: 'Bonjour ! Je suis ImmoPix AI, votre assistant intelligent pour l\'analyse et la retouche d\'images immobilières. 📸\n\nVous pouvez :\n• Envoyer une image pour une analyse gratuite\n• Demander des retouches spécifiques (suppression d\'objets, amélioration lumière, etc.)\n• Enchaîner les modifications sur la même image\n\nComment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
      isAnalysis: true
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'chat' | 'analysis' | 'processing'>('chat');
  const [sessionMemory, setSessionMemory] = useState<SessionMemory>({
    lastUploadedImage: null,
    lastGeneratedImage: null,
    conversationHistory: [],
    retryCount: 0
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Récupérer les données utilisateur au chargement
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user-data');
        if (response.ok) {
          const user = await response.json();
          setUserData({
            email: user.email,
            credits: user.credits,
            id: user.id
          });
        } else {
          console.error('Erreur récupération données utilisateur');
          // Rediriger vers login si pas authentifié
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Erreur API user-data:', error);
        window.location.href = '/login';
      }
    };

    fetchUserData();
  }, []);



  // Analyser l'intention avec LLM intelligent - COMPRÉHENSION VRAIE
  const analyzeUserIntent = async (text: string, hasImage: boolean): Promise<'analysis' | 'edit_request' | 'need_image' | 'continuation' | 'conversation' | 'clarification'> => {
    console.log('🧠 [INTENT] Analyse LLM intelligente pour:', text, 'avec image:', hasImage);
    
    // Si pas de texte et image uniquement -> analyse directe
    if (hasImage && !text.trim()) {
      return 'analysis';
    }
    
    // Récupérer le contexte complet
    const recentMessages = messages.slice(-6);
    const hasRecentImage = recentMessages.some(msg => msg.type === 'user' && msg.image);
    const recentAnalysis = recentMessages.find(msg => msg.type === 'ai' && msg.isAnalysis === true);
    
    // Construire le contexte riche
    const conversationContext = recentMessages.map(msg => 
      `${msg.type === 'user' ? 'UTILISATEUR' : 'IA'}: ${msg.text || '[image envoyée]'}${msg.image ? ' [AVEC IMAGE]' : ''}`
    ).join('\n');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Tu es un analyseur d'intentions ultra-précis. Ta mission est de comprendre EXACTEMENT ce que veut l'utilisateur.

HISTORIQUE COMPLET DE LA CONVERSATION:
${conversationContext}

NOUVEAU MESSAGE UTILISATEUR: "${text}"${hasImage ? ' [avec image fournie]' : ' [sans image]'}

CONTEXTE IMPORTANT:
- Analyse TOUTE la conversation pour comprendre le contexte
- L'utilisateur peut faire référence à des éléments mentionnés avant
- Sois attentif aux nuances de langage
- Une même phrase peut avoir différentes intentions selon le contexte

INTENTIONS POSSIBLES (réponds EXACTEMENT un de ces mots):

1. "conversation" = L'utilisateur DEMANDE quelque chose sans vouloir d'action immédiate
   EXEMPLES: questions, demandes d'avis, demandes de suggestions, discussions
   - "que penses-tu de ça ?"
   - "quoi améliorer ?" 
   - "tu crois que je peux ?"
   - "des idées ?"
   - "qu'est-ce que tu en penses ?"
   - "comment faire ?"
   - "ça me va ?"

2. "edit_request" = L'utilisateur ORDONNE une action concrète sur une image
   EXEMPLES: ordres directs, commandes d'action, demandes de modification
   - "fais-le"
   - "applique ça"
   - "change la couleur"
   - "améliore maintenant"
   - "retouche"
   - "modifie"
   - "supprime X"

3. "analysis" = L'utilisateur veut analyser/examiner une image en détail
   EXEMPLES: demandes d'inspection, d'identification de problèmes
   - "qu'est-ce qui ne va pas ?"
   - "analyse cette image"
   - "liste les problèmes"
   - "examine ça"

RÈGLES D'ANALYSE:
- Regarde le CONTEXTE de toute la conversation
- Si c'est une QUESTION ou DEMANDE D'AVIS → "conversation"
- Si c'est un ORDRE ou COMMANDE → "edit_request"  
- Si c'est une DEMANDE D'ANALYSE → "analysis"
- En cas de doute, privilégie "conversation"

ATTENTION AUX NUANCES:
- "jpeux upgrade quoi" = QUESTION pour des suggestions → "conversation"
- "upgrade ça" = ORDRE d'action → "edit_request"
- "tu penses que je peux améliorer" = DEMANDE D'AVIS → "conversation"
- "améliore selon tes suggestions" = ORDRE → "edit_request"

Analyse tout le contexte et réponds UNIQUEMENT par un des trois mots: conversation, edit_request, ou analysis`,
          conversationHistory: []
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API intent');
      }

      const { response: gptResponse } = await response.json();
      const intent = gptResponse.trim().toLowerCase();
      
      // Validation stricte
      const validIntents = ['analysis', 'edit_request', 'conversation', 'clarification'];
      const detectedIntent = validIntents.find(v => intent.includes(v)) || 'clarification';
      
      console.log('🎯 [INTENT] LLM comprend:', detectedIntent, '- Réponse brute:', intent);
      return detectedIntent as any;
      
    } catch (error) {
      console.error('❌ [INTENT] Erreur LLM, fallback conversation:', error);
      return 'conversation';
    }
  };

  // Générer un prompt contextuel basé sur la conversation
  const generateContextualPrompt = async (userText: string, conversationHistory: Message[]): Promise<string> => {
    console.log('🧠 [CONTEXT] Génération prompt contextuel pour:', userText);
    
    // Récupérer les derniers messages avec contexte
    const recentMessages = conversationHistory.slice(-8);
    const conversationContext = recentMessages.map(msg => 
      `${msg.type === 'user' ? 'UTILISATEUR' : 'IA'}: ${msg.text || '[image]'}`
    ).join('\n');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Tu es un expert en création de prompts d'édition d'images. Ta mission est de transformer une conversation en instructions précises pour modifier une image.

HISTORIQUE COMPLET DE LA CONVERSATION:
${conversationContext}

MESSAGE ACTUEL DE L'UTILISATEUR: "${userText}"

CONTEXTE DE LA TÂCHE:
- L'utilisateur veut modifier une image basée sur toute la conversation
- Tu dois analyser TOUT ce qui s'est dit pour comprendre EXACTEMENT quoi faire
- Les suggestions précédentes de l'IA doivent être prises en compte
- Les préférences et demandes de l'utilisateur doivent être intégrées

INSTRUCTIONS POUR CRÉER LE PROMPT:
1. Analyse toute la conversation pour identifier :
   - Quels éléments ont été mentionnés (objets, couleurs, problèmes, etc.)
   - Quelles suggestions ont été données par l'IA
   - Ce que l'utilisateur veut vraiment modifier
   - Les détails spécifiques mentionnés

2. Traduis tout ça en instructions d'édition précises :
   - Sois spécifique sur QUOI modifier
   - Indique COMMENT le modifier
   - Inclus tous les détails mentionnés dans la conversation
   - Adapte-toi au type d'image (intérieur, extérieur, objets, etc.)

3. Crée un prompt complet qui :
   - Intègre tous les éléments de conversation
   - Soit actionnable pour un système d'édition d'image
   - Préserve l'esthétique et le réalisme
   - Tienne compte du contexte immobilier si applicable

EXEMPLES DE TRANSFORMATION:
- Si conversation parle de "ranger la pièce" + "cadres droits" → "Organiser et ranger tous les objets dispersés dans la pièce, redresser et aligner parfaitement tous les cadres sur les murs"
- Si "changer couleurs coussins" + "en vert" → "Modifier la couleur des coussins du canapé pour les rendre verts, en gardant les textures et l'éclairage naturels"
- Si "améliorer éclairage" + "plus lumineux" → "Augmenter significativement la luminosité générale de la pièce, améliorer l'éclairage naturel, réduire les ombres"

RÈGLES IMPORTANTES:
- Utilise TOUS les éléments mentionnés dans la conversation
- Sois précis et détaillé
- Adapte-toi au contexte (ne mentionne pas des éléments non pertinents)
- Si l'utilisateur dit des mots simples comme "fait", "ok", "applique", base-toi sur les suggestions précédentes

Réponds UNIQUEMENT par le prompt d'édition détaillé, sans explications ni commentaires.`,
          conversationHistory: []
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API contextual prompt');
      }

      const { response: contextPrompt } = await response.json();
      return contextPrompt.trim() || userText;
      
    } catch (error) {
      console.error('❌ [CONTEXT] Erreur génération prompt contextuel:', error);
      return userText; // Fallback sur le texte original
    }
  };

  // Télécharger une image vers ImageKit
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Erreur upload image');
    }

    const { imageUrl } = await response.json();
    return imageUrl;
  };

  // Appeler Qwen pour une conversation (avec redirection GPT si nécessaire)
  const callQwenConversation = async (userText: string, needsImageAnalysis: boolean = false, hasImage: boolean = false): Promise<string> => {
    try {
      console.log('🤖 [QWEN] Appel à l\'API Qwen pour:', userText);
      
      const response = await fetch('/api/qwen-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userText,
          needsImageAnalysis,
          hasImage,
          conversationHistory: messages
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API Qwen');
      }

      const { response: qwenResponse, redirectToGPT } = await response.json();
      console.log('✅ [QWEN] Réponse Qwen reçue:', qwenResponse);
      
      // Si Qwen demande une redirection vers GPT
      if (redirectToGPT && qwenResponse.startsWith('REDIRECT_TO_GPT:')) {
        console.log('🔄 [QWEN] Redirection vers GPT demandée');
        return await callGPTConversation(userText);
      }
      
      return qwenResponse;
    } catch (error) {
      console.error('❌ [QWEN] Erreur lors de l\'appel Qwen:', error);
      // Fallback vers GPT en cas d'erreur Qwen
      console.log('🔄 [QWEN] Fallback vers GPT');
      return await callGPTConversation(userText);
    }
  };

  // Appeler GPT pour une conversation (fallback ou redirection)
  const callGPTConversation = async (userText: string): Promise<string> => {
    try {
      console.log('🤖 [GPT] Appel à l\'API Chat GPT pour:', userText);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userText,
          conversationHistory: messages
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API chat');
      }

      const { response: gptResponse } = await response.json();
      console.log('✅ [GPT] Réponse GPT reçue:', gptResponse);
      
      return gptResponse;
    } catch (error) {
      console.error('❌ [GPT] Erreur lors de l\'appel GPT:', error);
      throw error;
    }
  };

  // Analyser une image via l'API
  const analyzeImage = async (imageUrl: string, userRequest?: string): Promise<{ response: string; userRequest?: string }> => {
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        imageUrl,
        userRequest 
      })
    });

    if (!response.ok) {
      throw new Error('Erreur analyse image');
    }

    return response.json();
  };

  // Traiter une image via l'API
  const processImage = async (imageUrl: string, issues: string[], userPrompt?: string, isAutomatic: boolean = false): Promise<string> => {
    console.log('🔄 [DASHBOARD] Appel processImage avec:', { userPrompt, isAutomatic });
    
    const response = await fetch('/api/process-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageUrl,
        issues,
        userPrompt,
        isAutomatic: isAutomatic // Utiliser la valeur passée en paramètre
      })
    });

    if (!response.ok) {
      throw new Error('Erreur traitement image');
    }

    const { processedImageUrl } = await response.json();
    return processedImageUrl;
  };

  // Générer une réponse IA selon le contexte
  const generateAIResponse = async (intent: string, userText: string, userImage?: { file: File; preview: string }): Promise<Message> => {
    const baseId = Date.now() + 1;

    switch (intent) {
      case 'analysis':
        // Analyse gratuite via API
        if (!userImage) {
          throw new Error('Image requise pour analyse');
        }

        try {
          // 1. Upload de l'image
          const imageUrl = await uploadImage(userImage.file);
          
          // 2. Analyse de l'image avec la demande utilisateur
          const analysisResult = await analyzeImage(imageUrl, userText);
          
          return {
            id: baseId,
            type: 'ai',
            text: analysisResult.response,
            timestamp: new Date(),
            isAnalysis: true
          };
        } catch (error) {
          console.error('Erreur analyse:', error);
          return {
            id: baseId,
            type: 'ai',
            text: `❌ **Erreur d'analyse**\n\nJe n'ai pas pu analyser votre image. Veuillez réessayer avec une autre image.`,
            timestamp: new Date(),
            isAnalysis: true
          };
        }

      case 'edit_request':
        // Retouche payante (-1 crédit) via API
        let imageToProcess: string;
        
        if (userImage) {
          // Image fournie avec ce message
          try {
            imageToProcess = await uploadImage(userImage.file);
          } catch (error) {
            console.error('Erreur upload image:', error);
            return {
              id: baseId,
              type: 'ai',
              text: `❌ **Erreur d'upload**\n\nJe n'ai pas pu traiter votre image. Veuillez réessayer.`,
              timestamp: new Date(),
              isAnalysis: true
            };
          }
        } else {
          // Priorité à l'image générée, sinon image récente de l'utilisateur
          if (sessionMemory.lastGeneratedImage) {
            console.log('🔄 [EDIT] Utilisation de l\'image générée précédente:', sessionMemory.lastGeneratedImage.url);
            imageToProcess = sessionMemory.lastGeneratedImage.url;
          } else {
            // Récupérer l'image récente de l'historique
            const recentMessages = messages.slice(-5);
            const recentUserMessage = recentMessages.reverse().find(msg => msg.type === 'user' && msg.image);
            
            if (!recentUserMessage?.image) {
              return {
                id: baseId,
                type: 'ai',
                text: `📸 **Image nécessaire**\n\nPour appliquer "${userText}", j'ai besoin d'une photo. Pourriez-vous m'envoyer l'image que vous souhaitez modifier ?`,
                timestamp: new Date(),
                isAnalysis: true
              };
            }
            
            // Réuploader l'image récente
            try {
              imageToProcess = await uploadImage(recentUserMessage.image.file);
              console.log('🔄 [EDIT] Utilisation de l\'image récente de l\'utilisateur');
            } catch (error) {
              console.error('Erreur réupload image récente:', error);
              return {
                id: baseId,
                type: 'ai',
                text: `❌ **Erreur de traitement**\n\nJe n'arrive pas à récupérer l'image précédente. Pouvez-vous la renvoyer ?`,
                timestamp: new Date(),
                isAnalysis: true
              };
            }
          }
        }

        try {
          // 2. Analyser le contexte pour créer un prompt intelligent
          const contextualPrompt = await generateContextualPrompt(userText, messages);
          console.log('🧠 [CONTEXT] Prompt contextuel généré:', contextualPrompt);
          
          // 3. Traitement de l'image avec le prompt contextuel
          const processedImageUrl = await processImage(imageToProcess, [], contextualPrompt, false);
          
          const newGeneratedImage = {
            url: processedImageUrl,
            downloadName: `immopix_retouche_${Date.now()}.jpg`
          };
          
          setSessionMemory(prev => ({
            ...prev,
            lastUploadedImage: userImage || prev.lastUploadedImage,
            lastGeneratedImage: newGeneratedImage
          }));

          return {
            id: baseId,
            type: 'ai',
            text: `✨ **Retouche terminée !**\n\nJ'ai appliqué votre demande : "${userText}"\n\nLe résultat respecte l'esthétique immobilière professionnelle. Souhaitez-vous d'autres modifications ?`,
            generatedImage: newGeneratedImage,
            timestamp: new Date()
          };
        } catch (error) {
          console.error('Erreur traitement:', error);
          return {
            id: baseId,
            type: 'ai',
            text: `❌ **Erreur de traitement**\n\nJe n'ai pas pu traiter votre image. Aucun crédit n'a été débité. Veuillez réessayer.`,
            timestamp: new Date(),
            isAnalysis: true // Gratuit en cas d'erreur
          };
        }

      case 'need_image':
        return {
          id: baseId,
          type: 'ai',
          text: `📸 **Image nécessaire**\n\nPour appliquer cette retouche, j'ai besoin d'une photo. Pourriez-vous m'envoyer l'image que vous souhaitez modifier ?\n\nJe pourrai alors "${userText}" selon vos souhaits.`,
          timestamp: new Date(),
          isAnalysis: true
        };

      case 'continuation':
        // Retouche sur l'image générée précédente
        if (!sessionMemory.lastGeneratedImage) {
          return {
            id: baseId,
            type: 'ai',
            text: `📸 **Image précédente introuvable**\n\nJe n'ai pas trouvé d'image précédente à modifier. Veuillez envoyer une nouvelle image.`,
            timestamp: new Date(),
            isAnalysis: true
          };
        }

        try {
          // Utiliser l'image précédemment générée comme base
          const previousImageUrl = sessionMemory.lastGeneratedImage.url;
          
          // Analyser le contexte pour créer un prompt intelligent
          const contextualPrompt = await generateContextualPrompt(userText, messages);
          console.log('🧠 [CONTEXT] Prompt contextuel pour continuation:', contextualPrompt);
          
          // Traitement avec le prompt contextuel
          const processedImageUrl = await processImage(previousImageUrl, [], contextualPrompt, false);
          
          const continuationImage = {
            url: processedImageUrl,
            downloadName: `immopix_v${sessionMemory.conversationHistory.length + 1}_${Date.now()}.jpg`
          };
          
          setSessionMemory(prev => ({
            ...prev,
            lastGeneratedImage: continuationImage
          }));

          return {
            id: baseId,
            type: 'ai',
            text: `🔄 **Nouvelle version créée !**\n\nJ'ai appliqué "${userText}" sur la dernière version.\n\nCette modification améliore encore le rendu professionnel. D'autres ajustements ?`,
            generatedImage: continuationImage,
            timestamp: new Date()
          };
        } catch (error) {
          console.error('Erreur continuation:', error);
          return {
            id: baseId,
            type: 'ai',
            text: `❌ **Erreur de continuation**\n\nJe n'ai pas pu modifier l'image précédente. Aucun crédit n'a été débité. Veuillez réessayer.`,
            timestamp: new Date(),
            isAnalysis: true
          };
        }

      case 'clarification':
        // Demande de clarification quand l'intention n'est pas claire
        try {
          const clarificationResponse = await callQwenConversation(`L'utilisateur a dit: "${userText}". Je n'ai pas bien compris sa demande. Peux-tu demander poliment des précisions sur ce qu'il souhaite faire ?`);
          return {
            id: baseId,
            type: 'ai',
            text: clarificationResponse,
            timestamp: new Date(),
            isAnalysis: true // Gratuit
          };
        } catch (error) {
          console.error('Erreur clarification:', error);
          return {
            id: baseId,
            type: 'ai',
            text: `🤔 **Je n'ai pas bien compris**\n\nPouvez-vous préciser ce que vous souhaitez ? Par exemple :\n• Une question sur cette image ?\n• Modifier/retoucher une image ?\n• Une discussion générale ?`,
            timestamp: new Date(),
            isAnalysis: true
          };
        }

      case 'conversation':
        // Conversation normale (gratuite) via Qwen
        try {
          const qwenResponse = await callQwenConversation(userText);
          return {
            id: baseId,
            type: 'ai',
            text: qwenResponse,
            timestamp: new Date(),
            isAnalysis: true // Gratuit
          };
        } catch (error) {
          console.error('Erreur conversation Qwen:', error);
          return {
            id: baseId,
            type: 'ai',
            text: `Je suis désolé, j'ai eu un problème technique. 😅\n\nPour vous aider au mieux avec vos images immobilières, pourriez-vous m'envoyer une photo ou me dire ce que vous souhaitez améliorer ?`,
            timestamp: new Date(),
            isAnalysis: true
          };
        }

      default:
        return {
          id: baseId,
          type: 'ai',
          text: `Je n'ai pas bien compris votre demande. Pouvez-vous me dire ce que vous souhaitez faire avec votre image immobilière ?`,
          timestamp: new Date(),
          isAnalysis: true
        };
    }
  };

  // Gestion des erreurs avec retry
  const handleGenerationError = async (originalIntent: string, userText: string, userImage?: { file: File; preview: string }): Promise<Message> => {
    if (sessionMemory.retryCount === 0) {
      // Premier retry gratuit
      setSessionMemory(prev => ({ ...prev, retryCount: 1 }));
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler parfois un succès au retry
      if (Math.random() > 0.3) {
        return generateAIResponse(originalIntent, userText, userImage);
      }
    }

    // Échec définitif après retry
    setSessionMemory(prev => ({ ...prev, retryCount: 0 }));
    
    return {
      id: Date.now() + 1,
      type: 'ai',
      text: `❌ **Retouche échouée**\n\nDésolé, la retouche a échoué deux fois. Cela peut arriver avec certaines images complexes.\n\nVous pouvez réessayer avec une autre demande ou une image différente. Aucun crédit n'a été débité.`,
      timestamp: new Date(),
      isAnalysis: true
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    // Message utilisateur
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: inputText.trim(),
      image: selectedImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);
    
    // Définir le type de chargement selon la demande
    if (selectedImage && !inputText.trim()) {
      setLoadingType('analysis');
    } else if (inputText.includes('supprime') || inputText.includes('améliore') || inputText.includes('change') || inputText.includes('papier peint')) {
      setLoadingType('processing');
    } else {
      setLoadingType('chat');
    }

    // Analyser l'intention avec GPT
    const intent = await analyzeUserIntent(inputText, !!selectedImage);
    console.log('🔍 [DEBUG] Intent détecté:', intent, 'pour:', inputText);
    
    try {
      // Simuler parfois une erreur pour tester le retry
      if ((intent === 'edit_request' || intent === 'continuation') && Math.random() < 0.2) {
        throw new Error('Generation failed');
      }

      const aiResponse = await generateAIResponse(intent, inputText, selectedImage || undefined);
      
      // Décompte des crédits (sauf pour analyse et retry)
      if (!aiResponse.isAnalysis && !aiResponse.isRetrying && userData) {
        setUserData(prev => prev ? { ...prev, credits: Math.max(0, prev.credits - 1) } : null);
      }
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Mettre à jour l'historique
      setSessionMemory(prev => ({
        ...prev,
        conversationHistory: [...prev.conversationHistory, userMessage, aiResponse]
      }));
      
    } catch (error) {
      // Gestion d'erreur avec retry
      const errorResponse = await handleGenerationError(intent, inputText, selectedImage || undefined);
      setMessages(prev => [...prev, errorResponse]);
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownloadImage = (imageUrl: string, fileName: string) => {
    // Simulation du téléchargement
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    // Cette fonction sera appelée par le Header
    window.location.href = '/login';
  };

  // Créer un composant de message personnalisé avec bouton de téléchargement
  const renderMessage = (message: Message) => {
    if (message.type === 'ai' && message.generatedImage) {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start"
        >
          <div className="max-w-md lg:max-w-2xl">
            {/* Texte de l'IA */}
            <div
              className="rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg mb-3"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(0, 153, 255, 0.2)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 153, 255, 0.1)'
              }}
            >
              <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base text-text-primary">
                {message.text}
              </p>
            </div>
            
            {/* Image générée avec bouton de téléchargement intégré */}
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img
                src={message.generatedImage.url}
                alt="Image optimisée"
                className="w-full max-h-80 object-cover"
              />
              <div className="absolute bottom-3 right-3">
                <Button
                  onClick={() => handleDownloadImage(message.generatedImage!.url, message.generatedImage!.downloadName)}
                  className="px-3 py-2 rounded-lg shadow-lg border-0"
                  style={{
                    background: 'linear-gradient(135deg, #00D38A 0%, #00b377 100%)',
                    color: 'white'
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
            
            {/* Timestamp */}
            <div className="text-xs text-primary-blue/70 text-left mt-2">
              {message.timestamp.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </motion.div>
      );
    }
    
    return <ChatMessage key={message.id} message={message} />;
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--global-bg)' }}>
              <Header 
          logo="https://i.ibb.co/Sw98bpnG/immopixlogodtr-1752093672104.png"
          userEmail={userData?.email || "Chargement..."}
          credits={userData?.credits || 0}
          onLogout={handleLogout}
        />

      {/* Zone de conversation */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-6 w-full relative z-10">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {messages.map((message) => renderMessage(message))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div 
                className="px-4 sm:px-6 py-3 sm:py-4 max-w-xs"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(0, 153, 255, 0.3)',
                  borderRadius: '1.5rem',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0, 153, 255, 0.1)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    {[0, 0.3, 0.6].map((delay, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary-blue"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay }}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-text-primary font-medium">
                    {loadingType === 'analysis' ? 'Analyse en cours...' : 
                     loadingType === 'processing' ? 'Modifications en cours...' : ''}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Zone d'envoi */}
      <div 
        className="border-t-0 px-2 sm:px-4 py-3 sm:py-4 relative z-10"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.25)'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <ImageUpload
            selectedImage={selectedImage}
            onImageSelect={setSelectedImage}
            onImageRemove={() => setSelectedImage(null)}
          />
          
          <div className="flex items-end space-x-2 sm:space-x-3">
            <div className="flex-1 min-w-0">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Décrivez votre demande... (ex: 'supprime le canapé' ou 'améliore la lumière')"
                className="min-h-[50px] sm:min-h-[60px] max-h-32 resize-none border-2 border-primary-blue/20 focus:border-primary-blue focus:ring-primary-blue/10 rounded-xl sm:rounded-2xl shadow-lg text-sm sm:text-base"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={(!inputText.trim() && !selectedImage) || isLoading || (userData?.credits === 0)}
              className="px-4 sm:px-6 py-2 sm:py-3 h-auto rounded-xl sm:rounded-2xl shadow-lg border-0 transition-all duration-200 shrink-0"
              style={{
                background: isLoading || (userData?.credits === 0)
                  ? 'rgba(156, 163, 175, 0.5)' 
                  : 'linear-gradient(135deg, #0099FF 0%, #0088cc 100%)',
                color: 'white'
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>
          
          {userData?.credits === 0 && (
            <div className="mt-2 text-center">
              <span className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full">
                Plus de crédits disponibles
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}