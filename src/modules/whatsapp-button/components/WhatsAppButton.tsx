"use client";

import { useState } from 'react';
import { useAppState } from '@/modules/app-state';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left';
}

export function WhatsAppButton({
  phoneNumber,
  message,
  position = 'bottom-right'
}: WhatsAppButtonProps) {
  const { isDarkMode, language, showWhatsApp } = useAppState();
  const [isHovered, setIsHovered] = useState(false);

  if (!showWhatsApp) return null;

  const defaultMessage = language === 'es'
    ? '¡Hola! Me interesa conocer más sobre sus muebles artesanales.'
    : 'Hello! I\'m interested in learning more about your handcrafted furniture.';

  const tooltipText = language === 'es' ? '¿Necesitas ayuda?' : 'Need help?';
  const buttonText = language === 'es' ? 'Contáctanos' : 'Contact Us';

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message || defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const positionClasses = position === 'bottom-right'
    ? 'right-6 md:right-8'
    : 'left-6 md:left-8';

  return (
    <div className={`fixed bottom-24 md:bottom-28 ${positionClasses} z-50`}>
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative flex items-center gap-3 rounded-full shadow-2xl transition-all duration-300 border-2 border-[#25D366]/20 bg-[#25D366] hover:bg-[#128C7E] text-white ${
          isHovered ? 'pl-6 pr-6 py-4' : 'p-4'
        }`}
        aria-label={buttonText}
      >
        <MessageCircle className="w-6 h-6 flex-shrink-0" />

        {isHovered && (
          <span className="whitespace-nowrap text-sm font-medium animate-in fade-in slide-in-from-right-2 duration-200">
            {buttonText}
          </span>
        )}

        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      </button>

      {/* Tooltip */}
      {!isHovered && (
        <div className={`absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-opacity duration-200 ${
          isDarkMode
            ? 'bg-[#2d2419] text-[#b8a99a] border border-[#3d2f23]'
            : 'bg-gray-900 text-white'
        } opacity-0 group-hover:opacity-100 pointer-events-none`}>
          {tooltipText}
          <div className={`absolute top-full right-4 w-2 h-2 rotate-45 ${
            isDarkMode ? 'bg-[#2d2419] border-r border-b border-[#3d2f23]' : 'bg-gray-900'
          }`} />
        </div>
      )}
    </div>
  );
}
