"use client";

import React from 'react';

import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/auth/AuthModal';

export const AuthPage = () => {
  const router = useRouter();
  
  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-wood-950 relative">
        <div className="absolute inset-0 opacity-30">
            <img 
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80" 
                alt="Background" 
                className="w-full h-full object-cover"
            />
        </div>
        <AuthModal isOpen={true} onClose={handleClose} />
    </div>
  );
};
