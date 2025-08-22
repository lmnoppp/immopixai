import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  watermark?: boolean;
  iconOnly?: boolean;
}

// Composant pour le logo texte seul
export function TextLogo({ size = 'md', className = '', watermark = false }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string, watermark?: boolean }) {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-16',
    lg: 'h-24',
    xl: 'h-32'
  };

  const watermarkStyle = watermark ? 'opacity-[0.06] pointer-events-none' : '';

  return (
    <div className={`${className} ${watermarkStyle}`}>
      <div className={`${sizeClasses[size]} w-auto flex items-center justify-center`}>
        <img 
          src="https://i.ibb.co/Sw98bpnG/immopixlogodtr-1752093672104.png" 
          alt="ImmoPix Logo" 
          className="h-full w-auto object-contain"
        />
      </div>
    </div>
  );
}

// Composant pour l'icône de loader seule
export function LoaderIcon({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg className="w-full h-full animate-spin" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#0099FF" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  );
}

export default function Logo({ size = 'md', className = '', showText = true, watermark = false, iconOnly = false }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const watermarkStyle = watermark ? 'opacity-[0.06] pointer-events-none' : '';

  if (iconOnly) {
    return (
      <div className={`${sizeClasses[size]} flex-shrink-0 ${className} ${watermarkStyle}`}>
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="#0099FF">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className} ${watermarkStyle}`}>
      {/* Icône */}
      <svg className={`${sizeClasses[size]} flex-shrink-0`} viewBox="0 0 24 24" fill="#0099FF">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>

      {/* Logo image */}
      {showText && (
        <div className="flex-shrink-0">
                  <img 
          src="https://i.ibb.co/Sw98bpnG/immopixlogodtr-1752093672104.png" 
          alt="ImmoPix Logo" 
          className={`${size === 'sm' ? 'h-6' : size === 'md' ? 'h-8' : size === 'lg' ? 'h-12' : 'h-16'} w-auto object-contain`}
        />
        </div>
      )}
    </div>
  );
} 