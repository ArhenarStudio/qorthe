"use client";

import React from 'react';
import { QuoteBuilderModule } from '@/components/quote/QuoteBuilderModule';
import { QuoteConfigProvider } from '@/hooks/useQuoteConfig';

export const QuotePage = () => {
  return (
    <QuoteConfigProvider>
      <QuoteBuilderModule />
    </QuoteConfigProvider>
  );
};
