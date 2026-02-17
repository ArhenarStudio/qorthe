export type ProductType = 
  | 'Tabla de decoración'
  | 'Tabla de picar'
  | 'Tabla de charcutería'
  | 'Plato decorativo'
  | 'Caja personalizada'
  | 'Servicio de Grabado'
  | 'Otro';

export type WoodType = 
  | 'Cedro'
  | 'Nogal'
  | 'Encino'
  | 'Parota'
  | 'Combinación';

export type UsageType = 
  | 'Decorativo'
  | 'Funcional (cocina)'
  | 'Evento / regalo corporativo'
  | 'Restaurante / volumen alto';

export interface EngravingConfig {
  enabled: boolean;
  type: 'Texto' | 'Logotipo' | 'Imagen personalizada' | 'Combinación';
  zones: string[];
  customText?: string;
  complexity: 'Básico' | 'Intermedio' | 'Detallado';
  file?: File | null; // In a real app, this would be handled differently
}

export interface ProductItem {
  id: string;
  type: ProductType;
  customType?: string;
  woods: WoodType[];
  primaryWood?: WoodType;
  secondaryWood?: WoodType;
  woodProportion?: number; // 0-100
  dimensions: {
    length: number;
    width: number;
    thickness: number;
  };
  quantity: number;
  usage: UsageType;
  engraving: EngravingConfig;
  materialToEngrave?: string; // For 'Servicio de Grabado'
}

export interface CustomerDetails {
  name: string;
  company?: string;
  phone: string;
  email: string;
}
