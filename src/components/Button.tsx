import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  disabled = false, 
  loading = false, 
  icon, 
  onClick, 
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#0099FF] to-[#0088cc] text-white hover:from-[#0088cc] hover:to-[#0077bb] focus:ring-[#0099FF] shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    secondary: 'bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 hover:bg-white/30 hover:border-white/40 focus:ring-[#0099FF] shadow-md hover:shadow-lg hover:-translate-y-0.5',
    success: 'bg-gradient-to-r from-[#00D38A] to-[#00b377] text-white hover:from-[#00b377] hover:to-[#009966] focus:ring-[#00D38A] shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    outline: 'bg-transparent border border-[#0099FF] text-[#0099FF] hover:bg-[#0099FF] hover:text-white focus:ring-[#0099FF]',
    ghost: 'bg-transparent text-gray-700 hover:bg-white/10 hover:text-gray-900 focus:ring-[#0099FF]'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span>{children}</span>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
} 