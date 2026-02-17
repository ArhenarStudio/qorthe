import React from 'react';

export const WoodFilter = () => {
  const options = [
    { name: "Parota", count: "(8)", color: "#4A3728", selected: true },
    { name: "Rosa Morada", count: "(5)", color: "#8B5E3C", selected: false },
    { name: "Cedro", count: "(6)", color: "#9E5B40", selected: false },
    { name: "Pino", count: "(4)", color: "#D4B996", selected: false },
    { name: "Nogal", count: "(3)", color: "#5C3D2E", selected: false },
  ];

  return (
    <div className="w-[280px] bg-transparent">
      {/* Título de Sección */}
      <h3 className="font-serif text-[18px] text-[#2d2419] mb-[4px]">
        Tipo de Madera
      </h3>
      <div className="w-full h-[1px] bg-[#2d2419] opacity-10 mb-[16px]"></div>

      {/* Lista de Opciones */}
      <div className="flex flex-col gap-[4px]">
        {options.map((option, index) => (
          <div 
            key={index}
            className={`flex items-center px-[8px] py-[8px] ${
              option.selected 
                ? 'bg-[#faf9f8] border-l-2 border-[#C5A065]' 
                : 'border-l-2 border-transparent'
            }`}
          >
            {/* Círculo de Color */}
            <div 
              className="w-[20px] h-[20px] rounded-full flex-shrink-0"
              style={{ backgroundColor: option.color }}
            ></div>

            {/* Nombre */}
            <span 
              className={`ml-[12px] font-sans text-[14px] ${
                option.selected 
                  ? 'font-bold text-[#2d2419]' 
                  : 'text-[#795548]'
              }`}
            >
              {option.name}
            </span>

            {/* Espacio Flexible */}
            <div className="flex-grow"></div>

            {/* Cantidad */}
            <span className="font-sans text-[13px] text-[#A1887F]">
              {option.count}
            </span>
          </div>
        ))}
      </div>

      {/* Toggle "Solo disponibles" */}
      <div className="mt-[24px] flex items-center">
        <span className="font-sans text-[14px] text-[#795548]">
          Solo disponibles
        </span>
        <div className="flex-grow"></div>
        {/* Toggle Switch (Estado OFF) */}
        <div className="w-[36px] h-[20px] bg-[#D7CCC8] rounded-full relative p-[2px]">
          <div className="w-[16px] h-[16px] bg-[#FFFFFF] rounded-full shadow-sm"></div>
        </div>
      </div>
    </div>
  );
};
