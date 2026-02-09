"use client";

import { ShoppingCart } from "lucide-react";

interface CartButtonProps {
  itemCount: number;
  onClick: () => void;
  isDarkMode?: boolean;
}

export function CartButton({
  itemCount,
  onClick,
  isDarkMode,
}: CartButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-full p-2 transition-colors ${
        isDarkMode
          ? "text-[#f5f0e8] hover:bg-[#2d2419]"
          : "text-gray-900 hover:bg-gray-100"
      }`}
      aria-label="Carrito de compras"
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8b6f47] text-xs font-medium text-white">
          {itemCount}
        </span>
      )}
    </button>
  );
}
