"use client";

import React from 'react';
import { Package, MapPin, Star, Clipboard, PenTool } from 'lucide-react';

// Reusable internal component to ensure strict consistency
const EmptyStateBase = ({ 
  icon: Icon, 
  title, 
  description, 
  buttonText 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  buttonText: string 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-[80px]">
      <Icon 
        size={48} 
        color="#D7CCC8" 
        strokeWidth={1.5} 
      />
      
      <h3 className="font-serif text-[22px] text-[#2d2419] mt-[20px]">
        {title}
      </h3>
      
      <p className="font-sans text-[14px] text-[#8D6E63] max-w-[400px] text-center leading-[1.6] mt-[10px]">
        {description}
      </p>
      
      <button className="bg-[#2d2419] text-[#f5f0e8] font-sans text-[13px] uppercase tracking-[2px] px-[24px] py-[14px] mt-[28px] hover:bg-opacity-90 transition-opacity">
        {buttonText}
      </button>
    </div>
  );
};

export const EmptyOrders = () => (
  <EmptyStateBase 
    icon={Package}
    title="Aún no tienes pedidos"
    description="Cuando realices tu primera compra, aquí podrás ver el historial y seguimiento de todos tus pedidos."
    buttonText="Explorar Colección"
  />
);

export const EmptyAddresses = () => (
  <EmptyStateBase 
    icon={MapPin}
    title="Sin direcciones guardadas"
    description="Agrega una dirección de envío para agilizar tus próximas compras."
    buttonText="Agregar Dirección"
  />
);

export const EmptyReviews = () => (
  <EmptyStateBase 
    icon={Star}
    title="No has escrito reseñas"
    description="Comparte tu experiencia con otros clientes. Tus opiniones nos ayudan a mejorar."
    buttonText="Ver Mis Compras"
  />
);

export const EmptyQuotations = () => (
  <EmptyStateBase 
    icon={Clipboard}
    title="Sin cotizaciones activas"
    description="Solicita una cotización personalizada para piezas a medida o pedidos especiales."
    buttonText="Crear Cotización"
  />
);

export const EmptyDesigns = () => (
  <EmptyStateBase 
    icon={PenTool}
    title="Sin diseños guardados"
    description="Cuando personalices una pieza con nuestro editor, tus diseños se guardarán aquí."
    buttonText="Ir al Personalizador"
  />
);
