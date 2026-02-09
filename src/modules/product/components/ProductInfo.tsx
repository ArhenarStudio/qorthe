"use client";

import { useState } from "react";

interface ProductInfoProps {
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  description: string;
  features: string[];
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  fabricationTime?: string;
  warranty?: number;
  artistName?: string;
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export function ProductInfo({
  title,
  price,
  originalPrice,
  discount,
  description,
  features,
  dimensions,
  fabricationTime = "3 días",
  warranty = 1,
  artistName = "David Pérez Muro",
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);

  return (
    <div>
      {/* Título y Precio */}
      <div className="mb-6">
        <h1 className="mb-3 text-3xl font-bold text-walnut-500 md:text-4xl">
          {title}
        </h1>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-walnut-500">
            {formatPrice(price)}
          </span>
          {originalPrice != null && originalPrice > price && (
            <>
              <span className="text-xl text-taupe-600 line-through">
                {formatPrice(originalPrice)}
              </span>
              {discount != null && (
                <span className="rounded bg-red-100 px-2 py-1 text-sm font-semibold text-red-700">
                  -{discount}%
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Descripción Corta */}
      <div className="mb-6">
        <p className="leading-relaxed text-taupe-600">{description}</p>
      </div>

      {/* Características Rápidas */}
      <div className="mb-6 space-y-3">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <CheckIcon />
            <span className="text-taupe-700">{feature}</span>
          </div>
        ))}
      </div>

      {/* Dimensiones Rápidas */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded bg-sand-50 p-3 text-center">
          <div className="text-2xl font-bold text-walnut-500">
            {dimensions.length}
          </div>
          <div className="text-xs uppercase text-taupe-500">Largo (cm)</div>
        </div>
        <div className="rounded bg-sand-50 p-3 text-center">
          <div className="text-2xl font-bold text-walnut-500">
            {dimensions.width}
          </div>
          <div className="text-xs uppercase text-taupe-500">Ancho (cm)</div>
        </div>
        <div className="rounded bg-sand-50 p-3 text-center">
          <div className="text-2xl font-bold text-walnut-500">
            {dimensions.height}
          </div>
          <div className="text-xs uppercase text-taupe-500">Alto (cm)</div>
        </div>
      </div>

      {/* Selector de Cantidad */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-taupe-700">
          Cantidad
        </label>
        <div className="flex w-32 items-center rounded border border-sand-600">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-4 py-2 hover:bg-sand-50"
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) setQuantity(Math.max(1, v));
            }}
            className="w-full border-x border-sand-600 py-2 text-center focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-4 py-2 hover:bg-sand-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Botón Principal */}
      <button
        type="button"
        className="mb-4 w-full rounded-lg bg-walnut-500 px-8 py-4 font-semibold text-cream transition-colors hover:bg-walnut-600"
      >
        Agregar al Carrito
      </button>

      {/* Info Adicional */}
      <div className="space-y-3 border-t border-sand-100 pt-6 text-sm text-taupe-600">
        <div className="flex items-center gap-3">
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <strong>Tiempo de fabricación:</strong> {fabricationTime}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <strong>Garantía:</strong> {warranty} año
          </span>
        </div>
        <div className="flex items-center gap-3">
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>
            <strong>Artesano:</strong> {artistName}
          </span>
        </div>
      </div>
    </div>
  );
}
