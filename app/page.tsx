'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Principal */}
      <header className={`fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100'}`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-xl md:text-2xl font-bold">Davidsons Design</span>
          </Link>
          
          <nav className="flex items-center gap-6 md:gap-12">
            <Link href="/products" className="text-gray-600 hover:text-black transition-colors tracking-wide text-sm md:text-base">
              Productos
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-black transition-colors tracking-wide text-sm md:text-base">
              Carrito
            </Link>
          </nav>
        </div>
      </header>

      {/* Header Simplificado (Scroll) */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full px-6 md:px-8 py-3 shadow-lg">
          <nav className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <span className="text-lg md:text-xl font-bold">Davidsons Design</span>
            </Link>
            <Link href="/products" className="text-gray-600 hover:text-black transition-colors text-xs md:text-sm tracking-wide">
              Productos
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-black transition-colors text-xs md:text-sm tracking-wide">
              Carrito
            </Link>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center min-h-[calc(100vh-8rem)]">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl leading-tight tracking-tight font-bold">
                  Muebles<br />
                  Artesanales<br />
                  Premium
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                  Cada pieza es elaborada a mano por artesanos mexicanos, 
                  combinando técnicas tradicionales con diseño contemporáneo 
                  para crear muebles únicos y atemporales.
                </p>
              </div>
              
              <Link href="/products" className="inline-block bg-black text-white px-8 md:px-10 py-3 md:py-4 hover:opacity-90 transition-opacity tracking-wide text-sm md:text-base">
                Explorar Colección
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-[3/4] overflow-hidden rounded-lg">
                <Image
                  src="https://images.unsplash.com/photo-1687180498602-5a1046defaa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Muebles artesanales premium"
                  width={1080}
                  height={1440}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute -bottom-8 -left-8 w-48 h-48 md:w-64 md:h-64 bg-gray-100 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Colecciones Destacadas */}
      <section id="productos" className="py-16 md:py-24 bg-black text-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12 md:mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl tracking-tight font-bold">Nuestras Colecciones</h2>
            <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Descubre piezas únicas diseñadas para transformar tu espacio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/products" className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden mb-6 rounded-lg">
                <Image
                  src="https://images.unsplash.com/photo-1675528030415-dc82908eeb73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Sillas artesanales"
                  width={1080}
                  height={1440}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl md:text-2xl mb-2 font-bold">Sillas & Sillones</h3>
              <p className="opacity-70 mb-4 text-sm md:text-base">Diseños ergonómicos con carácter artesanal</p>
              <span className="text-xs md:text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity border-b border-current pb-1">
                Ver Colección
              </span>
            </Link>

            <Link href="/products" className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden mb-6 rounded-lg">
                <Image
                  src="https://images.unsplash.com/photo-1758977403438-1b8546560d31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Mesas de comedor"
                  width={1080}
                  height={1440}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl md:text-2xl mb-2 font-bold">Mesas de Comedor</h3>
              <p className="opacity-70 mb-4 text-sm md:text-base">El centro de reunión de tu hogar</p>
              <span className="text-xs md:text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity border-b border-current pb-1">
                Ver Colección
              </span>
            </Link>

            <Link href="/products" className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden mb-6 rounded-lg">
                <Image
                  src="https://images.unsplash.com/photo-1680503146476-abb8c752e1f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Recámaras"
                  width={1080}
                  height={1440}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl md:text-2xl mb-2 font-bold">Recámaras</h3>
              <p className="opacity-70 mb-4 text-sm md:text-base">Espacios de descanso con elegancia</p>
              <span className="text-xs md:text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity border-b border-current pb-1">
                Ver Colección
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Proceso Artesanal */}
      <section id="about" className="py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="relative order-2 md:order-1">
              <div className="aspect-square overflow-hidden rounded-lg">
                <Image
                  src="https://images.unsplash.com/photo-1759523069474-3c45494a6679?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Proceso artesanal"
                  width={1080}
                  height={1080}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-8 -right-8 w-48 h-48 md:w-64 md:h-64 bg-gray-100 -z-10"></div>
            </div>

            <div className="space-y-8 order-1 md:order-2">
              <h2 className="text-3xl md:text-5xl tracking-tight leading-tight font-bold">
                Artesanía<br />
                Mexicana<br />
                Auténtica
              </h2>
              <div className="space-y-6 text-base md:text-lg text-gray-600 leading-relaxed">
                <p>
                  Cada mueble de Davidsons Design nace de la pasión y 
                  dedicación de maestros artesanos mexicanos que han 
                  perfeccionado su oficio a lo largo de generaciones.
                </p>
                <p>
                  Seleccionamos cuidadosamente maderas nobles y 
                  materiales sostenibles, transformándolos en piezas 
                  únicas que cuentan una historia y perduran en el tiempo.
                </p>
                <p>
                  Nuestro compromiso es preservar las técnicas 
                  tradicionales mientras exploramos nuevas formas de 
                  diseño contemporáneo.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-6 md:gap-8 pt-8">
                <div>
                  <div className="text-3xl md:text-4xl mb-2 font-bold">25+</div>
                  <div className="text-xs md:text-sm text-gray-600 tracking-wide">Años de Experiencia</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl mb-2 font-bold">100%</div>
                  <div className="text-xs md:text-sm text-gray-600 tracking-wide">Hecho a Mano</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl mb-2 font-bold">500+</div>
                  <div className="text-xs md:text-sm text-gray-600 tracking-wide">Piezas Creadas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="bg-gray-100 px-8 md:px-20 py-16 md:py-24 rounded-lg text-center space-y-8">
            <h2 className="text-3xl md:text-5xl tracking-tight font-bold">
              Crea Tu Espacio Ideal
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Agenda una consulta personalizada con nuestros diseñadores 
              y descubre cómo podemos transformar tu hogar.
            </p>
            <Link href="/products" className="inline-block bg-black text-white px-8 md:px-10 py-3 md:py-4 hover:opacity-90 transition-opacity tracking-wide text-sm md:text-base">
              Ver Productos
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-white border-t border-gray-200">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <span className="text-xl md:text-2xl font-bold">Davidsons Design</span>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-md">
                Muebles artesanales premium elaborados con pasión y 
                dedicación por maestros artesanos mexicanos desde 1998.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="tracking-wide font-bold text-sm md:text-base">Navegación</h3>
              <nav className="flex flex-col gap-3">
                <Link href="/products" className="text-sm md:text-base text-gray-600 hover:text-black transition-colors">
                  Productos
                </Link>
                <Link href="#about" className="text-sm md:text-base text-gray-600 hover:text-black transition-colors">
                  About
                </Link>
                <Link href="#contact" className="text-sm md:text-base text-gray-600 hover:text-black transition-colors">
                  Contact
                </Link>
              </nav>
            </div>

            <div className="space-y-4">
              <h3 className="tracking-wide font-bold text-sm md:text-base">Contacto</h3>
              <div className="flex flex-col gap-3 text-sm md:text-base text-gray-600">
                <a href="mailto:info@davidsonsdesign.com" className="hover:text-black transition-colors">
                  info@davidsonsdesign.com
                </a>
                <p>Ciudad de México, México</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs md:text-sm text-gray-600 text-center md:text-left">
              © 2026 Davidsons Design. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 md:gap-8 text-xs md:text-sm text-gray-600">
              <Link href="#" className="hover:text-black transition-colors">
                Política de Privacidad
              </Link>
              <Link href="#" className="hover:text-black transition-colors">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
