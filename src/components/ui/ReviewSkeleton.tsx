"use client";

import React from 'react';
import { motion } from 'motion/react';

export const ReviewSkeleton = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div 
          key={i}
          className="border border-wood-100 dark:border-wood-800 bg-white dark:bg-wood-900/40 p-6 rounded-xl relative overflow-hidden"
        >
          <div className="animate-pulse flex flex-col gap-4">
            {/* Header: Avatar + Meta */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-wood-100 dark:bg-wood-800" />
                
                {/* Name & Stars */}
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-wood-100 dark:bg-wood-800 rounded" />
                  <div className="h-3 w-20 bg-wood-50 dark:bg-wood-800/50 rounded" />
                </div>
              </div>
              {/* Date */}
              <div className="h-3 w-24 bg-wood-50 dark:bg-wood-800/50 rounded" />
            </div>

            {/* Content lines */}
            <div className="space-y-2 mt-2">
              <div className="h-3 w-full bg-wood-50 dark:bg-wood-800/30 rounded" />
              <div className="h-3 w-5/6 bg-wood-50 dark:bg-wood-800/30 rounded" />
              <div className="h-3 w-4/6 bg-wood-50 dark:bg-wood-800/30 rounded" />
            </div>
          </div>
          
          {/* Shimmer effect overlay for premium feel */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-wood-700/10 to-transparent" />
        </div>
      ))}
    </div>
  );
};
