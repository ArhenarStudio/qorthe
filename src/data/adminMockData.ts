// ============================================================
// ADMIN MOCK DATA — RockStage Commerce / DavidSon's Design
// ============================================================

// ---------- ORDERS ----------
export interface EngravingDesign {
  id: string;
  fileName: string;
  previewUrl: string;
  width: number;
  height: number;
  position: 'center' | 'bottom-right' | 'bottom-left' | 'custom';
  maxArea: string;
  status: 'pending' | 'in-progress' | 'completed';
  productionNotes: string;
  isFree: boolean;
  extraCost: number;
}

export interface OrderItemEngraving {
  hasEngraving: boolean;
  designs: EngravingDesign[];
}

export interface OrderItem {
  id: string;
  productName: string;
  sku: string;
  variant?: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
  image: string;
  weight?: number;
  packageDimensions?: string;
  engraving?: OrderItemEngraving;
}

export interface OrderNote {
  id: string;
  text: string;
  author: string;
  date: string;
  pinned?: boolean;
  attachment?: string;
}

export interface OrderCommunication {
  id: string;
  type: 'email';
  subject: string;
  recipientEmail: string;
  date: string;
  status: 'delivered' | 'sent' | 'failed';
}

export interface OrderTimelineEntry {
  id: string;
  label: string;
  date: string;
  done: boolean;
  note?: string;
  notifiedClient?: boolean;
}

export type OrderDetailedStatus =
  | 'new' | 'payment_confirmed' | 'in_production' | 'laser_engraving'
  | 'quality_control' | 'packing' | 'ready_to_ship' | 'shipped'
  | 'in_transit' | 'out_for_delivery' | 'delivered'
  | 'cancelled' | 'refunded' | 'disputed';

export interface OrderMargin {
  productCost: number;
  shippingCost: number;
  stripeCommission: number;
  estimatedProfit: number;
  marginPercent: number;
}

export interface OrderAddress {
  name: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  fullString: string;
  zone: string;
}

export interface Order {
  id: string;
  number: string;
  date: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    tier?: 'bronze' | 'silver' | 'gold';
    points?: number;
    totalOrders?: number;
    totalSpent?: number;
    customerNotes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  discountCode?: string;
  engravingTotal: number;
  tax: number;
  total: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod: string;
  paymentRef?: string;
  shippingStatus: 'pending' | 'production' | 'shipped' | 'delivered' | 'cancelled';
  orderStatus: OrderDetailedStatus;
  carrier?: string;
  tracking?: string;
  address: string;
  addressDetail: OrderAddress;
  notes: OrderNote[];
  timeline: OrderTimelineEntry[];
  communications: OrderCommunication[];
  margin: OrderMargin;
  hasEngraving: boolean;
  _raw?: { medusa_id: string; display_id: number };
}

export const orders: Order[] = [
  {
    id: 'ord-001', number: '#DSD-0015', date: '2026-02-28T10:30:00',
    customer: { name: 'David Pérez', email: 'designdavidsons@gmail.com', phone: '662-361-0742', avatar: 'DP', tier: 'gold', points: 1450, totalOrders: 5, totalSpent: 12340, customerNotes: 'Prefiere empaque especial, siempre pide grabado' },
    items: [
      {
        id: 'i1', productName: 'Tabla para Picar y Charcutería de Parota', sku: 'DSD-TAB-PAR-MED-001', variant: 'Mediana (45×25cm)', qty: 1, unitPrice: 2450, subtotal: 2450,
        image: 'https://images.unsplash.com/photo-1621868315576-90f772719277?q=80&w=200&auto=format&fit=crop',
        weight: 3, packageDimensions: '50×30×10 cm',
        engraving: {
          hasEngraving: true,
          designs: [
            { id: 'eng1', fileName: 'logo-empresa.png', previewUrl: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=200&auto=format&fit=crop', width: 8, height: 5, position: 'center', maxArea: '20×15cm', status: 'in-progress', productionNotes: 'Ajustar contraste del logo antes de grabar, cliente aprobó por WhatsApp', isFree: true, extraCost: 0 },
            { id: 'eng2', fileName: 'texto-dedicatoria.svg', previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop', width: 10, height: 3, position: 'bottom-right', maxArea: '20×15cm', status: 'pending', productionNotes: '', isFree: false, extraCost: 70 },
          ]
        }
      },
      {
        id: 'i2', productName: 'Set Cuchillos Queso', sku: 'ACC-CUC-001', qty: 1, unitPrice: 690, subtotal: 690,
        image: 'https://images.unsplash.com/photo-1588612507340-a15d7e562145?q=80&w=200&auto=format&fit=crop',
        weight: 0.6, packageDimensions: '25×15×5 cm',
      },
    ],
    subtotal: 2990, shipping: 370.62, discount: 150, discountCode: 'BIENVENIDO', engravingTotal: 70, tax: 453.40, total: 3280.62,
    paymentStatus: 'paid', paymentMethod: 'Stripe •••• 4242', paymentRef: 'pi_3PqR4xAbCdEfGhIj',
    shippingStatus: 'production', orderStatus: 'in_production',
    address: 'Blvd. Rodriguez #345, Col. Centro, Hermosillo, Sonora CP 83000, México',
    addressDetail: { name: 'David Pérez', street: 'Blvd. Rodriguez #345', neighborhood: 'Col. Centro', city: 'Hermosillo', state: 'Sonora', zip: '83000', country: 'México', phone: '662-361-0742', fullString: 'Blvd. Rodriguez #345, Col. Centro, Hermosillo, Sonora CP 83000, México', zone: 'Hermosillo Local (Uber Flash $99)' },
    notes: [
      { id: 'n1', text: 'Cliente pidió empaque de regalo con tarjeta personalizada. Nombre: Para María, de Juan', author: 'David', date: '2026-02-28T11:00:00', pinned: true },
      { id: 'n2', text: 'Grabado revisado, contraste ajustado. Listo para producción', author: 'David', date: '2026-02-28T11:30:00' },
    ],
    timeline: [
      { id: 't1', label: 'Pedido Recibido', date: '28 Feb 2026, 10:30 AM', done: true, note: 'Pedido creado vía Stripe ****4242' },
      { id: 't2', label: 'Pago Confirmado', date: '28 Feb 2026, 10:31 AM', done: true, note: '$3,280.62 MXN — Stripe (pagado)' },
      { id: 't3', label: 'En Producción', date: '28 Feb 2026, 11:00 AM', done: true, note: 'Iniciando corte de parota, grabado mañana', notifiedClient: true },
      { id: 't4', label: 'Grabado Láser', date: '', done: false },
      { id: 't5', label: 'Control de Calidad', date: '', done: false },
      { id: 't6', label: 'Empacado', date: '', done: false },
      { id: 't7', label: 'Listo para Enviar', date: '', done: false },
      { id: 't8', label: 'Enviado', date: '', done: false },
      { id: 't9', label: 'Entregado', date: '', done: false },
    ],
    communications: [
      { id: 'com1', type: 'email', subject: 'Confirmación de pedido', recipientEmail: 'designdavidsons@gmail.com', date: '2026-02-28T10:31:00', status: 'delivered' },
      { id: 'com2', type: 'email', subject: 'Tu pedido está en producción', recipientEmail: 'designdavidsons@gmail.com', date: '2026-02-28T11:00:00', status: 'delivered' },
    ],
    margin: { productCost: 1200, shippingCost: 280, stripeCommission: 98.41, estimatedProfit: 1702.21, marginPercent: 51.8 },
    hasEngraving: true,
  },
  {
    id: 'ord-002', number: '#DSD-0014', date: '2026-02-27T16:15:00',
    customer: { name: 'María López', email: 'maria@email.com', phone: '+52 55 9876 5432', avatar: 'ML', tier: 'silver', points: 1580, totalOrders: 5, totalSpent: 15800 },
    items: [
      { id: 'i3', productName: 'Tabla Nogal Premium', sku: 'TBL-NOG-001', variant: 'Grande (50×30cm)', qty: 1, unitPrice: 3200, subtotal: 3200, image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=200&auto=format&fit=crop', weight: 2.5, packageDimensions: '55×35×12 cm' },
    ],
    subtotal: 3200, shipping: 0, discount: 320, discountCode: 'LEALTAD10', engravingTotal: 0, tax: 460.8, total: 3340.8,
    paymentStatus: 'paid', paymentMethod: 'MercadoPago •••• 1234', paymentRef: 'mp_abc123',
    shippingStatus: 'production', orderStatus: 'in_production', carrier: 'DHL',
    address: 'Av. Insurgentes Sur 1602, Col. Crédito Constructor, CDMX 03940',
    addressDetail: { name: 'María López', street: 'Av. Insurgentes Sur 1602', neighborhood: 'Col. Crédito Constructor', city: 'Ciudad de México', state: 'CDMX', zip: '03940', country: 'México', phone: '+52 55 9876 5432', fullString: 'Av. Insurgentes Sur 1602, Col. Crédito Constructor, CDMX 03940', zone: 'Nacional (DHL Express $299)' },
    notes: [],
    timeline: [
      { id: 't1', label: 'Pedido Recibido', date: '27 Feb 2026, 4:15 PM', done: true },
      { id: 't2', label: 'Pago Confirmado', date: '27 Feb 2026, 4:20 PM', done: true },
      { id: 't3', label: 'En Producción', date: '28 Feb 2026, 9:00 AM', done: true },
      { id: 't4', label: 'Control de Calidad', date: '', done: false },
      { id: 't5', label: 'Empacado', date: '', done: false },
      { id: 't6', label: 'Listo para Enviar', date: '', done: false },
      { id: 't7', label: 'Enviado', date: '', done: false },
      { id: 't8', label: 'Entregado', date: '', done: false },
    ],
    communications: [
      { id: 'com1', type: 'email', subject: 'Confirmación de pedido', recipientEmail: 'maria@email.com', date: '2026-02-27T16:20:00', status: 'delivered' },
    ],
    margin: { productCost: 1400, shippingCost: 220, stripeCommission: 0, estimatedProfit: 1720.8, marginPercent: 51.5 },
    hasEngraving: false,
  },
  {
    id: 'ord-003', number: '#DSD-0013', date: '2026-02-26T09:00:00',
    customer: { name: 'Carlos Ramírez', email: 'carlos@corp.com', phone: '+52 33 5555 6666', avatar: 'CR', tier: 'gold', points: 4820, totalOrders: 12, totalSpent: 48200 },
    items: [
      { id: 'i4', productName: 'Set Degustación Cedro', sku: 'SET-CED-001', qty: 2, unitPrice: 1800, subtotal: 3600, image: 'https://images.unsplash.com/photo-1615486979927-142f1559c36d?q=80&w=200&auto=format&fit=crop', weight: 0.9 },
      { id: 'i5', productName: 'Set Posavasos Geométricos', sku: 'ACC-POS-001', qty: 3, unitPrice: 450, subtotal: 1350, image: 'https://images.unsplash.com/photo-1605342417756-788df67f62e8?q=80&w=200&auto=format&fit=crop', weight: 0.3 },
    ],
    subtotal: 4950, shipping: 299, discount: 0, engravingTotal: 0, tax: 839.84, total: 6088.84,
    paymentStatus: 'paid', paymentMethod: 'Stripe •••• 8888', paymentRef: 'pi_8888xyz',
    shippingStatus: 'shipped', orderStatus: 'in_transit', carrier: 'Estafeta', tracking: 'EST-9283746501',
    address: 'Av. Chapultepec 120, Col. Americana, Guadalajara, Jal. 44160',
    addressDetail: { name: 'Carlos Ramírez', street: 'Av. Chapultepec 120', neighborhood: 'Col. Americana', city: 'Guadalajara', state: 'Jalisco', zip: '44160', country: 'México', phone: '+52 33 5555 6666', fullString: 'Av. Chapultepec 120, Col. Americana, Guadalajara, Jal. 44160', zone: 'Nacional (Estafeta Express $299)' },
    notes: [{ id: 'n2', text: 'Pedido corporativo — factura requerida', author: 'Admin', date: '2026-02-26T10:00:00', pinned: true }],
    timeline: [
      { id: 't1', label: 'Pedido Recibido', date: '26 Feb 2026, 9:00 AM', done: true },
      { id: 't2', label: 'Pago Confirmado', date: '26 Feb 2026, 9:05 AM', done: true },
      { id: 't3', label: 'En Producción', date: '26 Feb 2026, 2:00 PM', done: true },
      { id: 't4', label: 'Control de Calidad', date: '27 Feb 2026, 9:00 AM', done: true },
      { id: 't5', label: 'Empacado', date: '27 Feb 2026, 10:00 AM', done: true },
      { id: 't6', label: 'Listo para Enviar', date: '27 Feb 2026, 10:30 AM', done: true },
      { id: 't7', label: 'Enviado', date: '27 Feb 2026, 11:30 AM', done: true, note: 'Estafeta Express — EST-9283746501' },
      { id: 't8', label: 'En Tránsito', date: '27 Feb 2026, 3:00 PM', done: true, note: 'En bodega de distribución CDMX' },
      { id: 't9', label: 'Entregado', date: '', done: false },
    ],
    communications: [
      { id: 'com1', type: 'email', subject: 'Confirmación de pedido', recipientEmail: 'carlos@corp.com', date: '2026-02-26T09:05:00', status: 'delivered' },
      { id: 'com2', type: 'email', subject: 'Tu pedido está en producción', recipientEmail: 'carlos@corp.com', date: '2026-02-26T14:00:00', status: 'delivered' },
      { id: 'com3', type: 'email', subject: 'Pedido enviado + tracking', recipientEmail: 'carlos@corp.com', date: '2026-02-27T11:30:00', status: 'delivered' },
    ],
    margin: { productCost: 1950, shippingCost: 220, stripeCommission: 182.66, estimatedProfit: 3736.18, marginPercent: 61.4 },
    hasEngraving: false,
  },
  {
    id: 'ord-004', number: '#DSD-0012', date: '2026-02-25T14:00:00',
    customer: { name: 'Ana Torres', email: 'ana@mail.com', phone: '+52 81 4444 3333', avatar: 'AT', tier: 'bronze', points: 480, totalOrders: 3, totalSpent: 4800 },
    items: [
      { id: 'i6', productName: 'Tabla Redonda Pino', sku: 'TBL-PIN-001', qty: 1, unitPrice: 950, subtotal: 950, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=200&auto=format&fit=crop', weight: 1.2, packageDimensions: '40×40×8 cm' },
    ],
    subtotal: 950, shipping: 149, discount: 0, engravingTotal: 0, tax: 175.84, total: 1274.84,
    paymentStatus: 'paid', paymentMethod: 'PayPal', paymentRef: 'pp_xyz789',
    shippingStatus: 'delivered', orderStatus: 'delivered', carrier: 'FedEx', tracking: 'FDX-1029384756',
    address: 'Calle Hidalgo 500, Col. Centro, Monterrey, NL 64000',
    addressDetail: { name: 'Ana Torres', street: 'Calle Hidalgo 500', neighborhood: 'Col. Centro', city: 'Monterrey', state: 'Nuevo León', zip: '64000', country: 'México', phone: '+52 81 4444 3333', fullString: 'Calle Hidalgo 500, Col. Centro, Monterrey, NL 64000', zone: 'Nacional (FedEx $149)' },
    notes: [],
    timeline: [
      { id: 't1', label: 'Pedido Recibido', date: '25 Feb 2026, 2:00 PM', done: true },
      { id: 't2', label: 'Pago Confirmado', date: '25 Feb 2026, 2:02 PM', done: true },
      { id: 't3', label: 'En Producción', date: '25 Feb 2026, 4:00 PM', done: true },
      { id: 't4', label: 'Control de Calidad', date: '26 Feb 2026, 8:00 AM', done: true },
      { id: 't5', label: 'Empacado', date: '26 Feb 2026, 9:00 AM', done: true },
      { id: 't6', label: 'Enviado', date: '26 Feb 2026, 10:00 AM', done: true, note: 'FedEx Express — FDX-1029384756' },
      { id: 't7', label: 'Entregado', date: '27 Feb 2026, 3:30 PM', done: true, note: 'Recibido por: Ana Torres' },
    ],
    communications: [
      { id: 'com1', type: 'email', subject: 'Confirmación de pedido', recipientEmail: 'ana@mail.com', date: '2026-02-25T14:02:00', status: 'delivered' },
      { id: 'com2', type: 'email', subject: 'Pedido enviado + tracking', recipientEmail: 'ana@mail.com', date: '2026-02-26T10:00:00', status: 'delivered' },
      { id: 'com3', type: 'email', subject: 'Tu pedido ha sido entregado', recipientEmail: 'ana@mail.com', date: '2026-02-27T15:30:00', status: 'delivered' },
    ],
    margin: { productCost: 320, shippingCost: 110, stripeCommission: 0, estimatedProfit: 844.84, marginPercent: 66.3 },
    hasEngraving: false,
  },
  {
    id: 'ord-005', number: '#DSD-0011', date: '2026-02-24T11:20:00',
    customer: { name: 'Roberto Mendoza', email: 'roberto@test.com', phone: '+52 55 7777 8888', avatar: 'RM', tier: 'bronze', points: 590, totalOrders: 2, totalSpent: 5900 },
    items: [
      {
        id: 'i7', productName: 'Tabla Parota Rústica', sku: 'TBL-PAR-001', variant: 'Grande (60×35cm)', qty: 2, unitPrice: 2450, subtotal: 4900,
        image: 'https://images.unsplash.com/photo-1621868315576-90f772719277?q=80&w=200&auto=format&fit=crop',
        weight: 3.2, packageDimensions: '65×40×12 cm',
        engraving: {
          hasEngraving: true,
          designs: [
            { id: 'eng3', fileName: 'monograma-RM.svg', previewUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=200&auto=format&fit=crop', width: 6, height: 6, position: 'bottom-right', maxArea: '25×18cm', status: 'pending', productionNotes: '', isFree: true, extraCost: 0 },
          ]
        }
      },
    ],
    subtotal: 4900, shipping: 0, discount: 490, engravingTotal: 0, tax: 705.6, total: 5115.6,
    paymentStatus: 'pending', paymentMethod: 'Stripe •••• 5555', paymentRef: 'pi_pending555',
    shippingStatus: 'pending', orderStatus: 'new',
    address: 'Paseo de la Reforma 222, CDMX 06600',
    addressDetail: { name: 'Roberto Mendoza', street: 'Paseo de la Reforma 222', neighborhood: 'Col. Juárez', city: 'Ciudad de México', state: 'CDMX', zip: '06600', country: 'México', phone: '+52 55 7777 8888', fullString: 'Paseo de la Reforma 222, Col. Juárez, CDMX 06600', zone: 'Nacional (Gratis por monto)' },
    notes: [],
    timeline: [
      { id: 't1', label: 'Pedido Recibido', date: '24 Feb 2026, 11:20 AM', done: true },
      { id: 't2', label: 'Pago Confirmado', date: '', done: false },
      { id: 't3', label: 'En Producción', date: '', done: false },
      { id: 't4', label: 'Grabado Láser', date: '', done: false },
      { id: 't5', label: 'Control de Calidad', date: '', done: false },
      { id: 't6', label: 'Empacado', date: '', done: false },
      { id: 't7', label: 'Listo para Enviar', date: '', done: false },
      { id: 't8', label: 'Enviado', date: '', done: false },
      { id: 't9', label: 'Entregado', date: '', done: false },
    ],
    communications: [],
    margin: { productCost: 1960, shippingCost: 0, stripeCommission: 153.47, estimatedProfit: 3002.13, marginPercent: 58.7 },
    hasEngraving: true,
  },
];

// ---------- PRODUCTS (ADMIN-EXTENDED) ----------
export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  slug: string;
  category: string;
  price: number;
  comparePrice?: number;
  cost: number;
  stock: number;
  reorderPoint: number;
  status: 'active' | 'draft' | 'outOfStock';
  material: string;
  dimensions: string;
  weight: number;
  image: string;
  soldUnits: number;
  revenue: number;
  rating: number;
  reviewCount: number;
  laserAvailable: boolean;
  productionDays: number;
}

export const adminProducts: AdminProduct[] = [
  { id: 'p1', name: 'Tabla Parota Rústica', sku: 'TBL-PAR-001', slug: 'tabla-parota-rustica', category: 'Tablas de Quesos', price: 2450, comparePrice: 2800, cost: 980, stock: 15, reorderPoint: 5, status: 'active', material: 'Parota (Guanacaste)', dimensions: '45×25×2.5cm', weight: 1.8, image: 'https://images.unsplash.com/photo-1621868315576-90f772719277?q=80&w=200&auto=format&fit=crop', soldUnits: 48, revenue: 117600, rating: 4.8, reviewCount: 24, laserAvailable: true, productionDays: 5 },
  { id: 'p2', name: 'Set Degustación Cedro', sku: 'SET-CED-001', slug: 'set-degustacion-cedro', category: 'Servicio', price: 1800, cost: 650, stock: 8, reorderPoint: 3, status: 'active', material: 'Cedro Rojo', dimensions: '20×15cm c/u', weight: 0.9, image: 'https://images.unsplash.com/photo-1615486979927-142f1559c36d?q=80&w=200&auto=format&fit=crop', soldUnits: 32, revenue: 57600, rating: 4.5, reviewCount: 12, laserAvailable: true, productionDays: 3 },
  { id: 'p3', name: 'Tabla Redonda Pino', sku: 'TBL-PIN-001', slug: 'tabla-pino-redonda', category: 'Tablas de Quesos', price: 950, cost: 320, stock: 22, reorderPoint: 8, status: 'active', material: 'Pino Chileno', dimensions: '35cm diám', weight: 1.2, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=200&auto=format&fit=crop', soldUnits: 61, revenue: 57950, rating: 4.2, reviewCount: 8, laserAvailable: false, productionDays: 2 },
  { id: 'p4', name: 'Set Cuchillos Queso Artesanal', sku: 'ACC-CUC-001', slug: 'cuchillos-queso-artesanal', category: 'Accesorios', price: 1200, cost: 480, stock: 2, reorderPoint: 5, status: 'active', material: 'Acero Inox / Mango Mixto', dimensions: 'Varias', weight: 0.6, image: 'https://images.unsplash.com/photo-1588612507340-a15d7e562145?q=80&w=200&auto=format&fit=crop', soldUnits: 28, revenue: 33600, rating: 4.6, reviewCount: 6, laserAvailable: false, productionDays: 1 },
  { id: 'p5', name: 'Tabla Nogal Premium', sku: 'TBL-NOG-001', slug: 'tabla-nogal-premium', category: 'Regalos', price: 3200, comparePrice: 3800, cost: 1400, stock: 0, reorderPoint: 3, status: 'outOfStock', material: 'Nogal Negro', dimensions: '50×30cm', weight: 2.5, image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=200&auto=format&fit=crop', soldUnits: 12, revenue: 38400, rating: 5.0, reviewCount: 5, laserAvailable: true, productionDays: 7 },
  { id: 'p6', name: 'Set Posavasos Geométricos', sku: 'ACC-POS-001', slug: 'posavasos-madera', category: 'Accesorios', price: 450, cost: 120, stock: 45, reorderPoint: 10, status: 'active', material: 'Madera de Teca', dimensions: '10cm diám', weight: 0.3, image: 'https://images.unsplash.com/photo-1605342417756-788df67f62e8?q=80&w=200&auto=format&fit=crop', soldUnits: 89, revenue: 40050, rating: 4.3, reviewCount: 15, laserAvailable: false, productionDays: 1 },
  { id: 'p7', name: 'Tabla Rosa Morada XL', sku: 'TBL-ROS-001', slug: 'tabla-rosa-morada', category: 'Tablas de Quesos', price: 4500, comparePrice: 5200, cost: 2100, stock: 3, reorderPoint: 2, status: 'active', material: 'Rosa Morada', dimensions: '60×35×3cm', weight: 3.2, image: 'https://images.unsplash.com/photo-1621868315576-90f772719277?q=80&w=200&auto=format&fit=crop', soldUnits: 8, revenue: 36000, rating: 4.9, reviewCount: 3, laserAvailable: true, productionDays: 10 },
  { id: 'p8', name: 'Grabado Láser Personalizado', sku: 'SRV-LAS-001', slug: 'grabado-laser', category: 'Servicio', price: 350, cost: 50, stock: 999, reorderPoint: 0, status: 'active', material: 'N/A', dimensions: 'N/A', weight: 0, image: 'https://images.unsplash.com/photo-1621868315576-90f772719277?q=80&w=200&auto=format&fit=crop', soldUnits: 156, revenue: 54600, rating: 4.7, reviewCount: 42, laserAvailable: false, productionDays: 1 },
];

// ---------- CUSTOMERS ----------
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  orders: number;
  totalSpent: number;
  tier: 'bronze' | 'silver' | 'gold';
  points: number;
  registered: string;
  lastOrder: string;
  status: 'active' | 'inactive';
}

export const customers: Customer[] = [
  { id: 'c1', name: 'David Pérez', email: 'david@email.com', phone: '+52 55 1234 5678', avatar: 'DP', orders: 8, totalSpent: 24500, tier: 'gold', points: 2450, registered: '2025-03-15', lastOrder: '2026-02-28', status: 'active' },
  { id: 'c2', name: 'María López', email: 'maria@email.com', phone: '+52 55 9876 5432', avatar: 'ML', orders: 5, totalSpent: 15800, tier: 'silver', points: 1580, registered: '2025-06-20', lastOrder: '2026-02-27', status: 'active' },
  { id: 'c3', name: 'Carlos Ramírez', email: 'carlos@corp.com', phone: '+52 33 5555 6666', avatar: 'CR', orders: 12, totalSpent: 48200, tier: 'gold', points: 4820, registered: '2025-01-10', lastOrder: '2026-02-26', status: 'active' },
  { id: 'c4', name: 'Ana Torres', email: 'ana@mail.com', phone: '+52 81 4444 3333', avatar: 'AT', orders: 3, totalSpent: 4800, tier: 'bronze', points: 480, registered: '2025-09-05', lastOrder: '2026-02-25', status: 'active' },
  { id: 'c5', name: 'Roberto Mendoza', email: 'roberto@test.com', phone: '+52 55 7777 8888', avatar: 'RM', orders: 2, totalSpent: 5900, tier: 'bronze', points: 590, registered: '2025-11-01', lastOrder: '2026-02-24', status: 'active' },
  { id: 'c6', name: 'Sofía Hernández', email: 'sofia@gmail.com', phone: '+52 55 2222 1111', avatar: 'SH', orders: 6, totalSpent: 18900, tier: 'silver', points: 1890, registered: '2025-04-12', lastOrder: '2026-02-20', status: 'active' },
  { id: 'c7', name: 'Miguel Ángel Ruiz', email: 'miguel@outlook.com', phone: '+52 33 8888 9999', avatar: 'MR', orders: 1, totalSpent: 2450, tier: 'bronze', points: 245, registered: '2026-01-15', lastOrder: '2026-01-15', status: 'active' },
  { id: 'c8', name: 'Elena Vargas', email: 'elena@empresa.mx', phone: '+52 81 6666 5555', avatar: 'EV', orders: 0, totalSpent: 0, tier: 'bronze', points: 0, registered: '2026-02-10', lastOrder: '', status: 'inactive' },
];

// ---------- REVIEWS ----------
export interface Review {
  id: string;
  productName: string;
  productImage: string;
  customerName: string;
  customerOrders: number;
  rating: number;
  text: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  response?: string;
}

export const reviews: Review[] = [
  { id: 'r1', productName: 'Tabla Parota Rústica', productImage: 'https://images.unsplash.com/photo-1621868315576-90f772719277?q=80&w=200&auto=format&fit=crop', customerName: 'David Pérez', customerOrders: 8, rating: 5, text: 'Increíble calidad. La veta de la parota es espectacular, cada persona que la ve me pregunta dónde la compré. El acabado es impecable.', date: '2026-02-27', status: 'approved' },
  { id: 'r2', productName: 'Set Degustación Cedro', productImage: 'https://images.unsplash.com/photo-1615486979927-142f1559c36d?q=80&w=200&auto=format&fit=crop', customerName: 'Sofía Hernández', customerOrders: 6, rating: 4, text: 'Muy bonito el set, el aroma del cedro es un plus. Solo le doy 4 estrellas porque una tabla tenía un pequeño raspón.', date: '2026-02-26', status: 'approved' },
  { id: 'r3', productName: 'Tabla Nogal Premium', productImage: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=200&auto=format&fit=crop', customerName: 'Carlos Ramírez', customerOrders: 12, rating: 5, text: 'La mejor tabla que he comprado. El nogal negro es simplemente hermoso. La usé en una cena de negocios y fue todo un éxito.', date: '2026-02-25', status: 'pending' },
  { id: 'r4', productName: 'Tabla Redonda Pino', productImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=200&auto=format&fit=crop', customerName: 'Ana Torres', customerOrders: 3, rating: 3, text: 'Está bien para el precio. Es funcional pero la madera se ve un poco clara para mi gusto. Esperaba algo más oscuro.', date: '2026-02-24', status: 'pending' },
  { id: 'r5', productName: 'Grabado Láser Personalizado', productImage: 'https://images.unsplash.com/photo-1621868315576-90f772719277?q=80&w=200&auto=format&fit=crop', customerName: 'María López', customerOrders: 5, rating: 5, text: 'Mandé grabar el nombre de mi esposo y quedó perfecto. El nivel de detalle es impresionante. ¡Excelente regalo!', date: '2026-02-23', status: 'pending' },
];

// ---------- QUOTES (full spec) ----------
export type QuoteStatus = 'nueva' | 'en_revision' | 'cotizacion_enviada' | 'en_negociacion' | 'aprobada' | 'anticipo_recibido' | 'en_produccion' | 'completada' | 'rechazada' | 'vencida' | 'cancelada';
export type PieceType = 'Tabla decoración' | 'Tabla de picar' | 'Tabla charcutería' | 'Plato decorativo' | 'Caja personalizada' | 'Servicio de grabado' | 'Otro';
export type WoodType = 'Cedro' | 'Nogal' | 'Encino' | 'Parota' | 'Combinación';
export type EngravingType = 'Texto' | 'Logotipo' | 'Imagen personalizada' | 'Combinación';
export type EngravingComplexity = 'Básico' | 'Intermedio' | 'Detallado';
export type UsageType = 'Decorativo' | 'Funcional (cocina)' | 'Evento / regalo corporativo' | 'Restaurante / volumen alto';
export type ClientTier = 'bronce' | 'plata' | 'oro' | 'platino' | null;

export interface QuotePiece { id: string; type: PieceType; wood: WoodType; secondWood?: WoodType; woodRatio?: string; dimensions?: { length: number; width: number; thickness: number }; quantity: number; usage: UsageType; engraving?: { type: EngravingType; complexity: EngravingComplexity; zones?: string[]; file?: string; text?: string }; engravingMaterial?: string; autoPrice: number; adminPrice?: number; costEstimate?: number; internalNote?: string }
export interface QuoteMessage { id: string; sender: 'client' | 'admin'; senderName: string; date: string; text: string; attachments?: string[] }
export interface QuoteInternalNote { id: string; author: string; date: string; text: string }

export interface FullQuote {
  id: string; number: string; date: string; validUntil: string; status: QuoteStatus;
  customer: { name: string; email: string; phone: string; tier: ClientTier; points: number; totalSpent: number; orders: number };
  projectName?: string; pieces: QuotePiece[]; discount?: { percent: number; reason: string };
  shippingIncluded: boolean; timeline: string; validityDays: number; depositPercent: number;
  conditions: { text: string; checked: boolean }[]; messages: QuoteMessage[]; internalNotes: QuoteInternalNote[];
  depositPaid?: { amount: number; method: string; ref: string; date: string };
  productionProgress?: { completed: number; total: number }; rejectionReason?: string; closedDate?: string;
}

// Legacy interface for backwards compat
export interface Quote { id: string; number: string; date: string; customerName: string; customerEmail: string; description: string; budget: string; status: 'new' | 'reviewing' | 'quoted' | 'accepted' | 'rejected'; quotedPrice?: number; estimatedDays?: number }
export const quotes: Quote[] = [
  { id: 'q1', number: '#COT-008', date: '2026-02-27', customerName: 'María López', customerEmail: 'maria@email.com', description: 'Mesa de centro en Parota con patas de herrería, medidas 120×60cm', budget: '$8,000 - $12,000', status: 'new' },
  { id: 'q2', number: '#COT-007', date: '2026-02-25', customerName: 'Carlos Ramírez', customerEmail: 'carlos@corp.com', description: 'Set de 20 tablas para regalo corporativo con grabado del logo de la empresa', budget: '$30,000 - $40,000', status: 'reviewing' },
  { id: 'q3', number: '#COT-006', date: '2026-02-22', customerName: 'Restaurante La Parota', customerEmail: 'compras@laparota.mx', description: 'Tablas de presentación para restaurante. 15 pzas de 40×25cm en nogal', budget: '$25,000+', status: 'quoted', quotedPrice: 28500, estimatedDays: 21 },
];

export const fullQuotes: FullQuote[] = [
  { id:'fq1', number:'COT-2026-142', date:'2026-02-28T10:30:00', validUntil:'2026-03-15', status:'nueva', customer:{name:'David Alejandro Perez Rea',email:'rocksagecapital@gmail.com',phone:'662-361-0742',tier:'oro',points:12340,totalSpent:12340,orders:14}, projectName:'Evento corporativo RockSage', pieces:[{id:'p1',type:'Tabla charcutería',wood:'Parota',dimensions:{length:60,width:35,thickness:3},quantity:10,usage:'Evento / regalo corporativo',engraving:{type:'Logotipo',complexity:'Detallado',zones:['Centro','Esquina inferior'],file:'logo-empresa.svg'},autoPrice:1417.5,adminPrice:1500,costEstimate:600},{id:'p2',type:'Tabla de picar',wood:'Nogal',dimensions:{length:40,width:25,thickness:3},quantity:10,usage:'Evento / regalo corporativo',engraving:{type:'Texto',complexity:'Básico',text:'RockSage Capital'},autoPrice:675,adminPrice:700,costEstimate:280},{id:'p3',type:'Servicio de grabado',wood:'Otro' as WoodType,dimensions:undefined,quantity:20,usage:'Evento / regalo corporativo',engraving:{type:'Logotipo',complexity:'Intermedio'},engravingMaterial:'Metal/Termo',autoPrice:250,adminPrice:300,costEstimate:50}], discount:{percent:5,reason:'Volumen'}, shippingIncluded:false,timeline:'3-4 semanas',validityDays:15,depositPercent:50, conditions:[{text:'Anticipo 50% para iniciar producción',checked:true},{text:'Saldo 50% al completar antes de envío',checked:true},{text:'Cambios después de iniciar producción +15%',checked:true},{text:'Envío incluido en el precio',checked:false},{text:'Fotos de avance durante la producción',checked:true}], messages:[{id:'m1',sender:'client',senderName:'David Perez',date:'2026-02-28T10:30:00',text:'Necesito 10 tablas de parota y 10 de nogal para un evento corporativo el 15 de abril. También quiero grabar termos con el logo de la empresa. ¿Es posible el grabado en metal?',attachments:['logo-empresa.svg','brief-evento.pdf']}], internalNotes:[{id:'n1',author:'David (Admin)',date:'2026-02-28T12:00:00',text:'Cliente corporativo potencial. Compra frecuente para su empresa. Posible cuenta B2B recurrente. Ofrecer descuento por volumen.'}] },
  { id:'fq2', number:'COT-2026-141', date:'2026-02-27T15:45:00', validUntil:'2026-03-14', status:'nueva', customer:{name:'Ana García',email:'ana@email.com',phone:'',tier:'bronce',points:0,totalSpent:0,orders:0}, projectName:'Tabla decorativa familiar', pieces:[{id:'p4',type:'Tabla decoración',wood:'Combinación',secondWood:'Encino',woodRatio:'60/40',dimensions:{length:50,width:30,thickness:2.5},quantity:1,usage:'Decorativo',engraving:{type:'Imagen personalizada',complexity:'Detallado',file:'diseno-familiar.png'},autoPrice:1875,costEstimate:650}], shippingIncluded:false,timeline:'4-6 semanas',validityDays:15,depositPercent:50, conditions:[{text:'Anticipo 50% para iniciar producción',checked:true},{text:'Saldo 50% al completar antes de envío',checked:true},{text:'Cambios después de iniciar producción +15%',checked:true},{text:'Envío incluido en el precio',checked:false},{text:'Fotos de avance durante la producción',checked:true}], messages:[{id:'m2',sender:'client',senderName:'Ana García',date:'2026-02-27T15:45:00',text:'Hola, me gustaría una tabla decorativa con un diseño familiar que adjunto. ¿Pueden hacerla en cedro con encino combinado? Sería un regalo de aniversario.',attachments:['diseno-familiar.png']}], internalNotes:[] },
  { id:'fq3', number:'COT-2026-140', date:'2026-02-26T09:00:00', validUntil:'2026-03-13', status:'nueva', customer:{name:'Luis Hernández',email:'luis.h@gmail.com',phone:'55-1234-5678',tier:'plata',points:4200,totalSpent:4200,orders:5}, pieces:[{id:'p5',type:'Caja personalizada',wood:'Nogal',dimensions:{length:30,width:20,thickness:15},quantity:5,usage:'Evento / regalo corporativo',engraving:{type:'Texto',complexity:'Intermedio',text:'Con cariño, familia Hernández'},autoPrice:980,costEstimate:380}], shippingIncluded:false,timeline:'3-4 semanas',validityDays:15,depositPercent:50, conditions:[{text:'Anticipo 50% para iniciar producción',checked:true},{text:'Saldo 50% al completar antes de envío',checked:true},{text:'Fotos de avance durante la producción',checked:true}], messages:[{id:'m3',sender:'client',senderName:'Luis Hernández',date:'2026-02-26T09:00:00',text:'Quiero 5 cajas de nogal para regalos de bodas de oro. Necesito que digan "Con cariño, familia Hernández" en la tapa.'}], internalNotes:[] },
  { id:'fq4', number:'COT-2026-139', date:'2026-02-24T14:00:00', validUntil:'2026-03-11', status:'nueva', customer:{name:'Elena Vargas',email:'elena.v@hotmail.com',phone:'81-5555-1234',tier:null,points:0,totalSpent:0,orders:0}, pieces:[{id:'p6',type:'Plato decorativo',wood:'Parota',dimensions:{length:35,width:35,thickness:2},quantity:2,usage:'Decorativo',autoPrice:890,costEstimate:320}], shippingIncluded:false,timeline:'4-6 semanas',validityDays:15,depositPercent:50, conditions:[{text:'Anticipo 50% para iniciar producción',checked:true}], messages:[{id:'m4',sender:'client',senderName:'Elena Vargas',date:'2026-02-24T14:00:00',text:'¿Hacen platos decorativos de Parota? Quiero dos para mi comedor.'}], internalNotes:[] },
  { id:'fq5', number:'COT-2026-143', date:'2026-02-28T16:00:00', validUntil:'2026-03-15', status:'nueva', customer:{name:'Restaurante El Mezquite',email:'compras@elmezquite.mx',phone:'662-555-8800',tier:null,points:0,totalSpent:0,orders:0}, pieces:[{id:'p7',type:'Tabla charcutería',wood:'Encino',dimensions:{length:45,width:30,thickness:2.5},quantity:30,usage:'Restaurante / volumen alto',engraving:{type:'Logotipo',complexity:'Básico',file:'logo-mezquite.png'},autoPrice:520,adminPrice:480,costEstimate:180}], shippingIncluded:false,timeline:'4-5 semanas',validityDays:15,depositPercent:50, conditions:[{text:'Anticipo 50% para iniciar producción',checked:true},{text:'Saldo 50% al completar antes de envío',checked:true}], messages:[{id:'m5',sender:'client',senderName:'Chef Roberto (El Mezquite)',date:'2026-02-28T16:00:00',text:'Necesitamos 30 tablas de presentación con nuestro logo para el restaurante. ¿Nos pueden dar precio por volumen? Buscamos encino por durabilidad.'}], internalNotes:[] },
  // En negociación
  { id:'fq6', number:'COT-2026-138', date:'2026-02-20T11:00:00', validUntil:'2026-03-07', status:'en_negociacion', customer:{name:'Pedro Sánchez Morales',email:'pedro@empresa.mx',phone:'33-9876-5432',tier:'platino',points:28500,totalSpent:28500,orders:22}, projectName:'Regalos ejecutivos Q1', pieces:[{id:'p8',type:'Tabla charcutería',wood:'Parota',dimensions:{length:50,width:30,thickness:3},quantity:5,usage:'Evento / regalo corporativo',engraving:{type:'Logotipo',complexity:'Detallado',file:'logo-pedro.svg'},autoPrice:1200,adminPrice:1100,costEstimate:450},{id:'p9',type:'Caja personalizada',wood:'Nogal',dimensions:{length:25,width:18,thickness:10},quantity:5,usage:'Evento / regalo corporativo',engraving:{type:'Texto',complexity:'Intermedio',text:'Gracias por tu confianza'},autoPrice:850,adminPrice:800,costEstimate:320},{id:'p10',type:'Servicio de grabado',wood:'Otro' as WoodType,quantity:5,usage:'Evento / regalo corporativo',engraving:{type:'Logotipo',complexity:'Intermedio'},engravingMaterial:'Cuero',autoPrice:200,adminPrice:180,costEstimate:40},{id:'p11',type:'Tabla de picar',wood:'Encino',dimensions:{length:35,width:25,thickness:2.5},quantity:5,usage:'Evento / regalo corporativo',autoPrice:480,adminPrice:450,costEstimate:180},{id:'p12',type:'Plato decorativo',wood:'Parota',dimensions:{length:30,width:30,thickness:2},quantity:5,usage:'Evento / regalo corporativo',engraving:{type:'Texto',complexity:'Básico',text:'PSM'},autoPrice:750,adminPrice:700,costEstimate:280}], discount:{percent:8,reason:'Cliente Platino + Volumen'}, shippingIncluded:true,timeline:'3-4 semanas',validityDays:15,depositPercent:50, conditions:[{text:'Anticipo 50% para iniciar producción',checked:true},{text:'Saldo 50% al completar antes de envío',checked:true},{text:'Envío incluido en el precio',checked:true},{text:'Fotos de avance durante la producción',checked:true}], messages:[{id:'m6',sender:'client',senderName:'Pedro Sánchez',date:'2026-02-20T11:00:00',text:'Necesito un paquete de regalos ejecutivos para 5 clientes importantes.'},{id:'m7',sender:'admin',senderName:"DavidSon's Design",date:'2026-02-20T15:00:00',text:'¡Hola Pedro! Te preparé un desglose con descuento del 8%. ¿Qué te parece?'},{id:'m8',sender:'client',senderName:'Pedro Sánchez',date:'2026-02-21T09:00:00',text:'Se ve bien, ¿podemos cambiar las tablas de picar a nogal en vez de encino?'},{id:'m9',sender:'admin',senderName:"DavidSon's Design",date:'2026-02-21T14:00:00',text:'El cambio a nogal incrementa un poco. Te puedo dejar en $14,200. ¿Cerramos?'},{id:'m10',sender:'client',senderName:'Pedro Sánchez',date:'2026-02-28T08:30:00',text:'Déjame consultarlo con mi socio. Te confirmo hoy o mañana.'}], internalNotes:[{id:'n2',author:'David (Admin)',date:'2026-02-20T16:00:00',text:'Pedro es cliente frecuente Platino. Darle buen precio para mantener la relación.'}] },
  { id:'fq7', number:'COT-2026-135', date:'2026-02-18T10:00:00', validUntil:'2026-03-05', status:'en_negociacion', customer:{name:'María López Ruiz',email:'maria.lopez@empresa.mx',phone:'662-444-3322',tier:'plata',points:5800,totalSpent:5800,orders:7}, pieces:[{id:'p13',type:'Tabla charcutería',wood:'Nogal',dimensions:{length:55,width:30,thickness:3},quantity:1,usage:'Funcional (cocina)',engraving:{type:'Imagen personalizada',complexity:'Detallado',file:'mapa-mexico.svg'},autoPrice:1350,adminPrice:1400,costEstimate:520},{id:'p14',type:'Tabla de picar',wood:'Cedro',dimensions:{length:40,width:25,thickness:2.5},quantity:2,usage:'Funcional (cocina)',autoPrice:450,adminPrice:450,costEstimate:170}], shippingIncluded:false,timeline:'3-4 semanas',validityDays:15,depositPercent:50, conditions:[{text:'Anticipo 50% para iniciar producción',checked:true},{text:'Saldo 50% al completar antes de envío',checked:true},{text:'Fotos de avance durante la producción',checked:true}], messages:[{id:'m11',sender:'client',senderName:'María López',date:'2026-02-18T10:00:00',text:'Quiero una tabla con un mapa de México grabado y 2 tablas de picar.'},{id:'m12',sender:'admin',senderName:"DavidSon's Design",date:'2026-02-18T16:00:00',text:'¡Hola María! El grabado del mapa queda increíble en nogal. Te cotizo en $2,300.'},{id:'m13',sender:'client',senderName:'María López',date:'2026-02-27T12:00:00',text:'¿Puede ser con envío incluido? Si sí, acepto.'}], internalNotes:[] },
  { id:'fq8', number:'COT-2026-130', date:'2026-02-12T08:00:00', validUntil:'2026-02-27', status:'en_negociacion', customer:{name:'Corporativo Hermosillo SA',email:'compras@corphermosillo.mx',phone:'662-800-1234',tier:null,points:0,totalSpent:0,orders:0}, projectName:'Amenidades hotel boutique', pieces:[{id:'p15_0',type:'Tabla charcutería',wood:'Parota',dimensions:{length:50,width:30,thickness:3},quantity:20,usage:'Restaurante / volumen alto',engraving:{type:'Logotipo',complexity:'Básico',file:'logo-hotel.png'},autoPrice:980,adminPrice:900,costEstimate:350},{id:'p15_1',type:'Tabla de picar',wood:'Parota',dimensions:{length:35,width:25,thickness:2.5},quantity:20,usage:'Restaurante / volumen alto',engraving:{type:'Logotipo',complexity:'Básico',file:'logo-hotel.png'},autoPrice:520,adminPrice:480,costEstimate:190},{id:'p15_2',type:'Plato decorativo',wood:'Parota',dimensions:{length:25,width:25,thickness:2},quantity:20,usage:'Restaurante / volumen alto',engraving:{type:'Logotipo',complexity:'Básico',file:'logo-hotel.png'},autoPrice:650,adminPrice:600,costEstimate:240},{id:'p15_3',type:'Caja personalizada',wood:'Parota',dimensions:{length:20,width:15,thickness:10},quantity:20,usage:'Restaurante / volumen alto',engraving:{type:'Logotipo',complexity:'Básico',file:'logo-hotel.png'},autoPrice:780,adminPrice:720,costEstimate:280}], discount:{percent:10,reason:'B2B Volumen alto'}, shippingIncluded:true,timeline:'5-6 semanas',validityDays:15,depositPercent:50, conditions:[{text:'Anticipo 50% para iniciar producción',checked:true},{text:'Saldo 50% al completar antes de envío',checked:true},{text:'Envío incluido en el precio',checked:true}], messages:[{id:'m14',sender:'client',senderName:'Lic. Roberto Gámez',date:'2026-02-12T08:00:00',text:'Necesitamos amenidades de madera con el logo del hotel. Son 20 piezas de cada tipo.'},{id:'m15',sender:'admin',senderName:"DavidSon's Design",date:'2026-02-12T14:00:00',text:'Excelente proyecto. Le cotizo un paquete B2B con 10% de descuento.'},{id:'m16',sender:'client',senderName:'Lic. Roberto Gámez',date:'2026-02-15T10:00:00',text:'Necesitamos que el precio no exceda $45,000 antes de IVA.'},{id:'m17',sender:'admin',senderName:"DavidSon's Design",date:'2026-02-15T16:00:00',text:'Puedo ajustar a $46,000. Es nuestro mejor precio para este volumen.'},{id:'m18',sender:'client',senderName:'Lic. Roberto Gámez',date:'2026-02-25T11:00:00',text:'Disculpe la demora. Estamos en proceso de aprobación del presupuesto.'}], internalNotes:[{id:'n3',author:'David (Admin)',date:'2026-02-12T15:00:00',text:'Gran oportunidad B2B. No bajar de $46K.'}] },
  // Aprobadas
  { id:'fq9', number:'COT-2026-136', date:'2026-02-15T12:00:00', validUntil:'2026-03-02', status:'aprobada', customer:{name:'David Alejandro Perez Rea',email:'rocksagecapital@gmail.com',phone:'662-361-0742',tier:'oro',points:12340,totalSpent:12340,orders:14}, pieces:[{id:'p20',type:'Tabla charcutería',wood:'Parota',dimensions:{length:70,width:40,thickness:3.5},quantity:1,usage:'Evento / regalo corporativo',engraving:{type:'Combinación',complexity:'Detallado',text:'David & Sofia — 10 años',file:'aniversario.svg',zones:['Centro','Borde superior']},autoPrice:2850,adminPrice:2800,costEstimate:950}], shippingIncluded:false,timeline:'3 semanas',validityDays:15,depositPercent:50, conditions:[{text:'Anticipo 50% para iniciar producción',checked:true},{text:'Saldo 50% al completar antes de envío',checked:true}], messages:[{id:'m21',sender:'client',senderName:'David Perez',date:'2026-02-15T12:00:00',text:'Quiero una tabla grande de parota para nuestro aniversario.'},{id:'m22',sender:'admin',senderName:"DavidSon's Design",date:'2026-02-15T17:00:00',text:'Te cotizo en $2,800. ¿Te parece?'},{id:'m23',sender:'client',senderName:'David Perez',date:'2026-02-16T09:00:00',text:'¡Perfecto! Acepto. ¿Cómo hago el anticipo?'}], internalNotes:[] },
  { id:'fq10', number:'COT-2026-134', date:'2026-02-14T10:00:00', validUntil:'2026-03-01', status:'aprobada', customer:{name:'Ana García',email:'ana@email.com',phone:'',tier:'bronce',points:0,totalSpent:0,orders:0}, pieces:[{id:'p21',type:'Tabla decoración',wood:'Cedro',dimensions:{length:40,width:25,thickness:2},quantity:1,usage:'Decorativo',engraving:{type:'Texto',complexity:'Básico',text:'Hogar dulce hogar'},autoPrice:780,adminPrice:800,costEstimate:280}], shippingIncluded:false,timeline:'2-3 semanas',validityDays:15,depositPercent:50, conditions:[{text:'Anticipo 50% para iniciar producción',checked:true}], messages:[{id:'m24',sender:'client',senderName:'Ana García',date:'2026-02-14T10:00:00',text:'Quiero una tablita de cedro con "Hogar dulce hogar" grabado.'},{id:'m25',sender:'admin',senderName:"DavidSon's Design",date:'2026-02-14T14:00:00',text:'Te cotizo en $800. ¿Procedemos?'},{id:'m26',sender:'client',senderName:'Ana García',date:'2026-02-15T08:00:00',text:'Sí, acepto.'}], internalNotes:[] },
  // Anticipo recibido
  { id:'fq11', number:'COT-2026-132', date:'2026-02-10T09:00:00', validUntil:'2026-02-25', status:'anticipo_recibido', customer:{name:'Laura Martínez',email:'laura.m@gmail.com',phone:'55-4321-8765',tier:'plata',points:6200,totalSpent:6200,orders:8}, pieces:[{id:'p22',type:'Tabla charcutería',wood:'Nogal',dimensions:{length:55,width:35,thickness:3},quantity:3,usage:'Funcional (cocina)',engraving:{type:'Texto',complexity:'Intermedio',text:'Chef Laura'},autoPrice:1180,adminPrice:1200,costEstimate:450}], shippingIncluded:false,timeline:'3 semanas',validityDays:15,depositPercent:50, conditions:[{text:'Anticipo 50% para iniciar producción',checked:true},{text:'Saldo 50% al completar antes de envío',checked:true}], messages:[], internalNotes:[], depositPaid:{amount:2088,method:'Transferencia',ref:'TRF-20260218-001',date:'2026-02-18'} },
  // En producción
  { id:'fq12', number:'COT-2026-128', date:'2026-02-05T10:00:00', validUntil:'2026-02-20', status:'en_produccion', customer:{name:'Pedro Sánchez Morales',email:'pedro@empresa.mx',phone:'33-9876-5432',tier:'platino',points:28500,totalSpent:28500,orders:22}, projectName:'Set ejecutivo diciembre', pieces:[{id:'p23',type:'Tabla charcutería',wood:'Parota',dimensions:{length:60,width:35,thickness:3},quantity:1,usage:'Evento / regalo corporativo',autoPrice:1400,adminPrice:1300,costEstimate:500},{id:'p24',type:'Tabla de picar',wood:'Nogal',dimensions:{length:40,width:25,thickness:2.5},quantity:1,usage:'Evento / regalo corporativo',autoPrice:650,adminPrice:600,costEstimate:240},{id:'p25',type:'Caja personalizada',wood:'Cedro',dimensions:{length:25,width:18,thickness:10},quantity:1,usage:'Evento / regalo corporativo',engraving:{type:'Logotipo',complexity:'Detallado',file:'logo-psm.svg'},autoPrice:950,adminPrice:900,costEstimate:350},{id:'p26',type:'Servicio de grabado',wood:'Otro' as WoodType,quantity:1,usage:'Evento / regalo corporativo',engraving:{type:'Logotipo',complexity:'Intermedio'},engravingMaterial:'Cuero',autoPrice:200,adminPrice:180,costEstimate:40},{id:'p27',type:'Plato decorativo',wood:'Parota',dimensions:{length:30,width:30,thickness:2},quantity:1,usage:'Evento / regalo corporativo',autoPrice:780,adminPrice:720,costEstimate:280}], discount:{percent:10,reason:'Cliente Platino'}, shippingIncluded:true,timeline:'3-4 semanas',validityDays:15,depositPercent:50, conditions:[{text:'Anticipo 50% para iniciar producción',checked:true}], messages:[], internalNotes:[], depositPaid:{amount:1887,method:'Transferencia',ref:'TRF-20260210-002',date:'2026-02-10'}, productionProgress:{completed:3,total:5} },
  // Historial
  { id:'fq13', number:'COT-2026-120', date:'2026-01-20T10:00:00', validUntil:'2026-02-04', status:'completada', customer:{name:'Pedro Sánchez Morales',email:'pedro@empresa.mx',phone:'33-9876-5432',tier:'platino',points:28500,totalSpent:28500,orders:22}, pieces:[{id:'p28',type:'Tabla charcutería',wood:'Parota',dimensions:{length:50,width:30,thickness:3},quantity:3,usage:'Evento / regalo corporativo',autoPrice:1100,adminPrice:1050,costEstimate:400}], shippingIncluded:true,timeline:'3 semanas',validityDays:15,depositPercent:50, conditions:[],messages:[],internalNotes:[], closedDate:'2026-02-20', depositPaid:{amount:1732,method:'Transferencia',ref:'TRF-001',date:'2026-01-25'} },
  { id:'fq14', number:'COT-2026-118', date:'2026-01-15T09:00:00', validUntil:'2026-01-30', status:'rechazada', customer:{name:'Juan Rodríguez',email:'juan.r@outlook.com',phone:'662-999-1234',tier:'bronce',points:800,totalSpent:800,orders:1}, pieces:[{id:'p29',type:'Tabla de picar',wood:'Parota',dimensions:{length:45,width:30,thickness:3},quantity:1,usage:'Funcional (cocina)',engraving:{type:'Logotipo',complexity:'Detallado',file:'logo-juan.png'},autoPrice:1450,adminPrice:1500,costEstimate:550}], shippingIncluded:false,timeline:'3-4 semanas',validityDays:15,depositPercent:50, conditions:[],messages:[],internalNotes:[], rejectionReason:'Precio alto', closedDate:'2026-02-15' },
  { id:'fq15', number:'COT-2026-115', date:'2026-01-10T14:00:00', validUntil:'2026-01-25', status:'vencida', customer:{name:'Laura Martínez',email:'laura.m@gmail.com',phone:'55-4321-8765',tier:'plata',points:6200,totalSpent:6200,orders:8}, pieces:[{id:'p30',type:'Tabla decoración',wood:'Cedro',dimensions:{length:50,width:35,thickness:2.5},quantity:2,usage:'Decorativo',autoPrice:1050,adminPrice:1100,costEstimate:400}], shippingIncluded:false,timeline:'4 semanas',validityDays:15,depositPercent:50, conditions:[],messages:[],internalNotes:[], closedDate:'2026-02-10' },
  { id:'fq16', number:'COT-2026-112', date:'2026-01-05T11:00:00', validUntil:'2026-01-20', status:'cancelada', customer:{name:'Carlos Ramírez',email:'carlos@corp.com',phone:'33-1234-5678',tier:'oro',points:9800,totalSpent:9800,orders:11}, pieces:[{id:'p31',type:'Servicio de grabado',wood:'Otro' as WoodType,quantity:50,usage:'Evento / regalo corporativo',engraving:{type:'Logotipo',complexity:'Básico'},engravingMaterial:'Acrílico',autoPrice:180,adminPrice:150,costEstimate:35}], shippingIncluded:false,timeline:'2 semanas',validityDays:15,depositPercent:50, conditions:[],messages:[],internalNotes:[], rejectionReason:'Cambió de opinión', closedDate:'2026-01-18' },
  { id:'fq17', number:'COT-2026-110', date:'2026-01-02T10:00:00', validUntil:'2026-01-17', status:'completada', customer:{name:'Elena Vargas',email:'elena.v@hotmail.com',phone:'81-5555-1234',tier:null,points:0,totalSpent:0,orders:0}, pieces:[{id:'p32',type:'Plato decorativo',wood:'Encino',dimensions:{length:30,width:30,thickness:2},quantity:1,usage:'Decorativo',autoPrice:680,adminPrice:700,costEstimate:250}], shippingIncluded:false,timeline:'2 semanas',validityDays:15,depositPercent:50, conditions:[],messages:[],internalNotes:[], closedDate:'2026-01-28', depositPaid:{amount:406,method:'MercadoPago',ref:'MP-001',date:'2026-01-05'} },
];

// ---------- ACTIVITY FEED ----------
export interface ActivityItem {
  id: string;
  type: 'order' | 'review' | 'stock' | 'quote' | 'customer';
  title: string;
  description: string;
  time: string;
  icon: string;
}

export const activityFeed: ActivityItem[] = [
  { id: 'a1', type: 'order', title: 'Nuevo pedido #DSD-0015', description: 'David Pérez — $3,841.40 MXN', time: 'Hace 2h', icon: 'shopping-bag' },
  { id: 'a2', type: 'review', title: 'Review 5★', description: 'En Tabla Parota Rústica por David Pérez', time: 'Hace 5h', icon: 'star' },
  { id: 'a3', type: 'stock', title: 'Stock bajo', description: 'Set Cuchillos Queso Artesanal (2 unidades)', time: 'Hace 1d', icon: 'alert-triangle' },
  { id: 'a4', type: 'quote', title: 'Nueva cotización', description: 'María López — Mesa de centro en Parota', time: 'Hace 1d', icon: 'file-text' },
  { id: 'a5', type: 'customer', title: 'Nuevo registro', description: 'Elena Vargas se registró en la tienda', time: 'Hace 2d', icon: 'user-plus' },
  { id: 'a6', type: 'order', title: 'Pedido entregado', description: '#DSD-0012 — Ana Torres confirmó recepción', time: 'Hace 3d', icon: 'check-circle' },
];

// ---------- SALES CHART DATA ----------
export const salesChartData = [
  { day: '22 Feb', revenue: 4800, orders: 2, prevRevenue: 3200 },
  { day: '23 Feb', revenue: 6500, orders: 3, prevRevenue: 5100 },
  { day: '24 Feb', revenue: 5115, orders: 2, prevRevenue: 4800 },
  { day: '25 Feb', revenue: 1274, orders: 1, prevRevenue: 2200 },
  { day: '26 Feb', revenue: 6088, orders: 2, prevRevenue: 3800 },
  { day: '27 Feb', revenue: 3340, orders: 1, prevRevenue: 4500 },
  { day: '28 Feb', revenue: 3841, orders: 1, prevRevenue: 2900 },
];

// ---------- FINANCIAL DATA (RICH) ----------
export const financialData = {
  grossRevenue: 142800, cogs: 57120, grossProfit: 85680, grossMargin: 60.0, netProfit: 38420,
  inventoryCostValue: 45800, inventorySaleValue: 92400, inventoryUnits: 48,
  grossRevenueDelta: 18, cogsDelta: 15, grossProfitDelta: 22, grossMarginDelta: 1.5, netProfitDelta: 25,
  revenueBySource: [
    { name: 'Ventas catálogo', value: 118400, pct: 83.0 },
    { name: 'Cotizaciones', value: 18200, pct: 12.7 },
    { name: 'Grabado láser', value: 6200, pct: 4.3 },
  ],
  costBreakdownPL: [
    { name: 'COGS', value: 57120, pct: 40.0 },
    { name: 'Costos operativos', value: 25148, pct: 17.6 },
    { name: 'Envío absorbido', value: 8400, pct: 5.9 },
    { name: 'Descuentos/cupones', value: 8200, pct: 5.7 },
    { name: 'Comisiones Stripe', value: 3850, pct: 2.7 },
    { name: 'Comisiones MercadoPago', value: 1240, pct: 0.9 },
    { name: 'Puntos canjeados', value: 422, pct: 0.3 },
  ],
  waterfallData: [
    { name: 'Ingresos', value: 142800, fill: '#C5A065', type: 'income' },
    { name: 'COGS', value: -57120, fill: '#5D4037', type: 'cost' },
    { name: 'Envío', value: -8400, fill: '#795548', type: 'cost' },
    { name: 'Comisiones', value: -5090, fill: '#8D6E63', type: 'cost' },
    { name: 'Descuentos', value: -8622, fill: '#A1887F', type: 'cost' },
    { name: 'Operativos', value: -25148, fill: '#BCAAA4', type: 'cost' },
    { name: 'G. Neta', value: 38420, fill: '#22c55e', type: 'profit' },
  ],
  monthlyRevenue: [
    { month: 'Mar', revenue: 72000, costs: 29000, grossProfit: 43000, netProfit: 18200, marginPct: 59.7 },
    { month: 'Abr', revenue: 68000, costs: 27500, grossProfit: 40500, netProfit: 16800, marginPct: 59.6 },
    { month: 'May', revenue: 95000, costs: 38000, grossProfit: 57000, netProfit: 25400, marginPct: 60.0 },
    { month: 'Jun', revenue: 82000, costs: 33000, grossProfit: 49000, netProfit: 21000, marginPct: 59.8 },
    { month: 'Jul', revenue: 78000, costs: 31500, grossProfit: 46500, netProfit: 19800, marginPct: 59.6 },
    { month: 'Ago', revenue: 88000, costs: 35200, grossProfit: 52800, netProfit: 23100, marginPct: 60.0 },
    { month: 'Sep', revenue: 68000, costs: 28000, grossProfit: 40000, netProfit: 16500, marginPct: 58.8 },
    { month: 'Oct', revenue: 82000, costs: 33000, grossProfit: 49000, netProfit: 21200, marginPct: 59.8 },
    { month: 'Nov', revenue: 95000, costs: 38000, grossProfit: 57000, netProfit: 25800, marginPct: 60.0 },
    { month: 'Dic', revenue: 142000, costs: 52000, grossProfit: 90000, netProfit: 42500, marginPct: 63.4 },
    { month: 'Ene', revenue: 88000, costs: 35000, grossProfit: 53000, netProfit: 23400, marginPct: 60.2 },
    { month: 'Feb', revenue: 142800, costs: 57120, grossProfit: 85680, netProfit: 38420, marginPct: 60.0 },
  ],
  avgTicket: 881, totalOrders: 162, dailyRevenueAvg: 4680,
  avgTicketPrev: 839, totalOrdersPrev: 140, dailyRevenueAvgPrev: 4060,
  clv: 1240, clvPrev: 1060, repurchaseRate: 32, repurchaseRatePrev: 29,
  avgQuoteTicket: 3800, discountRate: 5.7, totalDiscounts: 8200,
  avgShippingCost: 285, avgShippingCostPrev: 273, engravingRevenue: 6200, engravingPct: 4.3,
  revenueByCategory: [
    { name: 'Tablas Cortar', value: 88500, pct: 62 },
    { name: 'Sets', value: 31400, pct: 22 },
    { name: 'Grabado', value: 11400, pct: 8 },
    { name: 'Cotizaciones', value: 8600, pct: 6 },
    { name: 'Servicios', value: 2900, pct: 2 },
  ],
  revenueByPayment: [
    { name: 'Stripe', value: 102800, pct: 72 },
    { name: 'MercadoPago', value: 28560, pct: 20 },
    { name: 'Transferencia', value: 11440, pct: 8 },
  ],
  revenueByClientType: [
    { name: 'Oro+Platino', value: 67100, pct: 47 },
    { name: 'Plata', value: 44300, pct: 31 },
    { name: 'Bronce', value: 31400, pct: 22 },
  ],
  projection: [
    { month: 'Feb (real)', min: 142800, max: 142800, central: 142800, isActual: true },
    { month: 'Mar', min: 148000, max: 165000, central: 156500 },
    { month: 'Abr', min: 135000, max: 155000, central: 145000 },
    { month: 'May', min: 160000, max: 185000, central: 172500 },
  ],
  projectionNotes: ['Marzo: incluye $48,200 de cotizaciones aprobadas', 'Mayo: Día de las Madres impulsa ventas'],
  dailyRevenue: [
    { day: '1', revenue: 4200, orders: 5, flashSale: false, campaign: false },
    { day: '2', revenue: 5800, orders: 7, flashSale: false, campaign: false },
    { day: '3', revenue: 3100, orders: 3, flashSale: false, campaign: false },
    { day: '4', revenue: 6200, orders: 8, flashSale: false, campaign: true },
    { day: '5', revenue: 4600, orders: 5, flashSale: false, campaign: false },
    { day: '6', revenue: 7800, orders: 9, flashSale: false, campaign: false },
    { day: '7', revenue: 5200, orders: 6, flashSale: false, campaign: false },
    { day: '8', revenue: 3400, orders: 4, flashSale: false, campaign: false },
    { day: '9', revenue: 5100, orders: 6, flashSale: false, campaign: false },
    { day: '10', revenue: 4900, orders: 5, flashSale: false, campaign: false },
    { day: '11', revenue: 6400, orders: 7, flashSale: false, campaign: false },
    { day: '12', revenue: 3800, orders: 4, flashSale: false, campaign: false },
    { day: '13', revenue: 4200, orders: 5, flashSale: false, campaign: false },
    { day: '14', revenue: 8900, orders: 11, flashSale: true, campaign: true },
    { day: '15', revenue: 7200, orders: 9, flashSale: false, campaign: false },
    { day: '16', revenue: 5400, orders: 6, flashSale: false, campaign: false },
    { day: '17', revenue: 4100, orders: 5, flashSale: false, campaign: false },
    { day: '18', revenue: 3600, orders: 4, flashSale: false, campaign: false },
    { day: '19', revenue: 5300, orders: 6, flashSale: false, campaign: false },
    { day: '20', revenue: 6100, orders: 7, flashSale: false, campaign: false },
    { day: '21', revenue: 4800, orders: 5, flashSale: true, campaign: false },
    { day: '22', revenue: 3900, orders: 4, flashSale: false, campaign: false },
    { day: '23', revenue: 5600, orders: 6, flashSale: false, campaign: false },
    { day: '24', revenue: 4400, orders: 5, flashSale: false, campaign: false },
    { day: '25', revenue: 3200, orders: 3, flashSale: false, campaign: false },
    { day: '26', revenue: 6100, orders: 7, flashSale: false, campaign: false },
    { day: '27', revenue: 3300, orders: 4, flashSale: false, campaign: false },
    { day: '28', revenue: 3800, orders: 4, flashSale: false, campaign: false },
  ],
  topProductsByRevenue: [
    { rank: 1, product: 'Set 3 Tablas Artesanales', units: 18, revenue: 53820, pct: 37.7, margin: 62, trend: 28, trendDir: 'up' as const },
    { rank: 2, product: 'Tabla Parota Charcutería Gde', units: 22, revenue: 24200, pct: 16.9, margin: 60, trend: 15, trendDir: 'up' as const },
    { rank: 3, product: 'Tabla Parota Charcutería Med', units: 28, revenue: 23800, pct: 16.7, margin: 60, trend: 2, trendDir: 'flat' as const },
    { rank: 4, product: 'Tabla Rosa Morada Gourmet', units: 8, revenue: 13200, pct: 9.2, margin: 65, trend: 45, trendDir: 'up' as const },
    { rank: 5, product: 'Tabla Cedro Rojo Grande', units: 10, revenue: 12000, pct: 8.4, margin: 58, trend: -8, trendDir: 'down' as const },
    { rank: 6, product: 'Grabado Láser (servicio)', units: 45, revenue: 6200, pct: 4.3, margin: 82, trend: 22, trendDir: 'up' as const },
    { rank: 7, product: 'Tabla Nogal Mediana', units: 5, revenue: 4750, pct: 3.3, margin: 55, trend: 0, trendDir: 'new' as const },
  ],
  revenueBySubCategory: [
    { name: 'Tablas para Cortar', total: 88500, pct: 62, sub: [{ name: 'Charcutería', value: 48000, pct: 54 }, { name: 'Cocina', value: 24500, pct: 28 }, { name: 'Decorativas', value: 16000, pct: 18 }] },
    { name: 'Sets y Colecciones', total: 31400, pct: 22 },
    { name: 'Servicios (Grabado)', total: 11400, pct: 8 },
    { name: 'Cotizaciones custom', total: 8600, pct: 6 },
    { name: 'Accesorios', total: 2900, pct: 2 },
  ],
  revenueByChannel: [
    { name: 'Tienda online (orgánico)', value: 98400, pct: 68.9 },
    { name: 'Tienda online (marketing)', value: 18200, pct: 12.7, note: 'cupones, flash, campañas' },
    { name: 'Cotizaciones', value: 18200, pct: 12.7 },
    { name: 'Referidos', value: 8000, pct: 5.6 },
  ],
  revenueByRegion: [
    { name: 'Hermosillo (local)', value: 42800, pct: 30, avgShipping: 99 },
    { name: 'CDMX', value: 34200, pct: 24, avgShipping: 310 },
    { name: 'Guadalajara', value: 18500, pct: 13, avgShipping: 285 },
    { name: 'Monterrey', value: 14200, pct: 10, avgShipping: 320 },
    { name: 'Resto del país', value: 33100, pct: 23, avgShipping: 340 },
  ],
  engravingStats: { ordersWithEngraving: 65, totalOrders: 162, pct: 40.1, avgIncrease: 345, additionalRevenue: 22425, additionalPct: 15.7, engravingMargin: 82 },
  cogsByProduct: [
    { product: 'Set 3 Tablas', units: 18, costUnit: 1196, costTotal: 21528, pctCogs: 37.7, margin: 60 },
    { product: 'Tabla Parota Med', units: 28, costUnit: 340, costTotal: 9520, pctCogs: 16.7, margin: 60 },
    { product: 'Tabla Parota Gde', units: 22, costUnit: 440, costTotal: 9680, pctCogs: 16.9, margin: 60 },
    { product: 'Tabla Rosa Morada', units: 8, costUnit: 580, costTotal: 4640, pctCogs: 8.1, margin: 65 },
    { product: 'Tabla Cedro Rojo Gde', units: 10, costUnit: 480, costTotal: 4800, pctCogs: 8.4, margin: 60 },
    { product: 'Grabado Láser (insumos)', units: 45, costUnit: 25, costTotal: 1125, pctCogs: 2.0, margin: 82 },
    { product: 'Otros', units: 31, costUnit: 0, costTotal: 5827, pctCogs: 10.2, margin: 0 },
  ],
  operatingCosts: [
    { concept: 'Mano de obra (taller)', cost: 12000, type: 'Fijo' as const, notes: '2 artesanos' },
    { concept: 'Materia prima (madera)', cost: 6500, type: 'Variable' as const, notes: 'Stock del mes' },
    { concept: 'Alquiler taller', cost: 3500, type: 'Fijo' as const, notes: 'Hermosillo' },
    { concept: 'Hosting y servicios web', cost: 1248, type: 'Fijo' as const, notes: 'Desglose abajo' },
    { concept: 'Insumos (aceite, lija)', cost: 800, type: 'Variable' as const, notes: '' },
    { concept: 'Empaque y materiales', cost: 600, type: 'Variable' as const, notes: '' },
    { concept: 'Otros', cost: 500, type: 'Variable' as const, notes: '' },
  ],
  webServices: [
    { service: 'DigitalOcean (Medusa backend)', cost: 600, plan: 'App Platform', active: true },
    { service: 'Vercel (frontend)', cost: 0, plan: 'Free tier', active: true },
    { service: 'Neon (PostgreSQL)', cost: 0, plan: 'Free tier', active: true },
    { service: 'Supabase (Auth)', cost: 0, plan: 'Free tier', active: true },
    { service: 'Cloudflare (DNS)', cost: 0, plan: 'Free', active: true },
    { service: 'Dominio davidsonsdesign.com', cost: 148, plan: 'Anual /12', active: true },
    { service: 'Stripe', cost: 0, plan: 'Solo comisiones', active: true },
    { service: 'MercadoPago', cost: 0, plan: 'Solo comisiones', active: true },
    { service: 'Envia.com (API envíos)', cost: 500, plan: 'Plan básico', active: true },
  ],
  shippingCostsByCarrier: [
    { carrier: 'DHL Express', shipments: 42, totalCost: 15540, avgCost: 370, charged: 14280, diff: -1260 },
    { carrier: 'Estafeta', shipments: 38, totalCost: 10640, avgCost: 280, charged: 10640, diff: 0 },
    { carrier: 'FedEx', shipments: 28, totalCost: 9240, avgCost: 330, charged: 9240, diff: 0 },
    { carrier: 'Uber Flash', shipments: 54, totalCost: 5346, avgCost: 99, charged: 5346, diff: 0 },
    { carrier: 'Envío gratis', shipments: 18, totalCost: 5400, avgCost: 300, charged: 0, diff: -5400 },
  ],
  discountsBySource: [
    { source: 'BIENVENIDO10', uses: 42, discounted: 2840, salesGenerated: 28400, roi: 10.0 },
    { source: 'VIP15', uses: 12, discounted: 2730, salesGenerated: 18200, roi: 6.7 },
    { source: 'Flash Friday', uses: 18, discounted: 1230, salesGenerated: 12240, roi: 10.0 },
    { source: 'ENVIOGRATIS', uses: 35, discounted: 1400, salesGenerated: 15800, roi: 11.3 },
  ],
  totalCostDonut: [
    { name: 'COGS', value: 57120, pct: 55 },
    { name: 'Costos operativos', value: 25148, pct: 24 },
    { name: 'Costos de envío', value: 8400, pct: 8 },
    { name: 'Descuentos/cupones', value: 8200, pct: 8 },
    { name: 'Comisiones de pago', value: 5090, pct: 5 },
    { name: 'Puntos canjeados', value: 422, pct: 0.4 },
  ],
  inventoryByCategory: [
    { category: 'Tablas para Cortar', products: 8, units: 82, costValue: 32800, saleValue: 66200, pct: 71.6 },
    { category: 'Sets y Colecciones', products: 3, units: 12, costValue: 8600, saleValue: 17400, pct: 18.8 },
    { category: 'Accesorios', products: 2, units: 15, costValue: 2400, saleValue: 4800, pct: 5.2 },
    { category: 'Servicios', products: 1, units: 999, costValue: 2000, saleValue: 4000, pct: 4.4 },
  ],
  inventoryByProduct: [
    { product: 'Set 3 Tablas', stock: 5, costUnit: 1196, costValue: 5980, rotation: 6.2, rotLevel: 'green' as const, daysStock: 58, alert: '' },
    { product: 'Tabla Parota Med', stock: 15, costUnit: 340, costValue: 5100, rotation: 4.8, rotLevel: 'green' as const, daysStock: 76, alert: '' },
    { product: 'Tabla Parota Gde', stock: 8, costUnit: 440, costValue: 3520, rotation: 5.2, rotLevel: 'green' as const, daysStock: 70, alert: '' },
    { product: 'Tabla Rosa Morada', stock: 2, costUnit: 580, costValue: 1160, rotation: 7.1, rotLevel: 'green' as const, daysStock: 51, alert: 'low' },
    { product: 'Tabla Cedro Rojo Gde', stock: 8, costUnit: 480, costValue: 3840, rotation: 2.8, rotLevel: 'yellow' as const, daysStock: 130, alert: '' },
    { product: 'Tabla Nogal Med', stock: 20, costUnit: 380, costValue: 7600, rotation: 0.5, rotLevel: 'red' as const, daysStock: 730, alert: 'slow' },
    { product: 'Mini Tabla Parota', stock: 20, costUnit: 180, costValue: 3600, rotation: 2.2, rotLevel: 'yellow' as const, daysStock: 166, alert: '' },
    { product: 'Set 3 Tablas Colores', stock: 0, costUnit: 1400, costValue: 0, rotation: 0, rotLevel: 'red' as const, daysStock: 0, alert: 'out' },
  ],
  inventoryRotation: 3.8, inventoryLowStock: 3, inventoryOutOfStock: 1,
  stuckCapital: 11200, stuckCapitalPct: 24.5,
  inventoryHistory: [
    { month: 'Mar', costValue: 38000, saleValue: 76000 }, { month: 'Abr', costValue: 35000, saleValue: 70000 },
    { month: 'May', costValue: 42000, saleValue: 84000 }, { month: 'Jun', costValue: 40000, saleValue: 80000 },
    { month: 'Jul', costValue: 38000, saleValue: 76000 }, { month: 'Ago', costValue: 44000, saleValue: 88000 },
    { month: 'Sep', costValue: 41000, saleValue: 82000 }, { month: 'Oct', costValue: 43000, saleValue: 86000 },
    { month: 'Nov', costValue: 46000, saleValue: 92000 }, { month: 'Dic', costValue: 32000, saleValue: 64000 },
    { month: 'Ene', costValue: 39000, saleValue: 78000 }, { month: 'Feb', costValue: 45800, saleValue: 92400 },
  ],
  stripe: { transactions: 118, processed: 102800, commission: 3850, effectiveRate: 3.74, avgPerTransaction: 32.63, transferred: 98950, nextTransfer: '2 Mar 2026', nextTransferEst: 4200,
    cardBreakdown: [{ type: 'Visa', pct: 52 }, { type: 'Mastercard', pct: 38 }, { type: 'Amex', pct: 8 }, { type: 'Otra', pct: 2 }] },
  mercadoPago: { transactions: 34, processed: 28560, commission: 1240, effectiveRate: 4.34, avgPerTransaction: 36.47, available: 27320, nextRelease: 'Inmediata',
    methodBreakdown: [{ type: 'Tarjeta débito', pct: 45 }, { type: 'Tarjeta crédito', pct: 35 }, { type: 'OXXO', pct: 12 }, { type: 'SPEI', pct: 8 }] },
  bankTransfer: { transactions: 8, received: 11440, commission: 0, pendingAdvances: 28400, pendingBalances: 15428, totalReceivable: 43828 },
  pendingPayments: [
    { ref: 'COT-2026-142', client: 'David Pérez', amount: 15428, type: 'anticipo' as const, date: '26 Feb', status: 'Aprobada' },
    { ref: 'COT-2026-141', client: 'Ana García', amount: 1087, type: 'anticipo' as const, date: '25 Feb', status: 'Aprobada' },
    { ref: 'COT-2026-138', client: 'Pedro Sánchez', amount: 11885, type: 'anticipo' as const, date: '28 Feb', status: 'Aprobada' },
    { ref: 'COT-2026-128', client: 'Pedro Sánchez', amount: 15428, type: 'saldo' as const, date: '20 Feb', status: 'Entregado' },
  ],
  refunds: { count: 2, total: 1850, rate: 1.2, reasons: ['Producto dañado', 'Cambió de opinión'] },
  totalCommissions: 5090, totalCommissionsPct: 3.56,
  cashFlowEntries: 142800, cashFlowExits: 104380, cashFlowNet: 38420,
  cashFlowEntriesDelta: 18, cashFlowExitsDelta: 14, cashFlowNetDelta: 25,
  cashFlowWeekly: [
    { week: 'Sem 1', entries: 38000, exits: 26000, netCumulative: 12000 },
    { week: 'Sem 2', entries: 32000, exits: 24000, netCumulative: 20000 },
    { week: 'Sem 3', entries: 42000, exits: 28000, netCumulative: 34000 },
    { week: 'Sem 4', entries: 30800, exits: 26380, netCumulative: 38420 },
  ],
  cashFlowEntriesDetail: [
    { source: 'Ventas catálogo (Stripe)', amount: 102800, pct: 72.0, freq: 'Diaria (cont.)' },
    { source: 'Ventas catálogo (MercadoPago)', amount: 28560, pct: 20.0, freq: 'Diaria (cont.)' },
    { source: 'Anticipos cotizaciones', amount: 8240, pct: 5.8, freq: 'Irregular' },
    { source: 'Saldos cotizaciones', amount: 3200, pct: 2.2, freq: 'Al completar' },
  ],
  cashFlowExitsDetail: [
    { concept: 'Impuestos (IVA, ISR est.)', amount: 55376, pct: 53.1, freq: 'Mensual/bimestral' },
    { concept: 'Pago a carriers (envíos)', amount: 18766, pct: 18.0, freq: 'Semanal/fact.' },
    { concept: 'Mano de obra', amount: 12000, pct: 11.5, freq: 'Quincenal (nómina)' },
    { concept: 'Materia prima (madera)', amount: 6500, pct: 6.2, freq: 'Quincenal' },
    { concept: 'Comisiones Stripe', amount: 3850, pct: 3.7, freq: 'Se descuenta auto' },
    { concept: 'Alquiler taller', amount: 3500, pct: 3.4, freq: 'Mensual (día 1)' },
    { concept: 'Comisiones MercadoPago', amount: 1240, pct: 1.2, freq: 'Se descuenta auto' },
    { concept: 'Servicios web', amount: 1248, pct: 1.2, freq: 'Mensual' },
    { concept: 'Insumos', amount: 800, pct: 0.8, freq: 'Según necesidad' },
    { concept: 'Empaque', amount: 600, pct: 0.6, freq: 'Según necesidad' },
    { concept: 'Otros', amount: 500, pct: 0.5, freq: 'Variable' },
  ],
  upcomingPayments: [
    { date: '1 Mar', concept: 'Alquiler taller', amount: 3500, type: 'Fijo mensual', paid: true },
    { date: '5 Mar', concept: 'Pago DHL (factura Feb)', amount: 8200, type: 'Variable', paid: false },
    { date: '7 Mar', concept: 'Pago Estafeta (Feb)', amount: 5400, type: 'Variable', paid: false },
    { date: '10 Mar', concept: 'Nómina artesanos (1ra Q)', amount: 6000, type: 'Fijo quincenal', paid: false },
    { date: '15 Mar', concept: 'DigitalOcean', amount: 600, type: 'Fijo mensual', paid: false },
    { date: '17 Mar', concept: 'Declaración IVA Feb', amount: 18400, type: 'Mensual', paid: false },
    { date: '25 Mar', concept: 'Nómina artesanos (2da Q)', amount: 6000, type: 'Fijo quincenal', paid: false },
  ],
  currentBalance: 42300, upcomingTotal: 48100, projectedDeficit: -5800,
  cashFlowProjection: [
    { day: '1 Mar', balance: 42300 }, { day: '5 Mar', balance: 38800 }, { day: '7 Mar', balance: 35400 },
    { day: '10 Mar', balance: 34200 }, { day: '15 Mar', balance: 33600 }, { day: '17 Mar', balance: 15200 },
    { day: '20 Mar', balance: 22800 }, { day: '25 Mar', balance: 16800 }, { day: '30 Mar', balance: 24500 },
  ],
  predefinedReports: [
    { id: 'r1', name: 'Estado de Resultados (P&L)', desc: 'Ingresos, costos, gastos y ganancia neta', icon: 'chart', formats: ['PDF', 'Excel'] },
    { id: 'r2', name: 'Reporte de Ventas', desc: 'Detalle de cada venta con producto, precio, costo, margen', icon: 'dollar', formats: ['PDF', 'Excel', 'CSV'] },
    { id: 'r3', name: 'Reporte de Inventario', desc: 'Stock actual, valor a costo, valor a venta, rotación', icon: 'package', formats: ['PDF', 'Excel'] },
    { id: 'r4', name: 'Reporte de Pagos y Comisiones', desc: 'Transacciones por procesador, comisiones, neto recibido', icon: 'bank', formats: ['PDF', 'Excel'] },
    { id: 'r5', name: 'Reporte de Flujo de Efectivo', desc: 'Entradas, salidas, saldo, proyección', icon: 'flow', formats: ['PDF', 'Excel'] },
    { id: 'r6', name: 'Reporte de Descuentos y Marketing', desc: 'Cupones usados, descuentos otorgados, ROI por canal', icon: 'tag', formats: ['PDF', 'Excel'] },
    { id: 'r7', name: 'Reporte para Contador (pre-CFDI)', desc: 'Ventas desglosadas con IVA, comisiones, gastos deducibles', icon: 'receipt', formats: ['Excel'] },
  ],
  scheduledReports: [
    { name: 'Reporte semanal de ventas', freq: 'Cada lunes', email: 'admin@davidsonsdesign.com', active: true },
    { name: 'P&L mensual', freq: 'Día 1 de cada mes', email: 'contador@email.com', active: true },
    { name: 'Reporte de inventario semanal', freq: 'Cada viernes', email: '', active: false },
  ],
  reportHistory: [
    { name: 'P&L Febrero 2026', period: 'Feb 2026', generated: '1 Mar, 08:00', format: 'PDF' },
    { name: 'Ventas Febrero 2026', period: 'Feb 2026', generated: '1 Mar, 08:00', format: 'Excel' },
    { name: 'Inventario 28 Feb', period: 'Snapshot', generated: '28 Feb, 23:59', format: 'PDF' },
    { name: 'Reporte Contador Feb', period: 'Feb 2026', generated: '1 Mar, 08:00', format: 'Excel' },
  ],
  shippingCosts: 8400, paymentCommissions: 5090,
};

// ---------- NOTIFICATIONS ----------
export interface AdminNotification {
  id: string;
  type: 'order' | 'stock' | 'review' | 'quote' | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export const notifications: AdminNotification[] = [
  { id: 'not1', type: 'order', title: 'Nuevo pedido recibido', description: '#DSD-0015 — David Pérez — $3,841.40', time: 'Hace 2h', read: false },
  { id: 'not2', type: 'review', title: 'Nuevo review pendiente', description: 'Carlos Ramírez dejó un review en Tabla Nogal Premium', time: 'Hace 5h', read: false },
  { id: 'not3', type: 'stock', title: 'Alerta de stock bajo', description: 'Set Cuchillos Queso Artesanal: 2 unidades restantes', time: 'Hace 1d', read: false },
  { id: 'not4', type: 'quote', title: 'Cotización sin responder', description: 'María López espera respuesta desde hace 1 día', time: 'Hace 1d', read: true },
  { id: 'not5', type: 'system', title: 'Backup completado', description: 'El respaldo diario se realizó correctamente', time: 'Hace 2d', read: true },
];

// ---------- MARKETING DATA ----------
export type CouponStatus = 'active' | 'scheduled' | 'paused' | 'expired' | 'disabled' | 'auto';
export type CouponType = 'percentage' | 'fixed' | 'free_shipping' | 'buyget';
export type CouponTarget = 'order' | 'products' | 'categories' | 'collections' | 'shipping';

export interface Coupon {
  id: string;
  code: string;
  internalName: string;
  type: CouponType;
  value: number;
  buygetConfig?: { buyQty: number; getQty: number; category: string };
  target: CouponTarget;
  targetLabel: string;
  usesCount: number;
  usesLimit: number | null;
  usesPerCustomer: number | null;
  minPurchase: number | null;
  maxDiscount: number | null;
  isAutomatic: boolean;
  customerRestriction: string;
  startDate: string | null;
  endDate: string | null;
  status: CouponStatus;
  combinable: boolean;
  revenue: number;
  roi: number;
  avgTicket: number;
}

export interface EmailCampaign {
  id: string;
  name: string;
  segment: string;
  sentCount: number | null;
  openRate: number | null;
  clickRate: number | null;
  revenue: number | null;
  status: 'sent' | 'scheduled' | 'draft';
  scheduledDate?: string;
  subject: string;
  couponCode?: string;
}

export interface SiteBanner {
  id: string;
  title: string;
  subtitle: string;
  location: 'hero' | 'announcement' | 'category' | 'checkout';
  categoryName?: string;
  link: string;
  status: 'active' | 'paused' | 'scheduled';
  startDate?: string;
  endDate?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  revenueAttrib: number;
  position: number;
  bgColor?: string;
  textColor?: string;
}

export interface FlashSale {
  id: string;
  name: string;
  discountType: 'percentage' | 'fixed' | 'buyget';
  discountValue: number;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'completed';
  salesCount: number;
  revenue: number;
  visits: number;
  conversion: number;
  products: { name: string; originalPrice: number; flashPrice: number; margin: number }[];
  stockLimit: number | null;
  perCustomerLimit: number | null;
}

export interface Referral {
  id: string;
  date: string;
  referrerName: string;
  referredName: string;
  status: 'purchased' | 'registered' | 'link_visited';
  purchaseAmount: number | null;
  rewardPoints: number;
  rewardStatus: 'credited' | 'pending';
}

export interface TopReferrer {
  rank: number;
  name: string;
  tier: string;
  linksShared: number;
  registrations: number;
  purchases: number;
  pointsEarned: number;
}

export const mockCoupons: Coupon[] = [
  { id: 'c1', code: 'BIENVENIDO10', internalName: 'Descuento bienvenida nuevos clientes', type: 'percentage', value: 10, target: 'order', targetLabel: 'Todo pedido', usesCount: 42, usesLimit: null, usesPerCustomer: 1, minPurchase: null, maxDiscount: 500, isAutomatic: false, customerRestriction: 'Nuevos clientes', startDate: null, endDate: null, status: 'active', combinable: true, revenue: 28400, roi: 10.0, avgTicket: 676 },
  { id: 'c2', code: 'NAVIDAD25', internalName: 'Navidad 2025', type: 'percentage', value: 25, target: 'order', targetLabel: 'Todo pedido', usesCount: 128, usesLimit: 200, usesPerCustomer: 1, minPurchase: 500, maxDiscount: 1000, isAutomatic: false, customerRestriction: 'Todos', startDate: '2025-12-01', endDate: '2025-12-31', status: 'expired', combinable: false, revenue: 45200, roi: 4.0, avgTicket: 353 },
  { id: 'c3', code: 'ENVIOGRATIS', internalName: 'Envío gratis febrero', type: 'free_shipping', value: 100, target: 'shipping', targetLabel: 'Envío', usesCount: 35, usesLimit: 50, usesPerCustomer: 2, minPurchase: 2500, maxDiscount: null, isAutomatic: false, customerRestriction: 'Todos', startDate: '2026-02-01', endDate: '2026-02-28', status: 'active', combinable: true, revenue: 15800, roi: 3.0, avgTicket: 451 },
  { id: 'c4', code: 'PAROTA500', internalName: 'Descuento fijo Parota', type: 'fixed', value: 500, target: 'products', targetLabel: 'Prod: Parota', usesCount: 8, usesLimit: 20, usesPerCustomer: 1, minPurchase: 1000, maxDiscount: null, isAutomatic: false, customerRestriction: 'Todos', startDate: null, endDate: '2026-03-15', status: 'active', combinable: false, revenue: 8400, roi: 2.1, avgTicket: 1050 },
  { id: 'c5', code: 'VIP15', internalName: 'Descuento exclusivo VIP', type: 'percentage', value: 15, target: 'order', targetLabel: 'Todo pedido', usesCount: 12, usesLimit: null, usesPerCustomer: null, minPurchase: null, maxDiscount: null, isAutomatic: false, customerRestriction: 'Oro + Platino', startDate: null, endDate: null, status: 'active', combinable: true, revenue: 18200, roi: 6.7, avgTicket: 1517 },
  { id: 'c6', code: 'AUTO-ENVIO', internalName: 'Envío gratis automático +$2500', type: 'free_shipping', value: 100, target: 'shipping', targetLabel: 'Envío', usesCount: 88, usesLimit: null, usesPerCustomer: null, minPurchase: 2500, maxDiscount: null, isAutomatic: true, customerRestriction: 'Todos', startDate: null, endDate: null, status: 'auto', combinable: true, revenue: 4800, roi: 8.0, avgTicket: 600 },
  { id: 'c7', code: '2X1GRABADO', internalName: '2×1 en grabado láser', type: 'buyget', value: 0, buygetConfig: { buyQty: 2, getQty: 1, category: 'Grabado Láser' }, target: 'products', targetLabel: 'Grabado láser', usesCount: 5, usesLimit: 30, usesPerCustomer: 1, minPurchase: null, maxDiscount: null, isAutomatic: false, customerRestriction: 'Todos', startDate: '2026-03-01', endDate: '2026-03-15', status: 'active', combinable: false, revenue: 3600, roi: 3.5, avgTicket: 720 },
  { id: 'c8', code: 'MAMA20', internalName: 'Día de las Madres 2026', type: 'percentage', value: 20, target: 'collections', targetLabel: 'Col: Regalos', usesCount: 0, usesLimit: 100, usesPerCustomer: 1, minPurchase: 800, maxDiscount: 800, isAutomatic: false, customerRestriction: 'Todos', startDate: '2026-05-01', endDate: '2026-05-10', status: 'scheduled', combinable: false, revenue: 0, roi: 0, avgTicket: 0 },
];

export const mockEmailCampaigns: EmailCampaign[] = [
  { id: 'ec1', name: 'Lanzamiento Set Primavera', segment: 'Todos', sentCount: 248, openRate: 42, clickRate: 12, revenue: 8400, status: 'sent', subject: '{nombre}, descubre nuestra nueva colección de primavera 🌿' },
  { id: 'ec2', name: 'Puntos por vencer', segment: 'Puntos >1000', sentCount: 45, openRate: 68, clickRate: 28, revenue: 3200, status: 'sent', subject: '{nombre}, tus {puntos} puntos están por vencer ⏳' },
  { id: 'ec3', name: 'Descuento VIP exclusivo', segment: 'Oro + Platino', sentCount: 15, openRate: 80, clickRate: 35, revenue: 6800, status: 'sent', subject: 'Exclusivo para ti: 15% de descuento VIP 💎', couponCode: 'VIP15' },
  { id: 'ec4', name: 'Te extrañamos', segment: 'Inactivos >90d', sentCount: null, openRate: null, clickRate: null, revenue: null, status: 'scheduled', scheduledDate: '2026-03-05', subject: '{nombre}, te extrañamos en DavidSon\'s Design 🌳' },
  { id: 'ec5', name: 'Día de las Madres', segment: 'Todos', sentCount: null, openRate: null, clickRate: null, revenue: null, status: 'draft', subject: 'El regalo perfecto para mamá está aquí 💐', couponCode: 'MAMA20' },
];

export const mockBanners: SiteBanner[] = [
  { id: 'b1', title: 'Colección Primavera 2026', subtitle: 'Nuevas maderas de temporada con acabados únicos', location: 'hero', link: '/shop?collection=primavera', status: 'active', startDate: '2026-03-01', endDate: '2026-04-30', clicks: 342, impressions: 8200, ctr: 4.2, revenueAttrib: 5600, position: 1 },
  { id: 'b2', title: 'Envío gratis en pedidos +$2,500', subtitle: 'Aplica automáticamente en tu carrito', location: 'hero', link: '/shop', status: 'active', clicks: 1248, impressions: 15400, ctr: 8.1, revenueAttrib: 42000, position: 2 },
  { id: 'b3', title: 'Personaliza con grabado láser', subtitle: 'Agrega un toque único a cada pieza', location: 'hero', link: '/shop?grabado=true', status: 'active', clicks: 856, impressions: 14800, ctr: 5.8, revenueAttrib: 12400, position: 3 },
  { id: 'b4', title: 'Usa BIENVENIDO10 y obtén 10% en tu primera compra', subtitle: '', location: 'announcement', link: '', status: 'active', clicks: 320, impressions: 22000, ctr: 1.5, revenueAttrib: 2800, position: 1, bgColor: '#2d2419', textColor: '#C5A065' },
  { id: 'b5', title: '20% OFF en tablas de cortar', subtitle: 'Válido hasta fin de mes', location: 'category', categoryName: 'Tablas para Cortar', link: '/shop?category=tablas', status: 'active', clicks: 180, impressions: 3200, ctr: 5.6, revenueAttrib: 4200, position: 1 },
  { id: 'b6', title: 'El regalo perfecto', subtitle: 'Sets curados para toda ocasión', location: 'category', categoryName: 'Sets y Colecciones', link: '/shop?category=sets', status: 'active', clicks: 95, impressions: 1800, ctr: 5.3, revenueAttrib: 2100, position: 1 },
  { id: 'b7', title: '¿Sabías que puedes agregar grabado láser?', subtitle: 'Personaliza ahora', location: 'checkout', link: '', status: 'active', clicks: 64, impressions: 520, ctr: 12.3, revenueAttrib: 1200, position: 1 },
];

export const mockFlashSales: FlashSale[] = [
  { id: 'fs1', name: 'Flash Friday — Tablas de Parota', discountType: 'percentage', discountValue: 30, description: '30% en todas las tablas de Parota', startDate: '2026-02-28T00:00:00', endDate: '2026-03-01T23:59:00', status: 'active', salesCount: 18, revenue: 12240, visits: 842, conversion: 2.1, products: [{ name: 'Tabla Parota Med', originalPrice: 850, flashPrice: 595, margin: 43 }, { name: 'Tabla Parota Gde', originalPrice: 1100, flashPrice: 770, margin: 43 }], stockLimit: 20, perCustomerLimit: 2 },
  { id: 'fs2', name: 'Grabado Láser 2×1', discountType: 'buyget', discountValue: 0, description: 'Buy 2 Get 1 Free en servicio de grabado láser', startDate: '2026-03-08T00:00:00', endDate: '2026-03-10T23:59:00', status: 'scheduled', salesCount: 0, revenue: 0, visits: 0, conversion: 0, products: [{ name: 'Grabado Láser Personalizado', originalPrice: 250, flashPrice: 167, margin: 52 }], stockLimit: null, perCustomerLimit: null },
  { id: 'fs3', name: 'Black Friday 2025', discountType: 'percentage', discountValue: 25, description: '25% en todo el catálogo', startDate: '2025-11-29T00:00:00', endDate: '2025-11-29T23:59:00', status: 'completed', salesCount: 42, revenue: 28400, visits: 2150, conversion: 5.8, products: [{ name: 'Todo el catálogo', originalPrice: 0, flashPrice: 0, margin: 0 }], stockLimit: null, perCustomerLimit: null },
];

export const mockTopReferrers: TopReferrer[] = [
  { rank: 1, name: 'Pedro Sánchez', tier: 'platino', linksShared: 24, registrations: 8, purchases: 6, pointsEarned: 3000 },
  { rank: 2, name: 'David Perez', tier: 'oro', linksShared: 18, registrations: 5, purchases: 4, pointsEarned: 2000 },
  { rank: 3, name: 'María López', tier: 'plata', linksShared: 12, registrations: 3, purchases: 2, pointsEarned: 1000 },
];

export const mockReferrals: Referral[] = [
  { id: 'ref1', date: '2026-02-28', referrerName: 'David Perez', referredName: 'Carlos Ruiz', status: 'purchased', purchaseAmount: 1200, rewardPoints: 500, rewardStatus: 'credited' },
  { id: 'ref2', date: '2026-02-25', referrerName: 'Pedro Sánchez', referredName: 'Ana Martínez', status: 'purchased', purchaseAmount: 850, rewardPoints: 500, rewardStatus: 'credited' },
  { id: 'ref3', date: '2026-02-22', referrerName: 'María López', referredName: 'Luis Torres', status: 'registered', purchaseAmount: null, rewardPoints: 0, rewardStatus: 'pending' },
  { id: 'ref4', date: '2026-02-20', referrerName: 'David Perez', referredName: 'Sofia Herrera', status: 'link_visited', purchaseAmount: null, rewardPoints: 0, rewardStatus: 'pending' },
  { id: 'ref5', date: '2026-02-18', referrerName: 'Pedro Sánchez', referredName: 'Roberto Díaz', status: 'purchased', purchaseAmount: 1450, rewardPoints: 500, rewardStatus: 'credited' },
  { id: 'ref6', date: '2026-02-15', referrerName: 'Pedro Sánchez', referredName: 'Elena Vargas', status: 'purchased', purchaseAmount: 980, rewardPoints: 500, rewardStatus: 'credited' },
];

export const marketingMonthlyTrend = [
  { month: 'Sep', marketing: 8200, organic: 59800 },
  { month: 'Oct', marketing: 11400, organic: 70600 },
  { month: 'Nov', marketing: 18600, organic: 76400 },
  { month: 'Dic', marketing: 32000, organic: 110000 },
  { month: 'Ene', marketing: 12800, organic: 75200 },
  { month: 'Feb', marketing: 12400, organic: 112100 },
];