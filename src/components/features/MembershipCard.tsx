"use client";

import React from 'react';

export const MembershipCard = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Card Container */}
      <div 
        className="w-[380px] h-[240px] rounded-[16px] relative p-[28px] flex flex-col justify-between shadow-[0_8px_24px_rgba(197,160,101,0.3)]"
        style={{
          background: 'linear-gradient(to right, #C5A065, #FFD700)'
        }}
      >
        {/* Top Row */}
        <div className="flex justify-between items-start z-10">
          <span className="font-sans font-bold text-[11px] text-white opacity-90">
            DavidSon's Design
          </span>
          <span className="font-sans font-bold text-[9px] uppercase tracking-[3px] text-white">
            GOLD MEMBER
          </span>
        </div>

        {/* Middle Content (Centered Vertically) */}
        <div className="absolute top-1/2 transform -translate-y-1/2 left-[28px] z-10">
          <span className="font-sans font-bold text-[16px] tracking-[1px] text-white">
            CARLOS ALEJANDRO
          </span>
        </div>

        {/* Bottom Row */}
        <div className="flex justify-between items-end z-10">
          <span className="font-mono text-[11px] text-white opacity-70">
            DSD-2024-00142
          </span>
          <span className="font-sans font-bold text-[14px] text-white">
            2,540 pts
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-[20px] flex gap-[12px]">
        <button className="bg-[#1a140e] rounded-[8px] px-[20px] py-[10px] font-sans text-[12px] text-white hover:bg-[#2d2419] transition-colors">
          Apple Wallet
        </button>
        <button className="bg-[#FFFFFF] border border-[#D7CCC8] rounded-[8px] px-[20px] py-[10px] font-sans text-[12px] text-[#2d2419] hover:bg-[#faf9f8] transition-colors">
          Google Wallet
        </button>
      </div>
    </div>
  );
};
