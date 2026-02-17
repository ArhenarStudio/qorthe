import React, { useState } from 'react';
import { FileText, Send, Loader2, ArrowRight } from 'lucide-react';
import { CustomerDetails, ProductItem } from './types';

interface QuoteExportActionsProps {
  items: ProductItem[];
  customer: CustomerDetails;
  onCustomerChange: (customer: CustomerDetails) => void;
}

export const QuoteExportActions: React.FC<QuoteExportActionsProps> = ({
  items,
  customer,
  onCustomerChange
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    onCustomerChange({ ...customer, [field]: value });
  };

  const handleWhatsApp = () => {
    if (!customer.name) {
        alert("Por favor ingresa tu nombre");
        return;
    }

    let message = `Hola DavidSon's Design, soy ${customer.name}. \n\nSolicito cotización para los siguientes productos:\n\n`;
    
    items.forEach((item, idx) => {
        message += `${idx + 1}. ${item.type} (x${item.quantity})\n`;
        message += `   - Madera: ${item.woods.join(', ')}\n`;
        message += `   - Medidas: ${item.dimensions.length}x${item.dimensions.width}x${item.dimensions.thickness}cm\n`;
        if (item.engraving.enabled) message += `   - Con grabado láser (${item.engraving.type})\n`;
        message += '\n';
    });

    message += `Total piezas: ${items.reduce((acc, i) => acc + i.quantity, 0)}\n\n`;
    message += `Quedo atento. Gracias.`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleGeneratePdf = () => {
    if (!customer.name || !customer.email) {
        alert("Nombre y correo son requeridos para el PDF");
        return;
    }
    setIsGeneratingPdf(true);
    // Simulate generation
    setTimeout(() => {
        setIsGeneratingPdf(false);
        alert("Cotización PDF generada exitosamente (Simulación)");
    }, 2000);
  };

  return (
    <div className="bg-sand-50 dark:bg-wood-900 rounded-xl p-8 border border-wood-200 dark:border-wood-800 mt-12">
      <h3 className="font-serif text-2xl mb-8 text-wood-900 dark:text-sand-100 border-b border-wood-200 dark:border-wood-700 pb-4">
          Datos de Contacto
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-wood-500">Nombre Completo *</label>
            <input 
              type="text" 
              value={customer.name} 
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-3 rounded-lg bg-white dark:bg-wood-950 border border-wood-200 dark:border-wood-700 focus:border-accent-gold outline-none"
            />
         </div>
         <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-wood-500">Empresa (Opcional)</label>
            <input 
              type="text" 
              value={customer.company || ''} 
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full p-3 rounded-lg bg-white dark:bg-wood-950 border border-wood-200 dark:border-wood-700 focus:border-accent-gold outline-none"
            />
         </div>
         <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-wood-500">Teléfono *</label>
            <input 
              type="tel" 
              value={customer.phone} 
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full p-3 rounded-lg bg-white dark:bg-wood-950 border border-wood-200 dark:border-wood-700 focus:border-accent-gold outline-none"
            />
         </div>
         <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-wood-500">Correo Electrónico *</label>
            <input 
              type="email" 
              value={customer.email} 
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-3 rounded-lg bg-white dark:bg-wood-950 border border-wood-200 dark:border-wood-700 focus:border-accent-gold outline-none"
            />
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-wood-200 dark:border-wood-700">
          <button 
             onClick={handleGeneratePdf}
             disabled={isGeneratingPdf || items.length === 0}
             className="flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border-2 border-wood-900 dark:border-sand-100 text-wood-900 dark:text-sand-100 font-bold uppercase tracking-wider hover:bg-wood-200 dark:hover:bg-wood-800 transition-colors disabled:opacity-50"
          >
             {isGeneratingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
             Generar PDF
          </button>
          
          <button 
             onClick={handleWhatsApp}
             disabled={items.length === 0}
             className="flex-1 flex items-center justify-center gap-3 p-4 rounded-lg bg-green-600 text-white font-bold uppercase tracking-wider hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50"
          >
             <Send className="w-5 h-5" />
             Cotizar en WhatsApp
          </button>
      </div>
    </div>
  );
};
