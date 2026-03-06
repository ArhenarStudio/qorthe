"use client";

import React from 'react';
import { QuoteBuilderModule } from '@/components/quote/QuoteBuilderModule';
import { QuoteConfigProvider } from '@/hooks/useQuoteConfig';
import { QuoteErrorBoundary } from '@/components/quote/QuoteErrorBoundary';

export const QuotePage = () => {
  return (
    <QuoteErrorBoundary>
      <QuoteConfigProvider>
        <QuoteBuilderModule />
      </QuoteConfigProvider>
    </QuoteErrorBoundary>
  );
};
