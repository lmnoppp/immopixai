import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn(
      'glass chrome-effect p-6 rounded-2xl',
      className
    )}>
      {children}
    </div>
  );
} 