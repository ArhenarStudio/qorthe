
export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: 'Tablas de Quesos' | 'Accesorios' | 'Servicio' | 'Regalos';
  description: string;
  material: string;
  dimensions: string;
  images: string[];
  inStock: boolean;
  isNew?: boolean;
  rating?: number;
  reviews?: number;
}

export const products: Product[] = [
  {
    id: '1',
    slug: 'tabla-parota-rustica',
    name: 'Tabla Parota Rústica',
    price: 2450,
    category: 'Tablas de Quesos',
    description: 'Pieza única de Parota con bordes vivos. Ideal para presentaciones impactantes de quesos y carnes frías. Cada tabla es seleccionada a mano por su veta distintiva.',
    material: 'Parota (Guanacaste)',
    dimensions: '45cm x 25cm x 2.5cm',
    images: [
      'https://images.unsplash.com/photo-1621868315576-90f772719277?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1626202029524-7667812f82c4?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599309600989-166f4e158652?q=80&w=1000&auto=format&fit=crop'
    ],
    inStock: true,
    isNew: true,
    rating: 4.8,
    reviews: 24
  },
  {
    id: '2',
    slug: 'set-degustacion-cedro',
    name: 'Set Degustación Cedro',
    price: 1800,
    category: 'Servicio',
    description: 'Conjunto de 3 tablas pequeñas diseñadas para catas individuales o servicios de tapas. El cedro aporta un aroma sutil que complementa la experiencia.',
    material: 'Cedro Rojo',
    dimensions: '20cm x 15cm (cada una)',
    images: [
      'https://images.unsplash.com/photo-1615486979927-142f1559c36d?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598511726623-d219f3900729?q=80&w=1000&auto=format&fit=crop'
    ],
    inStock: true,
    rating: 4.5,
    reviews: 12
  },
  {
    id: '3',
    slug: 'tabla-pino-redonda',
    name: 'Tabla Redonda Pino',
    price: 950,
    category: 'Tablas de Quesos',
    description: 'Clásica forma circular perfecta para pizzas o centros de mesa informales. Acabado con cera de abeja orgánica.',
    material: 'Pino Chileno',
    dimensions: '35cm diámetro',
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000&auto=format&fit=crop'
    ],
    inStock: true,
    rating: 4.2,
    reviews: 8
  },
  {
    id: '4',
    slug: 'cuchillos-queso-artesanal',
    name: 'Set Cuchillos Queso Artesanal',
    price: 1200,
    category: 'Accesorios',
    description: 'Juego de 4 cuchillos con mangos de madera exótica y hojas de acero inoxidable. El complemento perfecto para cualquier tabla.',
    material: 'Acero Inox / Mango Mixto',
    dimensions: 'Varias medidas',
    images: [
      'https://images.unsplash.com/photo-1588612507340-a15d7e562145?q=80&w=1000&auto=format&fit=crop'
    ],
    inStock: true,
    isNew: true
  },
  {
    id: '5',
    slug: 'tabla-nogal-premium',
    name: 'Tabla Nogal Premium',
    price: 3200,
    category: 'Regalos',
    description: 'Nuestra tabla más exclusiva. Nogal negro americano con incrustaciones de resina epóxica sutil. Una obra de arte funcional.',
    material: 'Nogal Negro',
    dimensions: '50cm x 30cm',
    images: [
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=1000&auto=format&fit=crop'
    ],
    inStock: false,
    rating: 5.0,
    reviews: 5
  },
  {
    id: '6',
    slug: 'posavasos-madera',
    name: 'Set Posavasos Geométricos',
    price: 450,
    category: 'Accesorios',
    description: 'Set de 6 posavasos hexagonales. Protege tus superficies con estilo moderno.',
    material: 'Madera de Teca',
    dimensions: '10cm diámetro',
    images: [
      'https://images.unsplash.com/photo-1605342417756-788df67f62e8?q=80&w=1000&auto=format&fit=crop'
    ],
    inStock: true
  }
];
