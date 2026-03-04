"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Truck, ShieldCheck, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { LaserEngravingCustomization } from '@/components/shop/LaserEngravingCustomization';
import { ProductReviews } from '@/components/reviews/ProductReviews';
import { useProduct, useProducts } from '../../hooks/useProducts';
import { useCartContext } from '@/contexts/CartContext';
import { useLoyalty } from '@/hooks/useLoyalty';
import { getMetafield } from '@/lib/commerce/types';
import type { LaserCustomizationData } from '@/lib/commerce/types';
import { LASER_SERVICE_VARIANT_ID } from '@/config/laser-engraving';
import { fbEvent, FB_EVENTS } from '@/lib/meta-pixel';
import { checkEarlyAccess, formatLaunchCountdown } from '@/lib/early-access';

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1621868315576-90f772719277?q=80&w=1000&auto=format&fit=crop";

export const ProductDetailPage = () => {
  const params = useParams();
  const handle = params?.id as string | undefined;
  const { product, loading } = useProduct(handle ?? "");
  const { products: allProducts } = useProducts();
  const { addItem, updating: cartUpdating } = useCartContext();
  const { profile: loyaltyProfile } = useLoyalty();

  // Check early access for this product
  const earlyAccess = product ? checkEarlyAccess(product, loyaltyProfile?.current_tier) : null;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [laserData, setLaserData] = useState<LaserCustomizationData | null>(null);

  // Meta Pixel: ViewContent when product loads
  React.useEffect(() => {
    if (product) {
      const variant = product.variants[selectedVariantIndex] || product.variants[0];
      fbEvent(FB_EVENTS.VIEW_CONTENT, {
        content_ids: [variant?.id || product.id],
        content_name: product.title,
        content_type: 'product',
        value: variant?.price.amount ?? 0,
        currency: variant?.price.currencyCode ?? 'MXN',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-100 dark:bg-wood-950">
        <div className="animate-pulse text-wood-500 dark:text-sand-300 font-serif text-xl">Cargando pieza...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-100 dark:bg-wood-950">
        <div className="text-center">
          <p className="text-wood-500 dark:text-sand-300 font-serif text-xl mb-4">Producto no encontrado</p>
          <Link href="/shop" className="text-accent-gold underline">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  // ── Early Access Gate ────────────────────────────────────────
  // If product has a future launch_date and user's tier doesn't
  // grant enough early_access_hours, show a restricted message.
  if (earlyAccess && !earlyAccess.isVisible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-100 dark:bg-wood-950">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 mb-3">
            Acceso Anticipado
          </h2>
          <p className="text-wood-600 dark:text-sand-300 mb-2">
            Este producto aún no está disponible para el público.
          </p>
          <p className="text-wood-500 dark:text-sand-400 text-sm mb-6">
            {formatLaunchCountdown(earlyAccess.hoursUntilPublic)} para el público general.
            Los miembros de tiers superiores tienen acceso anticipado.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/loyalty"
              className="inline-block bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-medium px-6 py-3 rounded-sm hover:opacity-90 transition-opacity"
            >
              Ver programa de lealtad
            </Link>
            <Link href="/shop" className="text-accent-gold underline text-sm">
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract data from CommerceProduct
  const material = getMetafield(product, "materials", "primary_wood") ?? "";
  const finish = getMetafield(product, "materials", "finish") ?? "";
  const dimLength = getMetafield(product, "dimensions", "length") ?? "";
  const dimWidth = getMetafield(product, "dimensions", "width") ?? "";
  const dimHeight = getMetafield(product, "dimensions", "height") ?? "";
  const dimensions = dimLength && dimWidth ? `${dimLength}cm x ${dimWidth}cm x ${dimHeight}cm` : "";
  const warranty = getMetafield(product, "care", "warranty") ?? "De por vida";
  const careInstructions = getMetafield(product, "care", "instructions") ?? "";

  const images = product.featuredImage
    ? [product.featuredImage.url]
    : [PLACEHOLDER_IMG];

  const selectedVariant = product.variants[selectedVariantIndex] ?? product.variants[0];
  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const inStock = product.variants.some(v => v.availableForSale);

  const relatedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 4);

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return;

    // Build metadata if laser personalization is active
    const metadata: Record<string, unknown> = {};
    const hasLaser = laserData?.enabled && laserData.confirmed && laserData.designs.length > 0;
    if (hasLaser) {
      // Store all designs in metadata
      metadata.custom_designs = laserData.designs
        .filter(d => d.fileUrl) // only uploaded designs
        .map((d, idx) => ({
          design_number: idx + 1,
          file_url: d.fileUrl,
          file_name: d.fileName,
          width_cm: d.widthCm,
          height_cm: d.heightCm,
          position: d.position,
          is_free: idx === 0,
        }));
      // Legacy compat: also store first design as custom_design
      const first = laserData.designs[0];
      if (first?.fileUrl) {
        metadata.custom_design = {
          file_url: first.fileUrl,
          file_name: first.fileName,
          width_cm: first.widthCm,
          height_cm: first.heightCm,
          position: first.position,
          engraving_price: 0, // first design is free
        };
      }
      metadata.extra_design_count = laserData.extraDesignCount;
    }

    // Add main product
    await addItem(
      selectedVariant.id,
      quantity,
      Object.keys(metadata).length > 0 ? metadata : undefined
    );

    // Auto-add laser engraving service ONLY for extra designs (2nd, 3rd, etc)
    if (hasLaser && laserData.extraDesignCount > 0) {
      await addItem(LASER_SERVICE_VARIANT_ID, laserData.extraDesignCount);
    }
  };

  return (
    <div className="bg-sand-50 dark:bg-wood-950 min-h-screen pt-24 pb-20 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-wood-600 dark:text-sand-400 mb-8 uppercase tracking-widest font-bold">
          <Link href="/" className="hover:text-wood-900 dark:hover:text-sand-100 transition-colors">Inicio</Link>
          <ChevronRight className="w-3 h-3 text-wood-400" />
          <Link href="/shop" className="hover:text-wood-900 dark:hover:text-sand-100 transition-colors">Catálogo</Link>
          <ChevronRight className="w-3 h-3 text-wood-400" />
          <span className="text-wood-900 dark:text-sand-100">{product.title}</span>
        </nav>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-24 items-start">
          
          {/* Left: Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-square md:aspect-[4/3] bg-wood-100 dark:bg-wood-900 rounded-lg overflow-hidden shadow-sm group border border-wood-200 dark:border-wood-800"
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImageIndex}
                  src={images[activeImageIndex] ?? PLACEHOLDER_IMG} 
                  alt={product.title} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover cursor-zoom-in"
                />
              </AnimatePresence>

              {/* Wishlist Button */}
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`absolute top-4 right-4 p-3 bg-white/90 dark:bg-wood-900/90 backdrop-blur-sm rounded-full shadow-md transition-all z-20 ${isWishlisted ? 'text-red-500' : 'text-wood-400 dark:text-sand-400 hover:text-red-500'}`}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-wood-900/80 backdrop-blur-sm text-wood-900 dark:text-sand-100 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-wood-900/80 backdrop-blur-sm text-wood-900 dark:text-sand-100 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-sm overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-accent-gold opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="pt-2 lg:pt-4">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-accent-gold text-xs font-extrabold tracking-[0.2em] uppercase border-b-2 border-accent-gold/20 pb-1">
                  {material || product.productType || "Artesanal"}
                </span>
              </div>

              {/* Early Access Badge (detail view) */}
              {earlyAccess?.isEarlyAccess && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-sm uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5" />
                    Acceso Anticipado
                  </span>
                  {earlyAccess.hoursUntilPublic > 0 && (
                    <span className="text-xs text-wood-500 dark:text-sand-400">
                      {formatLaunchCountdown(earlyAccess.hoursUntilPublic)}
                    </span>
                  )}
                </div>
              )}

              <h1 className="text-4xl md:text-5xl font-serif text-wood-900 dark:text-sand-100 mb-6 leading-[1.1]">
                {product.title}
              </h1>

              {/* Variant Selector */}
              {product.variants.length > 1 && (
                <div className="mb-6">
                  <span className="block text-wood-500 dark:text-sand-400 uppercase tracking-widest text-[10px] font-bold mb-3">Tamaño</span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v, idx) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`px-4 py-2 text-sm border-2 rounded-lg transition-all ${
                          selectedVariantIndex === idx 
                            ? 'border-accent-gold bg-accent-gold/10 text-wood-900 dark:text-sand-100 font-bold' 
                            : 'border-wood-200 dark:border-wood-700 text-wood-600 dark:text-sand-300 hover:border-accent-gold/50'
                        }`}
                      >
                        {v.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col mb-8 pb-8 border-b border-wood-200 dark:border-wood-800">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-medium text-wood-900 dark:text-sand-100">
                    ${price.amount.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-wood-500 dark:text-sand-400 uppercase tracking-wide">{price.currencyCode}</span>
                </div>
                {selectedVariant?.compareAtPrice && (
                  <span className="text-lg text-wood-400 line-through mt-1">
                    ${selectedVariant.compareAtPrice.amount.toLocaleString()}
                  </span>
                )}
                <span className="text-xs text-wood-500 dark:text-sand-400 mt-1 font-medium">Impuestos incluidos. Envío calculado en el checkout.</span>
              </div>

              <p className="text-lg text-wood-800 dark:text-sand-200 font-normal leading-relaxed mb-10">
                {product.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-y-8 gap-x-12 mb-12 p-6 bg-wood-50 dark:bg-wood-900 rounded-xl border border-wood-100 dark:border-wood-800">
                {material && (
                  <div>
                    <span className="block text-wood-500 dark:text-sand-400 uppercase tracking-widest text-[10px] font-bold mb-2">Material</span>
                    <span className="font-bold text-wood-900 dark:text-sand-100 text-base">{material}</span>
                  </div>
                )}
                {dimensions && (
                  <div>
                    <span className="block text-wood-500 dark:text-sand-400 uppercase tracking-widest text-[10px] font-bold mb-2">Dimensiones</span>
                    <span className="font-bold text-wood-900 dark:text-sand-100 text-base">{dimensions}</span>
                  </div>
                )}
                {finish && (
                  <div>
                    <span className="block text-wood-500 dark:text-sand-400 uppercase tracking-widest text-[10px] font-bold mb-2">Acabado</span>
                    <span className="font-bold text-wood-900 dark:text-sand-100 text-base">{finish}</span>
                  </div>
                )}
                <div>
                  <span className="block text-wood-500 dark:text-sand-400 uppercase tracking-widest text-[10px] font-bold mb-2">Envío</span>
                  <span className="font-bold text-wood-900 dark:text-sand-100 flex items-center gap-2 text-base">
                    <Truck className="w-4 h-4 text-accent-gold" /> 2-5 días hábiles
                  </span>
                </div>
                <div>
                  <span className="block text-wood-500 dark:text-sand-400 uppercase tracking-widest text-[10px] font-bold mb-2">Garantía</span>
                  <span className="font-bold text-wood-900 dark:text-sand-100 flex items-center gap-2 text-base">
                    <ShieldCheck className="w-4 h-4 text-accent-gold" /> {warranty}
                  </span>
                </div>
              </div>

              {/* Laser Engraving Option */}
              <div className="mb-8">
                <LaserEngravingCustomization onChange={setLaserData} />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4 mb-10">
                <div className="flex gap-4">
                  <div className="flex items-center border-2 border-wood-200 dark:border-wood-700 rounded-xl h-16 w-32 overflow-hidden bg-white dark:bg-wood-800">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-full flex items-center justify-center text-wood-500 dark:text-sand-300 hover:text-wood-900 dark:hover:text-sand-100 hover:bg-wood-50 dark:hover:bg-wood-700 transition-colors font-bold text-xl"
                    >-</button>
                    <span className="flex-1 text-center font-bold text-wood-900 dark:text-sand-100 text-xl">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-full flex items-center justify-center text-wood-500 dark:text-sand-300 hover:text-wood-900 dark:hover:text-sand-100 hover:bg-wood-50 dark:hover:bg-wood-700 transition-colors font-bold text-xl"
                    >+</button>
                  </div>
                  
                  <button 
                    onClick={handleAddToCart}
                    disabled={!inStock || cartUpdating}
                    className="flex-1 h-16 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 text-sm sm:text-base font-bold uppercase tracking-widest sm:tracking-[0.2em] hover:bg-accent-gold dark:hover:bg-accent-gold hover:text-wood-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                  >
                    <ShoppingBag className="w-5 h-5 hidden sm:block" />
                    {cartUpdating ? 'Agregando...' : inStock ? 'Añadir al Carrito' : 'Agotado'}
                  </button>
                </div>
                <p className="text-center text-xs text-wood-400 font-medium">
                  Envío gratuito en pedidos superiores a $2,500 MXN
                </p>
              </div>

              {/* Care Instructions */}
              {careInstructions && (
                <div className="p-4 bg-sand-100 dark:bg-wood-800 rounded-lg border border-wood-100 dark:border-wood-700">
                  <span className="block text-wood-500 dark:text-sand-400 uppercase tracking-widest text-[10px] font-bold mb-2">Cuidado</span>
                  <p className="text-sm text-wood-700 dark:text-sand-300 leading-relaxed">{careInstructions}</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-24">
          <ProductReviews productId={product.id} productTitle={product.title} productThumbnail={product.featuredImage?.url} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-wood-200 dark:border-wood-800 pt-16 mt-16">
            <div className="flex items-end justify-between mb-10 pb-4 border-b border-wood-100 dark:border-wood-800">
              <div>
                <span className="text-xs font-bold text-accent-gold uppercase tracking-widest mb-2 block">Descubre más</span>
                <h2 className="text-3xl md:text-4xl font-serif text-wood-900 dark:text-sand-100 leading-tight">Piezas Complementarias</h2>
              </div>
              <Link href="/shop" className="group flex items-center gap-2 text-sm font-bold text-wood-900 dark:text-sand-100 hover:text-accent-gold transition-colors pb-1">
                Ver colección completa 
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {relatedProducts.map(rp => (
                <ProductCard key={rp.id} product={rp} onAddToCart={(variantId) => addItem(variantId)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
