"use client";
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary context="checkout">
      {children}
    </ErrorBoundary>
  );
}
