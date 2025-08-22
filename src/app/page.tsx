import Link from 'next/link';
import { TextLogo } from '@/components/Logo';
import Button from '@/components/Button';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F9FF] via-[#EAF4FF] to-[#d1e7f0] flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo texte animé */}
        <div className="mb-8 flex justify-center scale-in">
          <TextLogo size="xl" />
        </div>

        {/* Titre principal avec gradient */}
        <h1 className="text-responsive-xl font-bold mb-6 fade-in-up gradient-text" style={{ animationDelay: '0.2s' }}>
          Optimisez vos photos immobilières
        </h1>

        {/* Sous-titre */}
        <p className="text-responsive text-gray-600 mb-12 leading-relaxed fade-in-up" style={{ animationDelay: '0.4s' }}>
          Transformez vos images en quelques clics grâce à l'intelligence artificielle. 
          Rendez vos biens immobiliers plus attractifs et professionnels.
        </p>

        {/* Bouton de connexion */}
        <div className="fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Link href="/login">
            <Button 
              size="lg" 
              icon={<ArrowRight size={20} />}
              className="shadow-2xl hover:shadow-3xl"
            >
              Commencer maintenant
            </Button>
          </Link>
        </div>

        {/* Features avec nouvelles icônes SVG */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 fade-in-up" style={{ animationDelay: '0.8s' }}>
          {[
            {
              title: "IA Avancée",
              description: "Technologie de pointe pour des résultats professionnels",
              icon: (
                <svg className="w-8 h-8 mx-auto mb-3 text-[#0099FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )
            },
            {
              title: "Rapide & Simple",
              description: "Traitement en quelques secondes avec une interface intuitive",
              icon: (
                <svg className="w-8 h-8 mx-auto mb-3 text-[#0099FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )
            },
            {
              title: "Qualité Premium",
              description: "Images optimisées pour maximiser l'impact de vos annonces",
              icon: (
                <svg className="w-8 h-8 mx-auto mb-3 text-[#0099FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )
            }
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="glass chrome-effect p-6 rounded-2xl text-center card-hover"
              style={{ animationDelay: `${1.0 + index * 0.2}s` }}
            >
              {feature.icon}
              <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 