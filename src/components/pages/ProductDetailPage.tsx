"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Truck, ShieldCheck, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { products as staticProducts, Product } from '@/data/products';
import { addToCart } from '@/utils/cartActions';
import { ProductCard } from '@/components/shop/ProductCard';
import { LaserEngravingCustomization } from '@/components/shop/LaserEngravingCustomization';
import { ProductReviews } from '@/components/reviews/ProductReviews';
import { useMedusaProducts, useMedusaProduct } from '../../hooks/useMedusaProducts';

export const ProductDetailPage = () => {
  const params = useParams();
  const slug = params?.id as string | undefined;
  const { product: medusaProduct, loading: medusaLoading } = useMedusaProduct(slug ?? "");
  const { products: allMedusaProducts } = useMedusaProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Try Medusa product first, then fallback to static data
    if (medusaProduct) {
      setProduct(medusaProduct);
      setActiveImageIndex(0);
      setQuantity(1);
      setIsWishlisted(false);
      // Related products from Medusa
      const related = allMedusaProducts.filter(p => p.id !== medusaProduct.id).slice(0, 4);
      setRelatedProducts(related.length > 0 ? related : staticProducts.slice(0, 4));
    } else if (!medusaLoading) {
      // Fallback to static data
      const found = staticProducts.find(p => p.slug === slug);
      if (found) {
        setProduct(found);
        setActiveImageIndex(0);
        setQuantity(1);
        setIsWishlisted(false);
        setRelatedProducts(staticProducts.filter(p => p.category === found.category && p.id !== found.id).slice(0, 4));
      }
    }
    window.scrollTo(0, 0);
  }, [slug, medusaProduct, medusaLoading, allMedusaProducts]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-100 dark:bg-wood-950">
        <div className="animate-pulse text-wood-500 dark:text-sand-300 font-serif text-xl">Cargando pieza...</div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      name: product.name,
      price: product.price,
      image: product.images[0]
    });
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
          <span className="text-wood-900 dark:text-sand-100">{product.name}</span>
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
                    src={product.images[activeImageIndex]} 
                    alt={product.name} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-cover cursor-zoom-in"
                  />
                </AnimatePresence>

                {/* Wishlist Button Overlay */}
                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`absolute top-4 right-4 p-3 bg-white/90 dark:bg-wood-900/90 backdrop-blur-sm rounded-full shadow-md transition-all z-20 group/heart ${isWishlisted ? 'text-red-500' : 'text-wood-400 dark:text-sand-400 hover:text-red-500 hover:bg-white dark:hover:bg-wood-800'}`}
                  title={isWishlisted ? "Eliminar de favoritos" : "Añadir a favoritos"}
                >
                  <motion.div
                    animate={{ scale: isWishlisted ? [1, 1.3, 1] : [1, 0.8, 1] }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Heart className={`w-6 h-6 transition-colors ${isWishlisted ? 'fill-current' : 'group-hover/heart:fill-current'}`} />
                  </motion.div>
                </button>
                
                {/* Image Navigation */}
                {product.images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-wood-900/80 backdrop-blur-sm text-wood-900 dark:text-sand-100 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-gold hover:text-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % product.images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-wood-900/80 backdrop-blur-sm text-wood-900 dark:text-sand-100 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-gold hover:text-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </motion.div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {product.images.map((img, idx) => (
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
                  {product.category}
                </span>
                {product.rating && (
                  <div className="flex items-center gap-2 text-wood-800 dark:text-sand-100 text-sm font-medium bg-wood-100 dark:bg-wood-800 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-accent-gold fill-current" />
                    <span>{product.rating}</span>
                    <span className="text-wood-500 dark:text-sand-400 text-xs">({product.reviews} reseñas)</span>
                  </div>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-serif text-wood-900 dark:text-sand-100 mb-6 leading-[1.1]">
                {product.name}
              </h1>

              <div className="flex flex-col mb-8 pb-8 border-b border-wood-200 dark:border-wood-800">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-medium text-wood-900 dark:text-sand-100">
                    ${product.price.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-wood-500 dark:text-sand-400 uppercase tracking-wide">MXN</span>
                </div>
                <span className="text-xs text-wood-500 dark:text-sand-400 mt-1 font-medium">Impuestos incluidos. Envío calculado en el checkout.</span>
              </div>

              <p className="text-lg text-wood-800 dark:text-sand-200 font-normal leading-relaxed mb-10">
                {product.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-y-8 gap-x-12 mb-12 p-6 bg-wood-50 dark:bg-wood-900 rounded-xl border border-wood-100 dark:border-wood-800">
                <div>
                  <span className="block text-wood-500 dark:text-sand-400 uppercase tracking-widest text-[10px] font-bold mb-2">Material</span>
                  <span className="font-bold text-wood-900 dark:text-sand-100 text-base">{product.material}</span>
                </div>
                <div>
                  <span className="block text-wood-500 dark:text-sand-400 uppercase tracking-widest text-[10px] font-bold mb-2">Dimensiones</span>
                  <span className="font-bold text-wood-900 dark:text-sand-100 text-base">{product.dimensions}</span>
                </div>
                <div>
                  <span className="block text-wood-500 dark:text-sand-400 uppercase tracking-widest text-[10px] font-bold mb-2">Envío</span>
                  <span className="font-bold text-wood-900 dark:text-sand-100 flex items-center gap-2 text-base">
                    <Truck className="w-4 h-4 text-accent-gold" /> 2-5 días hábiles
                  </span>
                </div>
                <div>
                  <span className="block text-wood-500 dark:text-sand-400 uppercase tracking-widest text-[10px] font-bold mb-2">Garantía</span>
                  <span className="font-bold text-wood-900 dark:text-sand-100 flex items-center gap-2 text-base">
                    <ShieldCheck className="w-4 h-4 text-accent-gold" /> De por vida
                  </span>
                </div>
              </div>

              {/* Laser Engraving Option */}
              <div className="mb-8">
                <LaserEngravingCustomization />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4 mb-10">
                <div className="flex gap-4">
                  <div className="flex items-center border-2 border-wood-200 dark:border-wood-700 rounded-xl h-16 w-32 overflow-hidden bg-white dark:bg-wood-800">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-full flex items-center justify-center text-wood-500 dark:text-sand-300 hover:text-wood-900 dark:hover:text-sand-100 hover:bg-wood-50 dark:hover:bg-wood-700 transition-colors font-bold text-xl"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-wood-900 dark:text-sand-100 text-xl">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-full flex items-center justify-center text-wood-500 dark:text-sand-300 hover:text-wood-900 dark:hover:text-sand-100 hover:bg-wood-50 dark:hover:bg-wood-700 transition-colors font-bold text-xl"
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 h-16 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 text-sm sm:text-base font-bold uppercase tracking-widest sm:tracking-[0.2em] hover:bg-accent-gold dark:hover:bg-accent-gold hover:text-wood-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                  >
                    <ShoppingBag className="w-5 h-5 hidden sm:block" />
                    {product.inStock ? 'Añadir al Carrito' : 'Agotado'}
                  </button>
                </div>
                <p className="text-center text-xs text-wood-400 font-medium">
                  Envío gratuito en pedidos superiores a $2,500 MXN
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-24">
          <ProductReviews productId={product.id} />
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
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
