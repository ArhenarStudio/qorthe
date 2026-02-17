"use client";

import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';

export const OrderDetail = () => {
  const steps = [
    {
      status: 'completed',
      title: "Pedido Confirmado",
      date: "14 Feb 2026, 10:30 AM",
      desc: "Tu pedido ha sido recibido y confirmado."
    },
    {
      status: 'completed',
      title: "Pago Procesado",
      date: "14 Feb 2026, 10:31 AM",
      desc: "El pago se procesó exitosamente."
    },
    {
      status: 'active',
      title: "En Producción",
      date: "15 Feb 2026",
      desc: "Tu pieza está siendo elaborada por nuestros artesanos."
    },
    {
      status: 'pending',
      title: "Enviado",
      date: "",
      desc: ""
    },
    {
      status: 'pending',
      title: "Entregado",
      date: "",
      desc: ""
    }
  ];

  const products = [
    {
      name: "Tabla Parota Rústica",
      variant: "Parota / 45x25cm",
      qty: 1,
      price: "$2,450 MXN"
    },
    {
      name: "Set Cuchillos Artesanal",
      variant: "Acero / Mango Mixto",
      qty: 1,
      price: "$1,200 MXN"
    }
  ];

  return (
    <div className="w-full bg-transparent">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-[32px]">
        <button className="flex items-center gap-2 font-sans text-[13px] text-[#795548] hover:text-[#2d2419] transition-colors">
          <ArrowLeft size={16} />
          Volver a Pedidos
        </button>
        <span className="font-sans text-[14px] font-bold text-[#2d2419]">
          Pedido #DSD-4829
        </span>
      </div>

      {/* SUMMARY CARD */}
      <div className="bg-[#FFFFFF] border border-[#EFEBE9] p-[24px] mb-[40px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-0">
          <div>
            <p className="font-sans text-[10px] uppercase text-[#A1887F] mb-1">Fecha</p>
            <p className="font-sans text-[14px] font-bold text-[#2d2419]">14 Feb 2026</p>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase text-[#A1887F] mb-1">Estado</p>
            <div className="flex items-center gap-2">
              <span className="w-[8px] h-[8px] rounded-full bg-[#4CAF50]" />
              <p className="font-sans text-[14px] font-bold text-[#2d2419]">En Producción</p>
            </div>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase text-[#A1887F] mb-1">Total</p>
            <p className="font-sans text-[14px] font-bold text-[#2d2419]">$3,850 MXN</p>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase text-[#A1887F] mb-1">Método de Pago</p>
            <p className="font-sans text-[14px] font-bold text-[#2d2419]">Stripe •••• 4242</p>
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="mb-[40px]">
        <h2 className="font-serif text-[24px] text-[#2d2419] mb-[24px]">
          Seguimiento del Pedido
        </h2>
        
        <div className="flex flex-col">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            
            return (
              <div key={index} className="flex relative pb-8 last:pb-0">
                {/* Connecting Line */}
                {!isLast && (
                  <div 
                    className={`absolute left-[11px] top-[24px] bottom-0 w-[2px] ${
                      step.status === 'completed' ? 'bg-[#2d2419]' : 'bg-[#D7CCC8]'
                    }`} 
                  />
                )}

                {/* Circle Icon */}
                <div className="relative z-10 shrink-0 mr-[20px]">
                  {step.status === 'completed' && (
                    <div className="w-[24px] h-[24px] rounded-full bg-[#2d2419] flex items-center justify-center">
                      <Check size={14} color="#FFFFFF" />
                    </div>
                  )}
                  {step.status === 'active' && (
                    <div className="w-[24px] h-[24px] rounded-full bg-[#C5A065] flex items-center justify-center">
                      <div className="w-[8px] h-[8px] rounded-full bg-[#FFFFFF]" />
                    </div>
                  )}
                  {step.status === 'pending' && (
                    <div className="w-[24px] h-[24px] rounded-full bg-transparent border-[2px] border-[#D7CCC8]" />
                  )}
                </div>

                {/* Text Content */}
                <div className="pt-0.5">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-sans text-[14px] font-bold ${
                      step.status === 'pending' ? 'text-[#A1887F]' : 'text-[#2d2419]'
                    }`}>
                      {step.title}
                    </h3>
                    {step.date && (
                      <span className="font-sans text-[12px] text-[#A1887F]">
                        {step.date}
                      </span>
                    )}
                  </div>
                  {step.desc && (
                    <p className="font-sans text-[13px] text-[#795548]">
                      {step.desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PRODUCTS */}
      <div>
        <h2 className="font-serif text-[20px] text-[#2d2419] mb-[16px]">
          Artículos
        </h2>

        <div className="bg-[#FFFFFF] border border-[#EFEBE9] p-[20px]">
          {/* Product List */}
          <div className="flex flex-col gap-[20px]">
            {products.map((product, index) => (
              <div key={index}>
                <div className="flex items-start">
                  <div className="w-[72px] h-[72px] bg-[#D7CCC8] shrink-0 mr-[16px]" />
                  <div className="flex-1">
                    <h4 className="font-sans text-[14px] font-bold text-[#2d2419]">
                      {product.name}
                    </h4>
                    <p className="font-sans text-[13px] text-[#795548]">
                      {product.variant}
                    </p>
                    <p className="font-sans text-[13px] text-[#A1887F] mt-1">
                      Cant: {product.qty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[14px] font-bold text-[#2d2419]">
                      {product.price}
                    </p>
                  </div>
                </div>
                {/* Separator between products */}
                {index < products.length - 1 && (
                  <div className="h-[1px] bg-[#EFEBE9] mt-[20px]" />
                )}
              </div>
            ))}
          </div>

          {/* Totals Section */}
          <div className="mt-[20px] pt-[16px] border-t border-[#EFEBE9]">
            <div className="flex justify-between items-center mb-2">
              <span className="font-sans text-[13px] text-[#795548]">Subtotal</span>
              <span className="font-sans text-[13px] text-[#2d2419]">$3,650 MXN</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-sans text-[13px] text-[#795548]">Envío</span>
              <span className="font-sans text-[13px] text-[#2d2419]">$200 MXN</span>
            </div>
            
            <div className="h-[1px] bg-[#EFEBE9] mb-4" />
            
            <div className="flex justify-between items-center">
              <span className="font-sans text-[15px] font-bold text-[#2d2419]">Total</span>
              <span className="font-sans text-[15px] font-bold text-[#2d2419]">$3,850 MXN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
