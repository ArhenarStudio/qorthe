"use client";

import { useState } from 'react';
import { useAppState } from '@/modules/app-state';
import { Mail, Check, Loader2 } from 'lucide-react';

export function Newsletter() {
  const { isDarkMode, language } = useAppState();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const translations = {
    es: {
      title: 'Suscríbete a Nuestro Newsletter',
      description: 'Recibe las últimas novedades, promociones exclusivas y consejos de diseño.',
      placeholder: 'tu@email.com',
      button: 'Suscribirse',
      loading: 'Enviando...',
      success: '¡Gracias por suscribirte!',
      errorInvalid: 'Por favor ingresa un email válido',
      errorGeneral: 'Ocurrió un error. Intenta de nuevo.'
    },
    en: {
      title: 'Subscribe to Our Newsletter',
      description: 'Receive the latest news, exclusive promotions and design tips.',
      placeholder: 'your@email.com',
      button: 'Subscribe',
      loading: 'Sending...',
      success: 'Thank you for subscribing!',
      errorInvalid: 'Please enter a valid email',
      errorGeneral: 'An error occurred. Try again.'
    }
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage(t.errorInvalid);
      return;
    }

    setStatus('loading');

    // TODO: Replace with real API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStatus('success');
      setEmail('');

      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch {
      setStatus('error');
      setErrorMessage(t.errorGeneral);

      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 3000);
    }
  };

  return (
    <div className={`border-t ${isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'}`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-3">
            <h3 className={`text-2xl md:text-3xl tracking-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {t.title}
            </h3>
            <p className={`text-base ${
              isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
            }`}>
              {t.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-400'
              }`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholder}
                disabled={status === 'loading' || status === 'success'}
                className={`w-full pl-12 pr-4 py-3.5 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-[#2d2419] border-[#3d2f23] text-white placeholder-[#b8a99a]/50 focus:ring-[#8b6f47] focus:border-[#8b6f47]'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#8b6f47] focus:border-[#8b6f47]'
                } ${status === 'error' ? 'border-red-500' : ''}`}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className={`px-8 py-3.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                status === 'success'
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-[#8b6f47] text-white hover:bg-[#6d5638] disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
              {status === 'success' && <Check className="w-5 h-5" />}

              {status === 'idle' && t.button}
              {status === 'loading' && t.loading}
              {status === 'success' && t.success}
              {status === 'error' && t.button}
            </button>
          </form>

          {status === 'error' && errorMessage && (
            <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
