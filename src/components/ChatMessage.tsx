import React from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
  image?: {
    file: File;
    preview: string;
  };
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className={`flex items-start space-x-2 sm:space-x-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 sm:h-12 sm:w-12 mt-1 border-2 border-primary-blue/30 shadow-lg shrink-0">
          <AvatarFallback 
            className="text-text-primary"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 153, 255, 0.2) 0%, rgba(0, 153, 255, 0.1) 100%)'
            }}
          >
            <Bot className="h-4 w-4 sm:h-6 sm:w-6" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[280px] sm:max-w-md lg:max-w-2xl ${isUser ? 'order-first' : ''} space-y-3`}>
        {/* Image séparée avec effet halo */}
        {message.image && (
          <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className="relative">
              <div 
                className="relative rounded-xl sm:rounded-2xl overflow-hidden"
                style={{
                  boxShadow: isUser 
                    ? '0 0 30px rgba(0, 153, 255, 0.4), 0 0 60px rgba(0, 153, 255, 0.2), 0 8px 32px rgba(0, 153, 255, 0.3)'
                    : '0 0 30px rgba(0, 136, 204, 0.4), 0 0 60px rgba(0, 136, 204, 0.2), 0 8px 32px rgba(0, 136, 204, 0.3)'
                }}
              >
                <img
                  src={message.image.preview}
                  alt="Image uploadée"
                  className="w-full max-w-64 sm:max-w-80 max-h-48 sm:max-h-60 object-cover"
                />
                <div 
                  className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 text-white text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 153, 255, 0.7) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {message.image.file.name}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message texte dans son propre bloc */}
        {message.text && (
          <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`rounded-2xl sm:rounded-3xl px-3 sm:px-6 py-3 sm:py-4 shadow-lg ${
                isUser
                  ? 'text-white'
                  : 'text-text-primary'
              }`}
              style={isUser ? {
                background: 'linear-gradient(135deg, #0099FF 0%, #0088cc 100%)',
                boxShadow: '0 8px 32px rgba(0, 153, 255, 0.3)'
              } : {
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(0, 153, 255, 0.2)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 153, 255, 0.1)'
              }}
            >
              <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{message.text}</p>
            </div>
          </div>
        )}
        
        {/* Timestamp */}
        <div className={`text-xs text-primary-blue/70 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 sm:h-12 sm:w-12 mt-1 border-2 border-primary-blue/30 shadow-lg shrink-0">
          <AvatarFallback 
            className="text-text-primary"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 153, 255, 0.2) 0%, rgba(0, 153, 255, 0.1) 100%)'
            }}
          >
            <User className="h-4 w-4 sm:h-6 sm:w-6" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}
