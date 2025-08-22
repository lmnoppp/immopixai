'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle, Mail, Key } from 'lucide-react';
import { DatabaseService } from '@/lib/supabase';
import { TextLogo } from '@/components/Logo';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';


// Fonction pour générer un UUID compatible avec tous les navigateurs
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError('');
    setDebugInfo('');

    try {
      console.log('🚀 Début processus de connexion...');

      // Récupérer l'IP de l'utilisateur (cette partie reste côté client)
      let userIp = '127.0.0.1';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          userIp = ipData.ip;
          console.log('🌐 IP utilisateur détectée:', userIp);
        }
      } catch (ipError) {
        console.error('❌ Erreur récupération IP:', ipError);
      }
      
      // Appeler notre nouvelle API de login
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, userIp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue.');
      }

      const { sessionToken } = data;

      console.log('✅ Connexion réussie, session token reçu.');
      
      // Créer le cookie de session et rediriger
      document.cookie = `session_token=${sessionToken}; path=/; max-age=${24 * 60 * 60}; SameSite=Strict`;
      console.log('🍪 Cookie créé, redirection vers le dashboard...');
      router.push('/dashboard');
      
    } catch (error) {
      console.error('💥 Erreur connexion:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = email && code;



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F9FF] via-[#EAF4FF] to-[#d1e7f0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-center mb-4">
            <TextLogo size="xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Connexion</h1>
          <p className="text-gray-600">Accédez à votre espace de travail</p>
        </div>

        {/* Formulaire */}
        <GlassCard className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="fade-in-up" style={{ animationDelay: '0.6s' }}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full input-glass input-with-icon rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0099FF] focus:border-transparent"
                  placeholder="votre@email.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            {/* Code d'accès */}
            <div className="fade-in-up" style={{ animationDelay: '0.8s' }}>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Code d'accès
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                <input
                  id="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full input-glass input-with-icon rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0099FF] focus:border-transparent"
                  placeholder="Entrez votre code d'accès"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Messages d'erreur uniquement */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl fade-in">
                <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Bouton de connexion */}
            <div className="fade-in-up" style={{ animationDelay: '1.0s' }}>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
  
                fullWidth
                size="lg"
                icon={!isSubmitting ? <ArrowRight size={20} /> : undefined}
              >
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Bloc d'aide */}
        <div className="mt-6 text-center fade-in" style={{ animationDelay: '1.2s' }}>
          <p className="text-gray-600 text-sm mb-4">Besoin d'aide ? Contactez-nous</p>
          <div className="flex justify-center gap-6">
            {/* Icône WhatsApp */}
            <a 
              href="https://wa.me/33695297985" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative"
              title="Parler à l'équipe sur WhatsApp"
            >
              <div className="w-12 h-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-white">
                <svg
                  className="w-6 h-6 text-[#0099FF] transition-colors duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </div>
            </a>

            {/* Icône Email */}
            <a 
              href="mailto:contact@immopix-ai.site" 
              className="group relative"
              title="Envoyer un mail à l'équipe"
            >
              <div className="w-12 h-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-white">
                <svg
                  className="w-6 h-6 text-[#0099FF] transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}