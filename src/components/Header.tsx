import React from 'react';
import { LogOut, User, CreditCard } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';

interface HeaderProps {
  logo: string;
  userEmail: string;
  credits: number;
  onLogout?: () => void;
}

export function Header({ logo, userEmail, credits, onLogout }: HeaderProps) {
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Rediriger vers la page de connexion
        window.location.href = '/login';
      } else {
        console.error('Erreur lors de la déconnexion');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
    
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header 
      className="border-b-0 px-2 sm:px-4 py-2 sm:py-4 relative z-20"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 153, 255, 0.1)'
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo agrandi sans container */}
        <div className="flex items-center">
          <img src={logo} alt="ImmoPix AI" className="h-10 sm:h-14 w-auto" />
        </div>

        {/* Informations utilisateur - Optimisées pour mobile */}
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
          {/* Crédits - Optimisés pour mobile avec couleurs bleues */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-primary-blue" />
            <span className="text-xs sm:text-sm text-text-primary font-medium hidden sm:inline">Crédits :</span>
            <Badge 
              className="border-0 font-bold shadow-lg px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
              style={{
                background: 'linear-gradient(135deg, #0099FF 0%, #0088cc 100%)',
                color: 'white'
              }}
            >
              {credits}
            </Badge>
          </div>

          {/* Email - Masqué sur mobile, visible sur lg+ */}
          <div
            className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(0, 153, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="w-2 h-2 bg-primary-blue rounded-full"></div>
            <span className="text-sm text-text-primary font-medium">
              {userEmail}
            </span>
          </div>

          {/* Menu profil - Optimisé pour mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center space-x-2 rounded-xl sm:rounded-2xl p-2 sm:p-3 transition-all duration-200 border-2 border-transparent hover:bg-white/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary-blue/30 shadow-lg">
                  <AvatarFallback 
                    className="text-text-primary"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 153, 255, 0.2) 0%, rgba(0, 153, 255, 0.1) 100%)'
                    }}
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 sm:w-52 border-2 shadow-xl rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 153, 255, 0.2)'
              }}
            >
              {/* Email visible dans le menu sur mobile */}
              <div className="lg:hidden px-3 py-2 border-b border-gray-200">
                <span className="text-xs text-text-primary/70">
                  {userEmail}
                </span>
              </div>
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-red-500 focus:text-red-600 focus:bg-red-50 rounded-xl m-1 font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
