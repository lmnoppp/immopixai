'use client';

import { useState, useRef, useEffect } from 'react';
import { useConversationStore } from '@/store/conversationStore';
import { Upload, Sparkles, Download, RotateCcw, MessageCircle, User, CreditCard, Image as ImageIcon, Settings, X } from 'lucide-react';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';
import Loader from '@/components/Loader';

export default function DashboardPage() {
  const {
    uploadedImage,
    isUploading,
    isAnalyzing,
    isProcessing,
    analysisResult,
    processedImage,
    messages,
    currentStep,
    setUploadedImage,
    setUploading,
    setAnalyzing,
    setAnalysisResult,
    setProcessing,
    setProcessedImage,
    addMessage,
    setCurrentStep,
    reset
  } = useConversationStore();

  const [processingOptions, setProcessingOptions] = useState({
    removeObjects: true,
    improveLighting: true,
    neutralizeDecor: true,
    preserveElements: ''
  });

  const [userData, setUserData] = useState<{
    email: string;
    credits: number;
    plan: string;
  } | null>(null);

  const [isCustomPanelOpen, setIsCustomPanelOpen] = useState(false);
  const [customInstruction, setCustomInstruction] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Désactiver l'auto-scroll pour éviter les "descentes automatiques"
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

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
            plan: user.plan
          });
        }
      } catch (error) {
        console.error('Erreur récupération données utilisateur:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    addMessage({
      type: 'system',
      content: 'Upload de l\'image en cours...'
    });

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur upload');
      }

      const { imageUrl } = await response.json();
      setUploadedImage(imageUrl);
      setCurrentStep('analysis');
      
      // Ajouter l'image originale dans la conversation
      addMessage({
        type: 'image',
        content: imageUrl,
        imageType: 'original'
      });

    } catch (error) {
      addMessage({
        type: 'system',
        content: 'Erreur lors de l\'upload de l\'image. Veuillez réessayer.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!uploadedImage) return;

    setAnalyzing(true);
    addMessage({
      type: 'user',
      content: 'Analyser l\'image'
    });

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: uploadedImage
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API:', response.status, errorText);
        throw new Error('Erreur analyse');
      }

      const responseData = await response.json();
      console.log('🔍 Réponse complète de l\'API:', responseData);
      
      const { issues, summary } = responseData;
      console.log('🔍 Type de issues:', typeof issues);
      console.log('🔍 Issues:', issues);
      console.log('🔍 Longueur issues:', issues ? issues.length : 'undefined');
      
      setAnalysisResult({ issues, summary });
      setCurrentStep('options');

      // Ajouter l'analyse dans la conversation
      const issuesList = issues && issues.length > 0 
        ? issues.map((issue: string, index: number) => `${index + 1}. ${issue}`).join('\n')
        : 'Aucun défaut majeur identifié';
      
      console.log('📝 Liste des défauts:', issuesList);
      console.log('📝 Nombre de défauts:', issues ? issues.length : 0);
      
      const analysisMessage = issues && issues.length > 0
        ? `J'ai analysé votre image et identifié ${issues.length} élément(s) à améliorer :\n\n${issuesList}\n\nSouhaitez-vous que je corrige ces éléments automatiquement, ou préférez-vous les ajuster manuellement ?`
        : `J'ai analysé votre image mais n'ai identifié aucun défaut majeur nécessitant une correction.\n\nVotre image semble déjà optimisée ! Souhaitez-vous quand même procéder à quelques améliorations automatiques ?`;
      
      console.log('📝 Message final:', analysisMessage);
      
      addMessage({
        type: 'ai',
        content: analysisMessage
      });

    } catch (error) {
      addMessage({
        type: 'system',
        content: 'Erreur lors de l\'analyse de l\'image. Veuillez réessayer.'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAutomaticProcessing = async () => {
    if (!analysisResult) return;

    setProcessing(true);
    addMessage({
      type: 'user',
      content: 'Corriger automatiquement'
    });

    try {
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: uploadedImage,
          issues: analysisResult.issues,
          isAutomatic: true
        })
      });

      if (!response.ok) {
        throw new Error('Erreur traitement');
      }

      // CORRECTION 1: Lire la bonne propriété "processedImageUrl"
      const { processedImageUrl: resultImage } = await response.json();
      setProcessedImage(resultImage);
      setCurrentStep('result');

      // CORRECTION 2: Mettre à jour les crédits côté client
      if (userData) {
        setUserData(prevData => prevData ? { ...prevData, credits: prevData.credits - 1 } : null);
      }

      // Ajouter l'image traitée dans la conversation
      addMessage({
        type: 'ai',
        content: 'Voici votre image optimisée ! J\'ai corrigé automatiquement tous les éléments identifiés.'
      });

      addMessage({
        type: 'image',
        content: resultImage,
        imageType: 'processed'
      });

    } catch (error) {
      addMessage({
        type: 'system',
        content: 'Erreur lors du traitement de l\'image. Veuillez réessayer.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCustomProcessing = async () => {
    if (!analysisResult) return;

    setProcessing(true);
    addMessage({
      type: 'user',
      content: 'Traitement personnalisé avec mes préférences'
    });

    try {
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: uploadedImage,
          issues: analysisResult.issues,
          processingOptions,
          isAutomatic: false
        })
      });

      if (!response.ok) {
        throw new Error('Erreur traitement');
      }

      // CORRECTION 1: Lire la bonne propriété "processedImageUrl"
      const { processedImageUrl: resultImage } = await response.json();
      setProcessedImage(resultImage);
      setCurrentStep('result');

      // CORRECTION 2: Mettre à jour les crédits côté client
      if (userData) {
        setUserData(prevData => prevData ? { ...prevData, credits: prevData.credits - 1 } : null);
      }

      // Ajouter l'image traitée dans la conversation
      addMessage({
        type: 'ai',
        content: 'Voici votre image optimisée selon vos préférences personnalisées !'
      });

      addMessage({
        type: 'image',
        content: resultImage,
        imageType: 'processed'
      });

    } catch (error) {
      addMessage({
        type: 'system',
        content: 'Erreur lors du traitement de l\'image. Veuillez réessayer.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!processedImage) return;
    
    try {
      // Récupérer l'image comme blob pour contourner les limitations cross-origin
      const response = await fetch(processedImage);
      const blob = await response.blob();
      
      // Créer un URL temporaire pour le blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Créer et déclencher le téléchargement
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'immopix-optimized.png';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL temporaire
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      // Fallback pour les cas où la méthode blob échoue
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'immopix-optimized.png';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    reset();
    setProcessingOptions({
      removeObjects: true,
      improveLighting: true,
      neutralizeDecor: true,
      preserveElements: ''
    });
    setIsCustomPanelOpen(false);
    setCustomInstruction('');
  };

  const handleCustomInstructions = () => {
    setIsCustomPanelOpen(true);
  };

  const handleSendCustomInstruction = () => {
    if (!customInstruction.trim()) return;
    
    // Ajouter le message de l'utilisateur
    addMessage({
      type: 'user', 
      content: customInstruction
    });
    
    // Simuler la réponse de l'IA
    addMessage({
      type: 'ai',
      content: `J'ai bien reçu votre message : "${customInstruction}". Comment puis-je vous aider avec vos images immobilières ?`
    });
    
    setCustomInstruction('');
  };

  const renderMessage = (message: any) => {
    const isUser = message.type === 'user';
    const isImage = message.type === 'image';

    if (isImage) {
      const isOriginal = message.imageType === 'original';
      return (
        <div className={`chat-message p-4 rounded-2xl shadow-sm ${
          isOriginal 
            ? 'bg-[#0099FF] text-white' // Image utilisateur = bulle bleue
            : 'bg-white text-gray-800 border border-gray-200' // Image IA = bulle blanche
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon size={16} className={isOriginal ? 'text-white/80' : 'text-gray-500'} />
            <span className="text-sm font-medium">
              {isOriginal ? 'Mon image' : 'Image optimisée'}
            </span>
          </div>
          <img
            src={message.content}
            alt={isOriginal ? 'Image envoyée' : 'Image optimisée'}
            className="w-full rounded-lg shadow-md"
          />
          
          {/* Bouton télécharger intégré dans la bulle IA uniquement */}
          {!isOriginal && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Button
                onClick={handleDownload}
                icon={<Download size={16} />}
                size="sm"
                variant="success"
                className="w-full"
              >
                Télécharger
              </Button>
            </div>
          )}
          
          <div className={`text-xs mt-2 ${isOriginal ? 'text-white/70' : 'text-gray-500'}`}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`chat-message p-4 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-[#0099FF] text-white'
            : message.type === 'ai'
            ? 'bg-white text-gray-800 border border-gray-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        <div className={`text-xs mt-2 ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#F6F9FF] via-[#EAF4FF] to-[#d1e7f0] flex flex-col lock-scroll">
      {/* Header minimal */}
      <div className="header-sticky px-4 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">ImmoPix AI</h1>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                <span>{userData?.email || 'Chargement...'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              {userData && (
                <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/20">
                  <CreditCard size={16} className="text-[#0099FF]" />
                  <span className="text-sm font-medium">{userData.credits} crédits</span>
                </div>
              )}
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                icon={<RotateCcw size={16} />}
              >
                <span className="hidden sm:inline">Nouvelle image</span>
                <span className="sm:hidden">Reset</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de conversation - colonne centrale */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 conversation-area">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <MessageCircle size={64} className="mx-auto mb-6 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Commencez votre conversation</h3>
              <p className="text-sm">Tapez un message ou joignez une image pour commencer</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {renderMessage(message)}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer en bas */}
        <div className="flex-shrink-0 chat-composer pt-4 pb-4">
          <div className="flex gap-3">
            {/* Input file caché */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
            />
            
            {/* Bouton upload */}
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="lg"
              icon={<Upload size={20} />}
              disabled={isUploading}
              className="flex-shrink-0"
            >
              {isUploading ? <Loader /> : 'Image'}
            </Button>

            {/* Zone de texte */}
            <div className="flex-1 flex gap-3">
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (uploadedImage) {
                      handleAnalyzeImage();
                    } else if (customInstruction.trim()) {
                      handleSendCustomInstruction();
                    }
                  }
                }}
                placeholder="Tapez votre message ici..."
                className="input-glass flex-1 h-12"
                disabled={isAnalyzing || isProcessing}
              />
              
              {/* Bouton envoyer */}
              <Button
                onClick={() => {
                  if (uploadedImage) {
                    handleAnalyzeImage();
                  } else if (customInstruction.trim()) {
                    handleSendCustomInstruction();
                  }
                }}
                disabled={isAnalyzing || isProcessing || (!uploadedImage && !customInstruction.trim())}
                icon={isAnalyzing || isProcessing ? <Loader /> : <Sparkles size={20} />}
                size="lg"
                className="flex-shrink-0"
              >
                {isAnalyzing ? 'Analyse...' : isProcessing ? 'Traitement...' : 'Envoyer'}
              </Button>
            </div>
          </div>
          
          {/* Aperçu de l'image uploadée */}
          {uploadedImage && (
            <div className="mt-3 p-3 bg-white/20 rounded-lg flex items-center gap-3">
              <img
                src={uploadedImage}
                alt="Aperçu"
                className="w-12 h-12 object-cover rounded"
              />
              <span className="text-sm text-gray-600 flex-1">Image prête à analyser</span>
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setCurrentStep('upload');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 