"use client";

import React from 'react';

export const SkeletonLoader = () => {
  return (
    <div className="w-[1200px] bg-transparent grid grid-cols-4 gap-[24px]">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="flex flex-col">
          {/* Image Placeholder */}
          <div className="w-full aspect-[4/3] bg-[#D7CCC8] mb-[16px]"></div>
          
          {/* Name Placeholder */}
          <div className="w-[65%] h-[14px] bg-[#D7CCC8] rounded-[4px] mb-[10px]"></div>
          
          {/* Price Placeholder */}
          <div className="w-[30%] h-[14px] bg-[#D7CCC8] rounded-[4px]"></div>
        </div>
      ))}
    </div>
  );
};
