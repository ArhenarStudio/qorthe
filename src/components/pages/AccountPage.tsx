"use client";

import React, { useState } from 'react';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { AccountOverview } from '@/components/account/AccountOverview';
import { AccountSettings } from '@/components/account/AccountSettings';
import { OrdersList } from '@/components/account/OrdersList';
import { LoyaltyDashboard } from '@/components/account/LoyaltyDashboard';
import { normalizeTierId } from '@/data/loyalty';
import { useLoyaltyConfig } from '@/hooks/useLoyaltyConfig';
import { useLoyalty } from '@/hooks/useLoyalty';
import { AddressBook } from '@/components/account/AddressBook';
import { Wallet } from '@/components/account/Wallet';
import { Wishlist } from '@/components/account/Wishlist';
import { UserReviews } from '@/components/account/UserReviews';
import { AccountSecurity } from '@/components/account/AccountSecurity';
import { QuotationsList } from '@/components/account/QuotationsList';

import { SubscriptionsList } from '@/components/account/SubscriptionsList';
import { SavedDesigns } from '@/components/account/SavedDesigns';
import { BusinessDashboard } from '@/components/account/BusinessDashboard';
import { BillingDashboard } from '@/components/account/billing/BillingDashboard';

export type AccountSection = 'overview' | 'loyalty' | 'orders' | 'quotations' | 'addresses' | 'wallet' | 'wishlist' | 'reviews' | 'settings' | 'security' | 'subscriptions' | 'designs' | 'business' | 'billing';

export const AccountPage = () => {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<AccountSection>('overview');
  const { profile: loyaltyProfile } = useLoyalty();
  const { config: loyaltyConfig } = useLoyaltyConfig();

  // Derive tier from real loyalty data
  const lifetimeSpendCentavos = loyaltyProfile?.lifetime_spend ?? 0;
  const rawTierId = loyaltyProfile?.current_tier || 'pino';
  const normalizedId = normalizeTierId(rawTierId);
  const currentTierConfig = loyaltyConfig.tiers.find(t => t.id === normalizedId)
    || loyaltyConfig.tiers.find(t => lifetimeSpendCentavos >= t.min_spend && (t.max_spend === null || lifetimeSpendCentavos <= t.max_spend))
    || loyaltyConfig.tiers[0];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <AccountOverview onChangeSection={setActiveSection} />;
      case 'loyalty': return <LoyaltyDashboard />;
      case 'orders': return <OrdersList />;
      case 'quotations': return <QuotationsList />;
      case 'addresses': return <AddressBook />;
      case 'wallet': return <Wallet />;
      case 'wishlist': return <Wishlist />;
      case 'reviews': return <UserReviews />;
      case 'settings': return <AccountSettings />;
      case 'security': return <AccountSecurity />;
      case 'subscriptions': return <SubscriptionsList />;
      case 'designs': return <SavedDesigns />;
      case 'business': return <BusinessDashboard />;
      case 'billing': return <BillingDashboard />;
      default: return <AccountOverview onChangeSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-wood-950 pt-12 pb-24 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Header Section */}
        <div className="mb-10 lg:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-wood-900/5 dark:border-sand-100/5 pb-8">
          <div>
             <motion.h1 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="font-serif text-4xl md:text-5xl text-wood-900 dark:text-sand-100 mb-3 tracking-tight"
             >
               Mi Cuenta
             </motion.h1>
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.1 }}
               className="text-wood-500 dark:text-sand-400 font-light text-lg"
             >
               Bienvenido de nuevo, <span className="font-medium text-wood-800 dark:text-sand-200">Alejandro</span>
             </motion.p>
          </div>
          <div className="text-sm text-wood-400 dark:text-sand-500 font-medium tracking-widest uppercase">
            DavidSon's Member
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 lg:sticky lg:top-32 z-10">
            <AccountSidebar 
              activeSection={activeSection} 
              onNavigate={setActiveSection} 
              currentTierName={currentTierConfig.name}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 min-h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
