"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';

const logoDSD = '/images/logo-dsd.png';

export const CheckoutHeader = () => {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between py-6 mb-8">
      <img 
        src={logoDSD} 
        alt="Qorthe" 
        className="h-8 md:h-10 w-auto cursor-pointer" 
        onClick={() => router.push('/')}
      />

      <div className="flex items-center gap-2 text-wood-400 opacity-80">
        <Lock className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wider hidden md:block">Checkout Seguro</span>
      </div>
    </header>
  );
};
