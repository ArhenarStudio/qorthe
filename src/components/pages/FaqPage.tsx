import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, HelpCircle, ShieldCheck, Truck, CreditCard, RefreshCw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const FaqPage = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories = [
    { id: 'all', label: 'Todo' },
    { id: 'shipping', label: 'Envíos', icon: Truck },
    { id: 'products', label: 'Productos', icon: ShieldCheck },
    { id: 'returns', label: 'Devoluciones', icon: RefreshCw },
    { id: 'payment', label: 'Pagos', icon: CreditCard },
  ];

  const faqData = [
    {
      id: 'ship-1',
      category: 'shipping',
      question: '¿Realizan envíos internacionales?',
      answer: 'Sí, realizamos envíos a todo el mundo. Trabajamos con DHL Express para garantizar que tu pedido llegue en perfectas condiciones y en el menor tiempo posible. Los tiempos de tránsito habituales son de 3-5 días hábiles para Europa y Norteamérica.'
    },
    {
      id: 'ship-2',
      category: 'shipping',
      question: '¿Cuál es el costo de envío?',
      answer: 'El envío es gratuito para pedidos superiores a 300€. Para pedidos inferiores, el costo se calcula automáticamente en el checkout basándose en el peso, dimensiones del paquete y destino final.'
    },
    {
      id: 'prod-1',
      category: 'products',
      question: '¿Cómo debo cuidar mi tabla de madera?',
      answer: 'Recomendamos lavar la tabla a mano con agua tibia y jabón suave inmediatamente después de su uso. Sécala verticalmente. Una vez al mes, aplica nuestra Cera de Abeja Premium para mantener la hidratación y protección de la madera. Nunca la laves en el lavavajillas.'
    },
    {
      id: 'prod-2',
      category: 'products',
      question: '¿Puedo personalizar mi pedido?',
      answer: 'Absolutamente. Ofrecemos servicio de grabado láser gratuito en todas nuestras piezas. Puedes añadir iniciales, fechas o logotipos corporativos. Para proyectos a medida o dimensiones específicas, por favor contáctanos directamente.'
    },
    {
      id: 'ret-1',
      category: 'returns',
      question: '¿Cuál es la política de devoluciones?',
      answer: 'Aceptamos devoluciones dentro de los 30 días posteriores a la recepción, siempre que el producto esté sin usar y en su embalaje original. Los productos personalizados no admiten devolución a menos que presenten defectos de fabricación.'
    },
    {
      id: 'pay-1',
      category: 'payment',
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos todas las tarjetas de crédito principales (Visa, Mastercard, Amex), PayPal, Apple Pay y Google Pay. También ofrecemos financiamiento a través de Klarna para pagos en plazos.'
    },
    {
      id: 'prod-3',
      category: 'products',
      question: '¿La madera utilizada es sostenible?',
      answer: 'Sí, toda nuestra madera proviene de bosques gestionados de forma sostenible con certificación FSC. Priorizamos el uso de nogal, roble y olivo de proveedores locales que comparten nuestro compromiso con el medio ambiente.'
    }
  ];

  const filteredFaqs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-sand-100 dark:bg-black min-h-screen text-wood-900 dark:text-sand-100 pt-24 pb-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-wood-900/5 dark:bg-sand-100/10 rounded-full mb-4"
          >
            <HelpCircle className="w-4 h-4 text-wood-500 dark:text-sand-400" />
            <span className="text-xs font-bold tracking-widest uppercase text-wood-600 dark:text-sand-300">Centro de Ayuda</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-wood-900 dark:text-sand-100"
          >
            Preguntas Frecuentes
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-wood-600 dark:text-sand-400 max-w-2xl mx-auto font-light text-lg"
          >
            Resolvemos tus dudas sobre nuestros productos, envíos y cuidados para que tu experiencia sea impecable.
          </motion.p>
        </div>

        {/* Search & Filter */}
        <div className="mb-12 space-y-8">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-wood-400 dark:text-sand-500 group-focus-within:text-wood-900 dark:group-focus-within:text-sand-100 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar en preguntas frecuentes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-wood-900 border border-wood-200 dark:border-wood-800 rounded-xl text-wood-900 dark:text-sand-100 placeholder:text-wood-400 dark:placeholder:text-wood-600 focus:outline-none focus:ring-2 focus:ring-wood-900/10 dark:focus:ring-sand-100/10 transition-all shadow-sm"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${
                    isActive 
                      ? 'bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 border-wood-900 dark:border-sand-100' 
                      : 'bg-transparent text-wood-600 dark:text-sand-400 border-wood-200 dark:border-wood-800 hover:border-wood-400 dark:hover:border-wood-600'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Grid */}
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence mode='popLayout'>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white dark:bg-wood-900 rounded-xl border border-wood-100 dark:border-wood-800 overflow-hidden group hover:border-wood-300 dark:hover:border-wood-700 transition-colors"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-5 flex items-start justify-between text-left"
                  >
                    <span className="font-serif text-lg text-wood-900 dark:text-sand-100 pr-8 group-hover:text-accent-gold transition-colors">
                      {item.question}
                    </span>
                    <span className={`shrink-0 p-1 rounded-full border border-wood-200 dark:border-wood-700 transition-transform duration-300 ${openItems[item.id] ? 'rotate-180 bg-wood-50 dark:bg-wood-800' : ''}`}>
                      <ChevronDown className="w-4 h-4 text-wood-500" />
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {openItems[item.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                      >
                        <div className="px-6 pb-6 pt-0">
                          <p className="text-wood-600 dark:text-sand-300 font-light leading-relaxed border-t border-wood-100 dark:border-wood-800 pt-4">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-wood-500 dark:text-sand-500 font-light">
                  No encontramos resultados para tu búsqueda.
                </p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-sm text-accent-gold hover:underline"
                >
                  Limpiar búsqueda
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contact Footer */}
        <div className="mt-20 text-center border-t border-wood-200 dark:border-wood-800 pt-12">
          <p className="text-wood-900 dark:text-sand-100 font-medium mb-4">¿No encuentras lo que buscas?</p>
          <a 
            href="/contact" 
            className="inline-block px-8 py-3 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 text-xs font-bold tracking-widest uppercase rounded hover:bg-wood-800 dark:hover:bg-sand-200 transition-colors"
          >
            Contactar Soporte
          </a>
        </div>

      </div>
    </div>
  );
};
