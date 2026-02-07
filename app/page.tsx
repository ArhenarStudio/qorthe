'use client';

import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import Link from 'next/link';

const translations = {
  es: {
    nav: {
      products: 'Productos',
      about: 'About',
      contact: 'Contact'
    },
    hero: {
      title: ['Muebles', 'Artesanales', 'Premium'],
      description: 'Cada pieza es elaborada a mano por artesanos mexicanos, combinando técnicas tradicionales con diseño contemporáneo para crear muebles únicos y atemporales.',
      cta: 'Explorar Colección'
    },
    collections: {
      title: 'Nuestras Colecciones',
      subtitle: 'Descubre piezas únicas diseñadas para transformar tu espacio',
      chairs: {
        title: 'Sillas & Sillones',
        description: 'Diseños ergonómicos con carácter artesanal',
        cta: 'Ver Colección'
      },
      tables: {
        title: 'Mesas de Comedor',
        description: 'El centro de reunión de tu hogar',
        cta: 'Ver Colección'
      },
      bedrooms: {
        title: 'Recámaras',
        description: 'Espacios de descanso con elegancia',
        cta: 'Ver Colección'
      }
    },
    process: {
      title: ['Artesanía', 'Mexicana', 'Auténtica'],
      paragraph1: 'Cada mueble de Davidsons Design nace de la pasión y dedicación de maestros artesanos mexicanos que han perfeccionado su oficio a lo largo de generaciones.',
      paragraph2: 'Seleccionamos cuidadosamente maderas nobles y materiales sostenibles, transformándolos en piezas únicas que cuentan una historia y perduran en el tiempo.',
      paragraph3: 'Nuestro compromiso es preservar las técnicas tradicionales mientras exploramos nuevas formas de diseño contemporáneo.',
      stats: {
        years: 'Años de Experiencia',
        handmade: 'Hecho a Mano',
        pieces: 'Piezas Creadas'
      }
    },
    testimonials: {
      title: 'Lo Que Dicen Nuestros Clientes',
      testimonial1: {
        text: 'La calidad y atención al detalle son excepcionales. Cada pieza es verdaderamente una obra de arte que transforma nuestro hogar.',
        name: 'María Fernández',
        location: 'Ciudad de México'
      },
      testimonial2: {
        text: 'Invertir en muebles Davidsons fue la mejor decisión. Son piezas atemporales que valoraremos por generaciones.',
        name: 'Carlos Jiménez',
        location: 'Monterrey'
      },
      testimonial3: {
        text: 'El servicio personalizado y la artesanía son incomparables. Cada detalle refleja pasión y dedicación.',
        name: 'Ana Martínez',
        location: 'Guadalajara'
      }
    },
    cta: {
      title: 'Crea Tu Espacio Ideal',
      description: 'Agenda una consulta personalizada con nuestros diseñadores y descubre cómo podemos transformar tu hogar.',
      button: 'Agendar Consulta'
    },
    footer: {
      description: 'Muebles artesanales premium elaborados con pasión y dedicación por maestros artesanos mexicanos desde 1998.',
      navigation: 'Navegación',
      catalog: 'Catálogo',
      contactTitle: 'Contacto',
      location: 'Hermosillo, Sonora.',
      copyright: '© 2026 Davidsons Design. Todos los derechos reservados.',
      privacy: 'Política de Privacidad',
      terms: 'Términos y Condiciones'
    }
  },
  en: {
    nav: {
      products: 'Products',
      about: 'About',
      contact: 'Contact'
    },
    hero: {
      title: ['Premium', 'Handcrafted', 'Furniture'],
      description: 'Each piece is handcrafted by Mexican artisans, combining traditional techniques with contemporary design to create unique and timeless furniture.',
      cta: 'Explore Collection'
    },
    collections: {
      title: 'Our Collections',
      subtitle: 'Discover unique pieces designed to transform your space',
      chairs: {
        title: 'Chairs & Armchairs',
        description: 'Ergonomic designs with artisan character',
        cta: 'View Collection'
      },
      tables: {
        title: 'Dining Tables',
        description: 'The gathering center of your home',
        cta: 'View Collection'
      },
      bedrooms: {
        title: 'Bedrooms',
        description: 'Rest spaces with elegance',
        cta: 'View Collection'
      }
    },
    process: {
      title: ['Authentic', 'Mexican', 'Craftsmanship'],
      paragraph1: 'Every piece of Davidsons Design furniture is born from the passion and dedication of Mexican master artisans who have perfected their craft over generations.',
      paragraph2: 'We carefully select noble woods and sustainable materials, transforming them into unique pieces that tell a story and endure over time.',
      paragraph3: 'Our commitment is to preserve traditional techniques while exploring new forms of contemporary design.',
      stats: {
        years: 'Years of Experience',
        handmade: 'Handmade',
        pieces: 'Pieces Created'
      }
    },
    testimonials: {
      title: 'What Our Customers Say',
      testimonial1: {
        text: 'The quality and attention to detail are exceptional. Each piece is truly a work of art that transforms our home.',
        name: 'María Fernández',
        location: 'Mexico City'
      },
      testimonial2: {
        text: 'Investing in Davidsons furniture was the best decision. They are timeless pieces that we will value for generations.',
        name: 'Carlos Jiménez',
        location: 'Monterrey'
      },
      testimonial3: {
        text: 'The personalized service and craftsmanship are incomparable. Every detail reflects passion and dedication.',
        name: 'Ana Martínez',
        location: 'Guadalajara'
      }
    },
    cta: {
      title: 'Create Your Ideal Space',
      description: 'Schedule a personalized consultation with our designers and discover how we can transform your home.',
      button: 'Schedule Consultation'
    },
    footer: {
      description: 'Premium handcrafted furniture made with passion and dedication by Mexican master artisans since 1998.',
      navigation: 'Navigation',
      catalog: 'Catalog',
      contactTitle: 'Contact',
      location: 'Hermosillo, Sonora.',
      copyright: '© 2026 Davidsons Design. All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms and Conditions'
    }
  }
};

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Principal */}
      <header className={`fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-50 border-b border-border transition-all duration-300 ${isScrolled ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100'}`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-lg md:text-xl lg:text-2xl tracking-tight hover:opacity-90 transition-opacity">
              <span className="font-bold">DavidSon´s</span> <span className="font-normal">Design</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-12">
            <Link href="/products" className="text-foreground/70 hover:text-foreground transition-colors tracking-wide">
              {t.nav.products}
            </Link>
            <a href="#about" className="text-foreground/70 hover:text-foreground transition-colors tracking-wide">
              {t.nav.about}
            </a>
            <a href="#contact" className="text-foreground/70 hover:text-foreground transition-colors tracking-wide">
              {t.nav.contact}
            </a>
            
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors tracking-wide"
              aria-label="Change language"
            >
              <Globe className="w-5 h-5" />
              <span className="uppercase text-sm font-medium">{language === 'es' ? 'EN' : 'ES'}</span>
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden relative w-8 h-8 flex items-center justify-center group"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-5 flex flex-col justify-center items-center">
              <span className={`absolute w-6 h-0.5 bg-foreground/70 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}`}></span>
              <span className={`absolute w-6 h-0.5 bg-foreground/70 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}></span>
              <span className={`absolute w-6 h-0.5 bg-foreground/70 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}`}></span>
            </div>
          </button>
        </div>
      </header>

      {/* Header Simplificado (Scroll) - Desktop only */}
      <div className={`hidden lg:block fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-8 py-3 shadow-lg">
          <nav className="flex items-center gap-8">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity tracking-tight">
              <span className="font-bold">DavidSon´s</span> <span className="font-normal ml-1">Design</span>
            </Link>
            <Link href="/products" className="text-foreground/70 hover:text-foreground transition-colors text-sm tracking-wide">
              {t.nav.products}
            </Link>
            <a href="#about" className="text-foreground/70 hover:text-foreground transition-colors text-sm tracking-wide">
              {t.nav.about}
            </a>
            <a href="#contact" className="text-foreground/70 hover:text-foreground transition-colors text-sm tracking-wide">
              {t.nav.contact}
            </a>
            
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Change language"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase text-xs font-medium">{language === 'es' ? 'EN' : 'ES'}</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Header Sticky Mobile - Solo para móviles */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-background/95 backdrop-blur-md border-b border-border shadow-lg">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-base md:text-lg tracking-tight">
                <span className="font-bold">DavidSon´s</span> <span className="font-normal">Design</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 text-foreground/70 hover:text-foreground transition-colors"
                aria-label="Change language"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase text-xs font-medium">{language === 'es' ? 'EN' : 'ES'}</span>
              </button>
              
              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="relative w-7 h-7 flex items-center justify-center"
                aria-label="Toggle menu"
              >
                <div className="relative w-5 h-4 flex flex-col justify-center items-center">
                  <span className={`absolute w-5 h-0.5 bg-foreground/70 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'}`}></span>
                  <span className={`absolute w-5 h-0.5 bg-foreground/70 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}></span>
                  <span className={`absolute w-5 h-0.5 bg-foreground/70 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop con blur */}
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
          onClick={toggleMobileMenu}
        ></div>
        
        {/* Menu Panel deslizante desde la derecha */}
        <div 
          className={`absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-background border-l border-border shadow-2xl transition-transform duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="px-6 md:px-8 py-6 flex items-center justify-between border-b border-border">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" onClick={toggleMobileMenu} className="text-lg md:text-xl tracking-tight hover:opacity-90 transition-opacity">
                <span className="font-bold">DavidSon´s</span> <span className="font-normal">Design</span>
              </Link>
            </div>
            
            {/* Close Button animado */}
            <button
              onClick={toggleMobileMenu}
              className="relative w-8 h-8 flex items-center justify-center group"
              aria-label="Close menu"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <span className="absolute w-6 h-0.5 bg-foreground/70 rotate-45 transition-all duration-300 group-hover:bg-foreground"></span>
                <span className="absolute w-6 h-0.5 bg-foreground/70 -rotate-45 transition-all duration-300 group-hover:bg-foreground"></span>
              </div>
            </button>
          </div>
          
          {/* Mobile Navigation con animación stagger */}
          <nav className="flex flex-col px-6 md:px-8 pt-12 space-y-2">
            <Link 
              href="/products" 
              className={`text-3xl text-foreground/70 hover:text-foreground transition-all duration-300 py-4 border-b border-border/50 tracking-wide ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
              style={{ transitionDelay: isMobileMenuOpen ? '100ms' : '0ms' }}
              onClick={toggleMobileMenu}
            >
              {t.nav.products}
            </Link>
            <a 
              href="#about" 
              className={`text-3xl text-foreground/70 hover:text-foreground transition-all duration-300 py-4 border-b border-border/50 tracking-wide ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
              style={{ transitionDelay: isMobileMenuOpen ? '200ms' : '0ms' }}
              onClick={toggleMobileMenu}
            >
              {t.nav.about}
            </a>
            <a 
              href="#contact" 
              className={`text-3xl text-foreground/70 hover:text-foreground transition-all duration-300 py-4 border-b border-border/50 tracking-wide ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
              style={{ transitionDelay: isMobileMenuOpen ? '300ms' : '0ms' }}
              onClick={toggleMobileMenu}
            >
              {t.nav.contact}
            </a>
            
            {/* Language Toggle con animación */}
            <button 
              onClick={toggleLanguage}
              className={`flex items-center gap-3 text-2xl text-foreground/70 hover:text-foreground transition-all duration-300 py-6 mt-8 tracking-wide ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
              style={{ transitionDelay: isMobileMenuOpen ? '400ms' : '0ms' }}
              aria-label="Change language"
            >
              <div className="w-12 h-12 rounded-full border-2 border-foreground/20 flex items-center justify-center hover:border-foreground/40 transition-colors">
                <Globe className="w-6 h-6" />
              </div>
              <span className="uppercase font-medium">{language === 'es' ? 'English' : 'Español'}</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-20 md:pt-24 lg:pt-32 pb-12 md:pb-16 lg:pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8 text-center lg:text-left">
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
                  {t.hero.title.map(line => <span key={line}>{line}<br /></span>)}
                </h2>
                <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
                  {t.hero.description}
                </p>
              </div>
              
              <Link href="/products" className="inline-block bg-primary text-primary-foreground px-8 md:px-10 py-3 md:py-4 hover:opacity-90 transition-opacity tracking-wide">
                {t.hero.cta}
              </Link>
            </div>

            {/* Right Image */}
            <div className="relative order-first lg:order-last">
              <div className="aspect-[3/4] overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1687180498602-5a1046defaa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Muebles artesanales premium"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative element */}
              <div className="hidden lg:block absolute -bottom-8 -left-8 w-64 h-64 bg-accent/10 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Colecciones Destacadas */}
      <section id="productos" className="py-12 md:py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="text-center mb-10 md:mb-12 lg:mb-16 space-y-3 md:space-y-4">
            <h3 className="text-3xl md:text-4xl lg:text-5xl tracking-tight">{t.collections.title}</h3>
            <p className="text-base md:text-lg lg:text-xl opacity-80 max-w-2xl mx-auto">
              {t.collections.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Colección 1 */}
            <Link href="/products" className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden mb-4 md:mb-6">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1675528030415-dc82908eeb73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Sillas artesanales"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h4 className="text-xl md:text-2xl mb-2">{t.collections.chairs.title}</h4>
              <p className="opacity-70 mb-3 md:mb-4 text-sm md:text-base">{t.collections.chairs.description}</p>
              <span className="text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity border-b border-current pb-1">
                {t.collections.chairs.cta}
              </span>
            </Link>

            {/* Colección 2 */}
            <Link href="/products" className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden mb-4 md:mb-6">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758977403438-1b8546560d31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Mesas de comedor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h4 className="text-xl md:text-2xl mb-2">{t.collections.tables.title}</h4>
              <p className="opacity-70 mb-3 md:mb-4 text-sm md:text-base">{t.collections.tables.description}</p>
              <span className="text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity border-b border-current pb-1">
                {t.collections.tables.cta}
              </span>
            </Link>

            {/* Colección 3 */}
            <Link href="/products" className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden mb-4 md:mb-6">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1680503146476-abb8c752e1f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Recámaras"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h4 className="text-xl md:text-2xl mb-2">{t.collections.bedrooms.title}</h4>
              <p className="opacity-70 mb-3 md:mb-4 text-sm md:text-base">{t.collections.bedrooms.description}</p>
              <span className="text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity border-b border-current pb-1">
                {t.collections.bedrooms.cta}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Proceso Artesanal */}
      <section id="about" className="py-12 md:py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-square overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1759523069474-3c45494a6679?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Proceso artesanal"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden lg:block absolute -top-8 -right-8 w-64 h-64 bg-secondary/20 -z-10"></div>
            </div>

            {/* Content */}
            <div className="space-y-6 md:space-y-8">
              <h3 className="text-3xl md:text-4xl lg:text-5xl tracking-tight leading-tight">
                {t.process.title.map(line => <span key={line}>{line}<br /></span>)}
              </h3>
              <div className="space-y-4 md:space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
                <p>
                  {t.process.paragraph1}
                </p>
                <p>
                  {t.process.paragraph2}
                </p>
                <p>
                  {t.process.paragraph3}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8 pt-6 md:pt-8">
                <div>
                  <div className="text-2xl md:text-3xl lg:text-4xl mb-2">25+</div>
                  <div className="text-xs md:text-sm text-muted-foreground tracking-wide">{t.process.stats.years}</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl lg:text-4xl mb-2">100%</div>
                  <div className="text-xs md:text-sm text-muted-foreground tracking-wide">{t.process.stats.handmade}</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl lg:text-4xl mb-2">500+</div>
                  <div className="text-xs md:text-sm text-muted-foreground tracking-wide">{t.process.stats.pieces}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-12 md:py-16 lg:py-24 bg-muted/30">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="text-center mb-10 md:mb-12 lg:mb-16 space-y-3 md:space-y-4">
            <h3 className="text-3xl md:text-4xl lg:text-5xl tracking-tight">{t.testimonials.title}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-background p-6 md:p-8 lg:p-10 space-y-4 md:space-y-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 md:w-5 md:h-5 fill-accent" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {t.testimonials.testimonial1.text}
              </p>
              <div className="pt-4 border-t border-border">
                <div className="tracking-wide text-sm md:text-base">{t.testimonials.testimonial1.name}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{t.testimonials.testimonial1.location}</div>
              </div>
            </div>

            <div className="bg-background p-6 md:p-8 lg:p-10 space-y-4 md:space-y-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 md:w-5 md:h-5 fill-accent" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {t.testimonials.testimonial2.text}
              </p>
              <div className="pt-4 border-t border-border">
                <div className="tracking-wide text-sm md:text-base">{t.testimonials.testimonial2.name}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{t.testimonials.testimonial2.location}</div>
              </div>
            </div>

            <div className="bg-background p-6 md:p-8 lg:p-10 space-y-4 md:space-y-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 md:w-5 md:h-5 fill-accent" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {t.testimonials.testimonial3.text}
              </p>
              <div className="pt-4 border-t border-border">
                <div className="tracking-wide text-sm md:text-base">{t.testimonials.testimonial3.name}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{t.testimonials.testimonial3.location}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 md:py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="bg-accent text-accent-foreground px-6 md:px-12 lg:px-20 py-12 md:py-16 lg:py-24 text-center space-y-6 md:space-y-8">
            <h3 className="text-3xl md:text-4xl lg:text-5xl tracking-tight">
              {t.cta.title}
            </h3>
            <p className="text-base md:text-lg lg:text-xl opacity-90 max-w-2xl mx-auto">
              {t.cta.description}
            </p>
            <Link href="/products" className="inline-block bg-primary text-primary-foreground px-8 md:px-10 py-3 md:py-4 hover:opacity-90 transition-opacity tracking-wide">
              {t.cta.button}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-background border-t border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-10 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 mb-8 md:mb-10 lg:mb-12">
            {/* Logo & Descripción */}
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              <h4 className="text-xl md:text-2xl tracking-tight">
                <span className="font-bold">DavidSon´s</span> <span className="font-normal">Design</span>
              </h4>
              <p className="text-muted-foreground leading-relaxed max-w-md text-sm md:text-base">
                {t.footer.description}
              </p>
            </div>

            {/* Navegación */}
            <div className="space-y-3 md:space-y-4">
              <h5 className="tracking-wide text-sm md:text-base">{t.footer.navigation}</h5>
              <nav className="flex flex-col gap-2 md:gap-3">
                <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base">
                  {t.nav.products}
                </Link>
                <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base">
                  {t.nav.about}
                </a>
                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base">
                  {t.nav.contact}
                </a>
                <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base">
                  {t.footer.catalog}
                </Link>
              </nav>
            </div>

            {/* Contacto */}
            <div className="space-y-3 md:space-y-4">
              <h5 className="tracking-wide text-sm md:text-base">{t.footer.contactTitle}</h5>
              <div className="flex flex-col gap-2 md:gap-3 text-muted-foreground text-sm md:text-base">
                <a href="mailto:soporte@davidsonsdesign.com" className="hover:text-foreground transition-colors">
                  soporte@davidsonsdesign.com
                </a>
                <p>{t.footer.location}</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 md:pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
              {t.footer.copyright}
            </p>
            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="flex gap-6 md:gap-8 text-xs md:text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">
                  {t.footer.privacy}
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  {t.footer.terms}
                </a>
              </div>
              <p className="text-xs text-muted-foreground/60">
                Powered by RockStage
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
