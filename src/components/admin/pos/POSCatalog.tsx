"use client";

// ═══════════════════════════════════════════════════════════════
// POSCatalog — Product grid with search, categories, stock validation
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { Search, Plus, Package, Loader2 } from "lucide-react";
import { POSProduct, POSVariant, CartItem, fmtMXN, getMXNPrice } from "./types";

interface POSCatalogProps {
  products: POSProduct[];
  loading: boolean;
  filteredProducts: POSProduct[];
  productSearch: string;
  onSearchChange: (value: string) => void;
  onAdd: (product: POSProduct, variant: POSVariant) => void;
  cartItems: CartItem[];
  searchRef: React.RefObject<HTMLInputElement | null>;
}

export const POSCatalog: React.FC<POSCatalogProps> = ({
  loading, filteredProducts, productSearch, onSearchChange, onAdd, cartItems, searchRef,
}) => (
  <div className="flex-1 flex flex-col border-r border-[var(--border)] overflow-hidden">
    {/* Search */}
    <div className="p-4 border-b border-[var(--border)]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          ref={searchRef}
          type="text"
          value={productSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar producto, SKU... (⌘K)"
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface2)] border border-[var(--border)] rounded-none text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]"
        />
      </div>
    </div>

    {/* Product grid */}
    <div className="flex-1 overflow-y-auto p-4">
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[var(--text-muted)]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando productos...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
          <Package className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">No se encontraron productos</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(() => {
            const grouped = new Map<string, POSProduct[]>();
            filteredProducts.forEach((p) => {
              const cat = p.category || "Sin categoría";
              if (!grouped.has(cat)) grouped.set(cat, []);
              grouped.get(cat)!.push(p);
            });
            return Array.from(grouped.entries()).map(([cat, prods]) => (
              <div key={cat}>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-none bg-[var(--accent)]" />
                  {cat} ({prods.length})
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {prods.map((product) => (
                    <ProductCard key={product.id} product={product} onAdd={onAdd} cartItems={cartItems} />
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  </div>
);

// ═══════ ProductCard ═══════

const ProductCard: React.FC<{
  product: POSProduct;
  onAdd: (product: POSProduct, variant: POSVariant) => void;
  cartItems: CartItem[];
}> = ({ product, onAdd, cartItems }) => {
  const hasMultipleVariants = product.variants.length > 1;
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(product.variants[0]?.id ?? "");
  const variant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  if (!variant) return null;

  const price = getMXNPrice(variant.prices);
  const inCart = cartItems.find((i) => i.variant_id === variant.id);
  const cartQty = inCart?.quantity ?? 0;
  const outOfStock = variant.inventory_quantity <= 0;
  const stockExhausted = cartQty >= variant.inventory_quantity && !outOfStock;
  const disabled = outOfStock || stockExhausted;

  return (
    <div className={`relative text-left p-3 rounded-none border transition-all ${
      outOfStock ? "bg-[var(--surface2)] border-[var(--border)] opacity-60"
        : inCart ? "bg-[var(--accent)]/5 border-[var(--accent)]/30 ring-1 ring-[var(--accent)]/20"
        : "bg-[var(--surface)] border-[var(--border)]"
    }`}>
      {inCart && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--accent)] text-white rounded-none text-[9px] font-bold flex items-center justify-center shadow-sm">
          {inCart.quantity}
        </span>
      )}
      {product.thumbnail ? (
        <img src={product.thumbnail} alt="" className="w-full aspect-square rounded-none object-cover mb-2" />
      ) : (
        <div className="w-full aspect-square rounded-none bg-[var(--surface2)] flex items-center justify-center mb-2">
          <Package className="w-6 h-6 text-[var(--text-muted)]" />
        </div>
      )}
      <p className="text-[11px] font-medium text-[var(--text)] leading-tight line-clamp-2 mb-1">{product.title}</p>

      {hasMultipleVariants && (
        <select
          value={selectedVariantId}
          onChange={(e) => setSelectedVariantId(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-full mb-1.5 px-1.5 py-1 text-[10px] bg-[var(--surface2)] border border-[var(--border)] rounded-none text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
        >
          {product.variants.map((v) => (
            <option key={v.id} value={v.id} disabled={v.inventory_quantity <= 0}>
              {v.title}{v.inventory_quantity <= 0 ? " — Agotado" : ` (${v.inventory_quantity})`}
            </option>
          ))}
        </select>
      )}

      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-[var(--accent)]">{fmtMXN(price)}</span>
        {outOfStock ? (
          <span className="text-[9px] text-[var(--error)] font-medium">Agotado</span>
        ) : stockExhausted ? (
          <span className="text-[9px] text-[var(--warning)] font-medium">Máx. en carrito</span>
        ) : (
          <span className="text-[9px] text-[var(--text-muted)]">{variant.inventory_quantity - cartQty} disponibles</span>
        )}
      </div>

      <button
        onClick={() => !disabled && onAdd(product, variant)}
        disabled={disabled}
        className={`w-full py-1 text-[10px] font-semibold rounded-none border transition-all ${
          disabled
            ? "bg-[var(--surface2)] border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed"
            : "bg-[var(--primary)] border-[var(--primary)] text-white hover:opacity-90 cursor-pointer"
        }`}
      >
        {outOfStock ? "Agotado" : stockExhausted ? "Límite alcanzado" : "Agregar"}
      </button>
    </div>
  );
};
