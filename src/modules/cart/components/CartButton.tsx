"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "../hooks/useCart";

interface CartButtonProps {
  onClick: () => void;
  isDarkMode?: boolean;
}

export function CartButton({ onClick, isDarkMode }: CartButtonProps) {
  const { cartCount } = useCart();

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
      {cartCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8b6f47] text-xs font-medium text-white">
          {cartCount}
        </span>
      )}
    </button>
  );
}
