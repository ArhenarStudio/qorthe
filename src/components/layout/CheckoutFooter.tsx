import React from 'react';

const mercadoPagoLogo = '/images/mercado-pago-logo.png';
const paypalLogo = '/images/paypal-logo.png';
const stripeLogo = '/images/stripe-logo.png';

export const CheckoutFooter = () => {
  return (
    <footer className="mt-12 pt-8 pb-12 border-t border-wood-100 bg-sand-50/50">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
        
        <div className="flex flex-wrap justify-center items-center gap-4 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="h-10 w-16 p-1 flex items-center justify-center bg-white rounded-md border border-wood-100 shadow-sm" title="Mercado Pago">
             <img src={mercadoPagoLogo} alt="Mercado Pago" className="h-full w-auto object-contain" />
           </div>

           <div className="h-10 w-16 p-2 flex items-center justify-center bg-white rounded-md border border-wood-100 shadow-sm" title="Stripe">
             <img src={stripeLogo} alt="Stripe" className="h-full w-auto object-contain" />
           </div>

           <div className="h-10 w-16 p-2 flex items-center justify-center bg-white rounded-md border border-wood-100 shadow-sm" title="PayPal">
             <img src={paypalLogo} alt="PayPal" className="h-full w-auto object-contain" />
           </div>
        </div>

        <div className="flex flex-col gap-3 text-[10px] text-wood-400 font-medium">
           <p>© {new Date().getFullYear()} DavidSon&apos;s Design. Todos los derechos reservados.</p>
           <div className="flex justify-center gap-4 text-wood-500">
             <a href="/privacy-policy" className="hover:text-wood-800 transition-colors">Privacidad</a>
             <span className="text-wood-200">|</span>
             <a href="/terms" className="hover:text-wood-800 transition-colors">Términos</a>
             <span className="text-wood-200">|</span>
             <a href="/shipping-policy" className="hover:text-wood-800 transition-colors">Envíos</a>
           </div>
        </div>
      </div>
    </footer>
  );
};
