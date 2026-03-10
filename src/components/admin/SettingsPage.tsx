"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, Store, CreditCard, Truck, Receipt, Users, Plug, Code,
  Save, Upload, Eye, EyeOff, Copy, RefreshCw, ExternalLink, Plus, X,
  Check, AlertTriangle, Clock, Activity, ChevronRight,
  GripVertical, Globe, MapPin, Phone, Mail, Instagram
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/src/theme/ThemeContext';
import { Card as TCard, Badge as TBadge, Button as TButton, StatCard as TStatCard, Table as TTable } from '@/src/theme/primitives';


// ===== TYPES =====
type STab = 'general' | 'store' | 'payments' | 'shipping' | 'taxes' | 'integrations' | 'developer';

const tabItems: Array<{ id: STab; label: string; icon: React.ElementType }> = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'store', label: 'Tienda', icon: Store },
  { id: 'payments', label: 'Pagos', icon: CreditCard },
  { id: 'shipping', label: 'Envios', icon: Truck },
  { id: 'taxes', label: 'Impuestos', icon: Receipt },

  { id: 'integrations', label: 'Integraciones', icon: Plug },
  { id: 'developer', label: 'Desarrollador', icon: Code },
];

// ===== SHARED =====
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={'bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm ' + className}>{children}</div>;
}

function STitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[11px] font-medium text-[var(--text)] uppercase tracking-wider border-b border-[var(--border)] pb-2 mb-4">{children}</h4>;
}

function Badge({ text, variant = 'green' }: { text: string; variant?: 'green' | 'gray' | 'amber' | 'blue' | 'red' }) {
  const cls: Record<string, string> = {
    green: 'bg-green-50 text-green-600',
    gray: 'bg-[var(--surface2)] text-[var(--text-secondary)]',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-500',
  };
  return <span className={'text-[10px] font-medium px-2 py-0.5 rounded-full ' + cls[variant]}>{text}</span>;
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">{label}</label>
      {children}
    </div>
  );
}

function Input({ defaultValue = '', placeholder = '', className = '', type = 'text', readOnly = false }: { defaultValue?: string; placeholder?: string; className?: string; type?: string; readOnly?: boolean }) {
  return <input type={type} defaultValue={defaultValue} placeholder={placeholder} readOnly={readOnly} className={'border border-[var(--border)] rounded-lg px-3 py-2 text-xs bg-[var(--surface)] outline-none focus:border-[var(--accent)]/50 transition-colors ' + (readOnly ? 'bg-[var(--surface2)] text-[var(--text-secondary)] ' : '') + className} />;
}

function SaveBtn() {
  return (
    <button onClick={() => toast.success('Configuracion guardada')} className="px-4 py-2 text-xs bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-1.5">
      <Save size={12} /> Guardar
    </button>
  );
}

function SecretField({ label, value }: { label: string; value: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label}>
      <div className="flex items-center gap-1">
        <input
          type={visible ? 'text' : 'password'}
          defaultValue={value}
          className="flex-1 border border-[var(--border)] rounded-lg px-3 py-2 text-xs bg-[var(--surface)] font-mono outline-none"
        />
        <button onClick={() => setVisible(!visible)} className="p-2 rounded-lg hover:bg-[var(--surface2)] text-[var(--text-muted)] transition-colors">
          {visible ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
        <button onClick={() => { navigator.clipboard.writeText(value); toast.success('Copiado'); }} className="p-2 rounded-lg hover:bg-[var(--surface2)] text-[var(--text-muted)] transition-colors">
          <Copy size={12} />
        </button>
      </div>
    </Field>
  );
}

// ===== TAB 1: GENERAL =====
function GeneralTab() {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <STitle>Identidad</STitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre del negocio"><Input defaultValue="DavidSon's Design" className="w-full" /></Field>
          <Field label="Nombre legal"><Input defaultValue="David Alejandro Perez Rea" className="w-full" /></Field>
          <Field label="RFC"><Input defaultValue="PERD000000XXX" className="w-full font-mono" /></Field>
          <Field label="Regimen fiscal">
            <select defaultValue="pfae" className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-xs bg-[var(--surface)]">
              <option value="pfae">Persona Fisica con Actividad Empresarial</option>
              <option value="rif">Regimen de Incorporacion Fiscal</option>
              <option value="pm">Persona Moral</option>
            </select>
          </Field>
          <Field label="Giro" className="md:col-span-2"><Input defaultValue="Fabricacion y venta de muebles artesanales de madera" className="w-full" /></Field>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {[{ l: 'Logo principal', n: 'emails, facturas, PDFs' }, { l: 'Logo alternativo (claro)', n: 'fondos oscuros' }, { l: 'Favicon', n: '16x16px' }].map((logo) => (
            <div key={logo.l}>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{logo.l}</p>
              <button className="w-20 h-20 border-2 border-dashed border-[var(--border)] rounded-lg flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-wood-300 transition-colors">
                <Upload size={16} />
                <span className="text-[8px] mt-1">{logo.n}</span>
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Contacto</STitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email principal"><Input defaultValue="contacto@davidsonsdesign.com" className="w-full" /></Field>
          <Field label="Email de soporte"><Input defaultValue="soporte@davidsonsdesign.com" className="w-full" /></Field>
          <Field label="Email de pedidos"><Input defaultValue="pedidos@davidsonsdesign.com" className="w-full" /></Field>
          <Field label="Telefono"><Input defaultValue="662-361-0742" className="w-full" /></Field>
          <Field label="WhatsApp"><Input defaultValue="+52 662 361 0742" className="w-full" /></Field>
          <Field label="Horario de atencion">
            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <select className="border border-[var(--border)] rounded px-1.5 py-1 text-xs bg-[var(--surface)]"><option>Lun-Vie</option></select>
              <Input defaultValue="09:00" type="time" className="w-20" />
              <span>a</span>
              <Input defaultValue="18:00" type="time" className="w-20" />
              <span className="mx-1">|</span>
              <select className="border border-[var(--border)] rounded px-1.5 py-1 text-xs bg-[var(--surface)]"><option>Sab</option></select>
              <Input defaultValue="09:00" type="time" className="w-20" />
              <span>-</span>
              <Input defaultValue="14:00" type="time" className="w-20" />
            </div>
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Direccion</STitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Calle y numero" className="md:col-span-2"><Input placeholder="Calle y numero" className="w-full" /></Field>
          <Field label="Colonia"><Input placeholder="Colonia" className="w-full" /></Field>
          <Field label="Codigo postal"><Input defaultValue="83000" className="w-full" /></Field>
          <Field label="Ciudad"><Input defaultValue="Hermosillo" className="w-full" /></Field>
          <Field label="Estado"><Input defaultValue="Sonora" className="w-full" /></Field>
          <Field label="Pais"><Input defaultValue="Mexico" className="w-full" /></Field>
          <Field label="Coordenadas (para mapa)">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)]">Lat</span>
              <Input defaultValue="29.0729" className="w-24" />
              <span className="text-[10px] text-[var(--text-muted)]">Lng</span>
              <Input defaultValue="-110.9559" className="w-24" />
            </div>
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Redes Sociales</STitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Facebook"><Input defaultValue="https://facebook.com/davidsonsdesign" className="w-full" /></Field>
          <Field label="Instagram"><Input defaultValue="https://instagram.com/davidsonsdesign" className="w-full" /></Field>
          <Field label="TikTok"><Input placeholder="https://tiktok.com/@..." className="w-full" /></Field>
          <Field label="YouTube"><Input placeholder="https://youtube.com/..." className="w-full" /></Field>
          <Field label="Pinterest"><Input placeholder="https://pinterest.com/..." className="w-full" /></Field>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Zona Horaria y Formato</STitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Zona horaria">
            <select className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-xs bg-[var(--surface)]">
              <option>America/Hermosillo (MST, UTC-7)</option>
              <option>America/Mexico_City (CST, UTC-6)</option>
            </select>
          </Field>
          <Field label="Formato de fecha">
            <select className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-xs bg-[var(--surface)]">
              <option>DD/MM/AAAA</option>
              <option>MM/DD/AAAA</option>
              <option>AAAA-MM-DD</option>
            </select>
          </Field>
          <Field label="Formato de hora">
            <select className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-xs bg-[var(--surface)]">
              <option>12h (AM/PM)</option>
              <option>24h</option>
            </select>
          </Field>
          <Field label="Primer dia de la semana">
            <select className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-xs bg-[var(--surface)]">
              <option>Lunes</option>
              <option>Domingo</option>
            </select>
          </Field>
        </div>
      </Card>

      <SaveBtn />
    </div>
  );
}

// ===== TAB 2: STORE =====
function StoreTab() {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <STitle>Dominio</STitle>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-[var(--surface2)] rounded-lg">
            <span className="text-[var(--text-secondary)]">Dominio principal</span>
            <span className="font-medium text-[var(--text)] font-mono">davidsonsdesign.com</span>
            <Badge text="Cloudflare" variant="blue" />
          </div>
          <div className="flex items-center justify-between p-2.5 bg-[var(--surface2)] rounded-lg">
            <span className="text-[var(--text-secondary)]">URL tienda</span>
            <span className="font-mono text-[var(--text)]">https://davidsonsdesign.com</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-[var(--surface2)] rounded-lg">
            <span className="text-[var(--text-secondary)]">Estado SSL</span>
            <span className="flex items-center gap-1"><Check size={10} className="text-green-500" /> Activo (Cloudflare)</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-[var(--surface2)] rounded-lg">
            <span className="text-[var(--text-secondary)]">URL admin</span>
            <span className="font-mono text-[var(--text)]">https://davidsonsdesign.com/admin</span>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Moneda y Precios</STitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Moneda principal">
            <select className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-xs bg-[var(--surface)]">
              <option>MXN - Peso Mexicano</option>
              <option>USD - Dolar Estadounidense</option>
            </select>
          </Field>
          <Field label="Simbolo"><Input defaultValue="$" className="w-full" /></Field>
          <Field label="Posicion">
            <select className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-xs bg-[var(--surface)]">
              <option>Antes del numero</option>
              <option>Despues del numero</option>
            </select>
          </Field>
          <Field label="Separador decimal"><Input defaultValue="." className="w-full" /></Field>
          <Field label="Separador miles"><Input defaultValue="," className="w-full" /></Field>
        </div>
        <div className="flex flex-col gap-1.5 mt-3">
          <label className="flex items-center gap-2 text-xs text-[var(--text)]">
            <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
            Mostrar decimales siempre (.00)
          </label>
          <label className="flex items-center gap-2 text-xs text-[var(--text)]">
            <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
            IVA incluido en precios mostrados
          </label>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Inventario</STitle>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-[var(--text)]">
            <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
            Rastrear inventario (mostrar stock disponible)
          </label>
          <div className="pl-6 space-y-2">
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-1">Cuando el stock llega a 0:</p>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><input type="radio" name="stock-0" defaultChecked className="text-[var(--accent)]" /> No permitir compra</label>
                <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><input type="radio" name="stock-0" className="text-[var(--accent)]" /> Permitir backorder</label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">Alerta stock bajo cuando quedan:</span>
              <Input defaultValue="5" className="w-14 text-center" />
              <span className="text-xs text-[var(--text-secondary)]">unidades</span>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--text)]">
            <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
            Mostrar "Ultimas X unidades" cuando quedan menos de: <Input defaultValue="3" className="w-14 text-center" />
          </label>
          <label className="flex items-center gap-2 text-xs text-[var(--text)]">
            <input type="checkbox" className="rounded border-wood-300 text-[var(--accent)]" />
            Mostrar cantidad exacta de stock al cliente
          </label>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Carrito y Checkout</STitle>
        <div className="space-y-2">
          {[
            { label: 'Permitir checkout como invitado (sin crear cuenta)', checked: true },
            { label: 'Mostrar cupon de descuento en checkout', checked: true },
            { label: 'Mostrar opcion de grabado laser en carrito', checked: true },
            { label: 'Mostrar estimado de entrega en checkout', checked: true },
            { label: 'Requiere aceptar terminos y condiciones antes de pagar', checked: false },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-2 text-xs text-[var(--text)]">
              <input type="checkbox" defaultChecked={opt.checked} className="rounded border-wood-300 text-[var(--accent)]" />
              {opt.label}
            </label>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-[var(--text-secondary)]">Tiempo de reserva de carrito:</span>
            <Input defaultValue="30" className="w-14 text-center" />
            <span className="text-xs text-[var(--text-secondary)]">minutos</span>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Pedidos</STitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prefijo de pedido"><Input defaultValue="#" className="w-full" /></Field>
          <Field label="Siguiente numero"><Input defaultValue="166" className="w-full" /></Field>
        </div>
        <div className="space-y-2 mt-3">
          <label className="flex items-center gap-2 text-xs text-[var(--text)]">
            <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
            Enviar confirmacion de pedido automaticamente
          </label>
          <label className="flex items-center gap-2 text-xs text-[var(--text)]">
            <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
            Permitir que el cliente cancele pedido (solo estado: Pendiente)
          </label>
          <div className="flex items-center gap-2 pl-6">
            <span className="text-xs text-[var(--text-secondary)]">Tiempo maximo para cancelar:</span>
            <Input defaultValue="2" className="w-14 text-center" />
            <span className="text-xs text-[var(--text-secondary)]">horas despues de pagar</span>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Grabado Laser (configuracion especifica DSD)</STitle>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs text-[var(--text)]">
            <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
            Activar servicio de grabado laser
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Precio base">
              <div className="flex items-center gap-1"><span className="text-xs text-[var(--text-muted)]">$</span><Input defaultValue="300" className="w-full" /><span className="text-xs text-[var(--text-muted)]">MXN</span></div>
            </Field>
            <Field label="Tamano maximo de archivo">
              <div className="flex items-center gap-1"><Input defaultValue="10" className="w-full" /><span className="text-xs text-[var(--text-muted)]">MB</span></div>
            </Field>
            <Field label="Area maxima de grabado">
              <div className="flex items-center gap-1"><Input defaultValue="20" className="w-12" /><span className="text-xs text-[var(--text-muted)]">x</span><Input defaultValue="15" className="w-12" /><span className="text-xs text-[var(--text-muted)]">cm</span></div>
            </Field>
          </div>
          <Field label="Formatos aceptados">
            <div className="flex flex-wrap gap-1.5">
              {['.svg', '.png', '.jpg', '.pdf'].map((f) => (
                <span key={f} className="text-[10px] bg-[var(--surface2)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full border border-[var(--border)] flex items-center gap-1">
                  {f} <X size={8} className="text-[var(--text-muted)] cursor-pointer" />
                </span>
              ))}
              <button className="text-[10px] text-[var(--accent)] hover:underline">+ Agregar</button>
            </div>
          </Field>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs text-[var(--text)]">
              <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
              Requerir aprobacion del archivo antes de produccion
            </label>
            <label className="flex items-center gap-2 text-xs text-[var(--text)]">
              <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
              Mostrar preview del grabado al cliente
            </label>
          </div>
          <Field label="Niveles de complejidad y precios">
            <div className="grid grid-cols-3 gap-3">
              {[{ l: 'Basico', v: '300' }, { l: 'Intermedio', v: '500' }, { l: 'Detallado', v: '800' }].map((n) => (
                <div key={n.l}>
                  <p className="text-[10px] text-[var(--text-muted)] mb-1">{n.l}</p>
                  <div className="flex items-center gap-1"><span className="text-xs text-[var(--text-muted)]">$</span><Input defaultValue={n.v} className="w-full" /></div>
                </div>
              ))}
            </div>
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Cotizaciones</STitle>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs text-[var(--text)]">
            <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
            Activar modulo de cotizaciones
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Prefijo"><Input defaultValue="COT-" className="w-full" /></Field>
            <Field label="Formato"><Input defaultValue="COT-AAAA-NNN" className="w-full" readOnly /></Field>
            <Field label="Validez por defecto">
              <div className="flex items-center gap-1"><Input defaultValue="15" className="w-full" /><span className="text-xs text-[var(--text-muted)]">dias</span></div>
            </Field>
            <Field label="Anticipo requerido">
              <div className="flex items-center gap-1"><Input defaultValue="50" className="w-full" /><span className="text-xs text-[var(--text-muted)]">%</span></div>
            </Field>
            <Field label="Formula precio base">
              <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">Vol x $<Input defaultValue="0.15" className="w-16" />MXN/cm3</div>
            </Field>
            <Field label="Multiplicador Parota/Nogal">
              <div className="flex items-center gap-1"><Input defaultValue="1.5" className="w-full" /><span className="text-xs text-[var(--text-muted)]">x</span></div>
            </Field>
            <Field label="Recargo grabado">
              <div className="flex items-center gap-1"><span className="text-xs text-[var(--text-muted)]">$</span><Input defaultValue="300" className="w-full" /><span className="text-xs text-[var(--text-muted)]">MXN</span></div>
            </Field>
            <Field label="Timeline por defecto"><Input defaultValue="4-6 semanas" className="w-full" /></Field>
            <Field label="Recargo cambios post-produccion">
              <div className="flex items-center gap-1"><Input defaultValue="15" className="w-full" /><span className="text-xs text-[var(--text-muted)]">%</span></div>
            </Field>
          </div>
        </div>
      </Card>

      <SaveBtn />
    </div>
  );
}

// ===== TAB 3: PAYMENTS =====
function PaymentsTab() {
  function PaymentProvider({ name, displayName, mode, methods, commission, dashboardUrl, webhookUrl }: {
    name: string; displayName: string; mode: string; methods: string[]; commission: string; dashboardUrl: string; webhookUrl: string;
  }) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface2)] flex items-center justify-center text-sm font-bold text-[var(--text-secondary)]">{name[0]}</div>
            <div>
              <h4 className="text-xs font-medium text-[var(--text)]">{name}</h4>
              <p className="text-[10px] text-[var(--text-muted)]">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge text="Activo" variant="green" />
            <Badge text={'Modo: ' + mode} variant={mode === 'Test' ? 'amber' : 'green'} />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-[var(--text-muted)] mb-1.5">Metodos habilitados:</p>
            <div className="flex flex-wrap gap-1.5">
              {methods.map((m) => (
                <label key={m} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" /> {m}
                </label>
              ))}
            </div>
          </div>
          <SecretField label="Publishable Key" value="pk_test_••••••••••••••••••••" />
          <SecretField label="Secret Key" value="sk_test_••••••••••••••••••••" />
          <SecretField label="Webhook Secret" value="whsec_••••••••••••••••••••" />
          <Field label="Webhook URL"><Input defaultValue={webhookUrl} className="w-full font-mono" readOnly /></Field>
          <p className="text-[10px] text-[var(--text-muted)]">Comision estimada: {commission}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.success('Conexion verificada')} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors flex items-center gap-1">
              <RefreshCw size={10} /> Verificar conexion
            </button>
            <a href={dashboardUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors flex items-center gap-1">
              <ExternalLink size={10} /> Dashboard
            </a>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PaymentProvider
        name="Stripe" displayName="Tarjeta de credito o debito" mode="Test"
        methods={['Visa', 'Mastercard', 'Amex']}
        commission="3.6% + $3 MXN por transaccion"
        dashboardUrl="https://dashboard.stripe.com" webhookUrl="https://api.davidsonsdesign.com/webhooks/stripe"
      />
      <PaymentProvider
        name="MercadoPago" displayName="MercadoPago - Debito, credito, OXXO, SPEI" mode="Test"
        methods={['Tarjeta credito', 'Tarjeta debito', 'OXXO', 'SPEI']}
        commission="3.49% + IVA por transaccion"
        dashboardUrl="https://mercadopago.com.mx" webhookUrl="https://api.davidsonsdesign.com/webhooks/mercadopago"
      />

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface2)] flex items-center justify-center text-sm font-bold text-[var(--text-secondary)]">T</div>
            <div>
              <h4 className="text-xs font-medium text-[var(--text)]">Transferencia Bancaria</h4>
              <p className="text-[10px] text-[var(--text-muted)]">Solo para cotizaciones</p>
            </div>
          </div>
          <Badge text="Activo" variant="green" />
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-[var(--text-muted)] mb-1">Disponible para:</p>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><input type="radio" name="transfer" defaultChecked className="text-[var(--accent)]" /> Cotizaciones</label>
              <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><input type="radio" name="transfer" className="text-[var(--accent)]" /> Todos los pedidos</label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Banco"><Input defaultValue="BBVA" className="w-full" /></Field>
            <Field label="Titular"><Input defaultValue="David Alejandro Perez Rea" className="w-full" /></Field>
            <Field label="Cuenta"><Input defaultValue="XXXX-XXXX-XXXX-XXXX" className="w-full font-mono" /></Field>
            <Field label="CLABE"><Input defaultValue="XXXXXXXXXXXXXXXX" className="w-full font-mono" /></Field>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Orden de metodos en checkout</STitle>
        <div className="space-y-1.5">
          {['1. Stripe (tarjeta)', '2. MercadoPago', '3. Transferencia (solo cotizaciones)'].map((m) => (
            <div key={m} className="flex items-center gap-2 p-2.5 bg-[var(--surface2)] rounded-lg text-xs text-[var(--text)]">
              <GripVertical size={14} className="text-[var(--text-muted)] cursor-grab" />
              {m}
            </div>
          ))}
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Arrastra para reordenar</p>
        </div>
      </Card>

      <SaveBtn />
    </div>
  );
}

// ===== TAB 4: SHIPPING =====
function ShippingTab() {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <STitle>Zonas de Envio</STitle>
        <div className="space-y-4">
          {/* Zone 1 */}
          <div className="border border-[var(--border)] rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[var(--accent)]" />
                <span className="text-xs font-medium text-[var(--text)]">Zona 1: Hermosillo Local</span>
              </div>
              <button className="text-[10px] text-[var(--accent)] hover:underline">Editar zona</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
              <div className="bg-[var(--surface2)] rounded p-2"><span className="text-[var(--text-muted)]">Cobertura</span><br /><span className="text-[var(--text)]">CP 83000-83999</span></div>
              <div className="bg-[var(--surface2)] rounded p-2"><span className="text-[var(--text-muted)]">Carrier</span><br /><span className="text-[var(--text)]">Uber Flash</span></div>
              <div className="bg-[var(--surface2)] rounded p-2"><span className="text-[var(--text-muted)]">Tarifa fija</span><br /><span className="text-[var(--text)]">$99 MXN</span></div>
              <div className="bg-[var(--surface2)] rounded p-2"><span className="text-[var(--text-muted)]">Tiempo</span><br /><span className="text-[var(--text)]">Mismo dia (2-4h)</span></div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
                Envio gratis a partir de: $
              </label>
              <Input defaultValue="2,500" className="w-20 text-center" />
              <span className="text-xs text-[var(--text-secondary)]">MXN</span>
            </div>
          </div>

          {/* Zone 2 */}
          <div className="border border-[var(--border)] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[var(--accent)]" />
                <span className="text-xs font-medium text-[var(--text)]">Zona 2: Mexico Nacional</span>
              </div>
              <button className="text-[10px] text-[var(--accent)] hover:underline">Editar zona</button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">Cobertura: Todo Mexico excepto Hermosillo local</p>
            <div className="space-y-2">
              {[
                { name: 'Estafeta', range: '$270-$310 MXN', time: '3-5 dias habiles' },
                { name: 'DHL Express', range: '$350-$400 MXN', time: '2-3 dias habiles' },
                { name: 'FedEx', range: '$310-$350 MXN', time: '2-4 dias habiles' },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-3 p-2.5 bg-[var(--surface2)] rounded-lg">
                  <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
                  <span className="text-xs font-medium text-[var(--text)] w-28">{c.name}</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">Tarifa: {c.range}</span>
                  <span className="text-[10px] text-[var(--text-muted)] ml-auto">{c.time}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
                Envio gratis a partir de: $
              </label>
              <Input defaultValue="2,500" className="w-20 text-center" />
              <span className="text-xs text-[var(--text-secondary)]">MXN</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">Carrier por defecto cuando es gratis:</span>
              <select className="border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs bg-[var(--surface)]">
                <option>Estafeta (el mas economico)</option>
                <option>DHL Express</option>
                <option>FedEx</option>
              </select>
            </div>
          </div>
        </div>
        <button className="mt-3 text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
          <Plus size={12} /> Agregar zona de envio
        </button>
      </Card>

      <Card className="p-5">
        <STitle>Envia.com API</STitle>
        <div className="space-y-3">
          <SecretField label="API Key" value="••••••••••••••••••••" />
          <div className="flex items-center gap-3">
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><input type="radio" name="envia-mode" defaultChecked className="text-[var(--accent)]" /> Test</label>
              <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><input type="radio" name="envia-mode" className="text-[var(--accent)]" /> Produccion</label>
            </div>
            <button onClick={() => toast.success('Conexion verificada')} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors flex items-center gap-1">
              <RefreshCw size={10} /> Verificar conexion
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Direccion de origen (remitente)</STitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre"><Input defaultValue="DavidSon's Design" className="w-full" /></Field>
          <Field label="Telefono"><Input defaultValue="662-361-0742" className="w-full" /></Field>
          <Field label="Calle"><Input placeholder="Calle y numero" className="w-full" /></Field>
          <Field label="CP"><Input defaultValue="83000" className="w-full" /></Field>
          <Field label="Ciudad"><Input defaultValue="Hermosillo" className="w-full" /></Field>
          <Field label="Estado"><Input defaultValue="Sonora" className="w-full" /></Field>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Empaque por defecto</STitle>
        <div className="flex flex-wrap items-center gap-3">
          {[{ l: 'Largo', v: '50' }, { l: 'Ancho', v: '35' }, { l: 'Alto', v: '10' }].map((d) => (
            <div key={d.l} className="flex items-center gap-1">
              <span className="text-[10px] text-[var(--text-muted)]">{d.l}:</span>
              <Input defaultValue={d.v} className="w-14 text-center" />
              <span className="text-[10px] text-[var(--text-muted)]">cm</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[var(--text-muted)]">Peso:</span>
            <Input defaultValue="3" className="w-14 text-center" />
            <span className="text-[10px] text-[var(--text-muted)]">kg</span>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--text)] mt-2">
          <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" />
          Ajustar automaticamente segun el producto
        </label>
      </Card>

      <SaveBtn />
    </div>
  );
}

// ===== TAB 5: TAXES =====
function TaxesTab() {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <STitle>IVA</STitle>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Tasa de IVA:</span>
            <Input defaultValue="16" className="w-14 text-center" />
            <span className="text-xs text-[var(--text-secondary)]">%</span>
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-muted)] mb-1">IVA incluido en precios:</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><input type="radio" name="iva" defaultChecked className="text-[var(--accent)]" /> Si (precios mostrados ya incluyen IVA)</label>
              <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><input type="radio" name="iva" className="text-[var(--accent)]" /> No (IVA se suma al checkout)</label>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-muted)] mb-1">Aplicar IVA a:</p>
            <div className="flex gap-4">
              {['Productos', 'Envio', 'Grabado laser'].map((a) => (
                <label key={a} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  <input type="checkbox" defaultChecked className="rounded border-wood-300 text-[var(--accent)]" /> {a}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Facturacion / CFDI (proximamente)</STitle>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={14} className="text-amber-500" />
          <Badge text="Proximamente" variant="amber" />
        </div>
        <div className="space-y-3 opacity-60">
          <Field label="Proveedor CFDI">
            <select disabled className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-xs bg-[var(--surface2)]">
              <option>- Sin configurar -</option>
              <option>Facturapi</option>
              <option>SWsapien</option>
              <option>Finkok</option>
            </select>
          </Field>
          <p className="text-[10px] text-[var(--text-muted)]">Cuando este activo:</p>
          {[
            'Generar CFDI automaticamente en cada venta',
            'Permitir que el cliente solicite factura en checkout',
            'Solicitar RFC y datos fiscales del cliente',
          ].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <input type="checkbox" disabled className="rounded border-wood-300" /> {opt}
            </label>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Regimen fiscal emisor"><Input defaultValue="Persona Fisica con Actividad Empresarial" className="w-full" readOnly /></Field>
            <Field label="Uso CFDI por defecto">
              <select disabled className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-xs bg-[var(--surface2)]">
                <option>G03 - Gastos en general</option>
              </select>
            </Field>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Region Fronteriza</STitle>
        <label className="flex items-center gap-2 text-xs text-[var(--text)]">
          <input type="checkbox" className="rounded border-wood-300 text-[var(--accent)]" />
          Aplicar tasa reducida IVA fronterizo (8%) para envios a zona fronteriza
        </label>
        <p className="text-[10px] text-[var(--text-muted)] mt-2">Solo aplica si el negocio y el cliente estan en zona fronteriza</p>
      </Card>

      <SaveBtn />
    </div>
  );
}

// ===== TAB 6: USERS — Now handled by UsersRolesManager =====

// ===== TAB 7: INTEGRATIONS =====
function IntegrationsTab() {
  const [healthStatus, setHealthStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    // Quick health check on Medusa backend
    async function checkHealth() {
      try {
        const res = await fetch('/api/admin/dashboard?period=today');
        setHealthStatus(prev => ({ ...prev, medusa: res.ok ? 'ok' : 'error' }));
      } catch { setHealthStatus(prev => ({ ...prev, medusa: 'error' })); }
    }
    checkHealth();
  }, []);

  const active = [
    { name: 'Medusa Backend', desc: 'Motor de e-commerce (DigitalOcean)', status: healthStatus.medusa === 'ok' ? 'Conectado' : healthStatus.medusa === 'error' ? 'Error' : 'Verificando...', mode: 'Produccion', detail: 'URL: urchin-app en DigitalOcean App Platform' },
    { name: 'Stripe', desc: 'Pagos con tarjeta (Visa, MC, Amex)', status: 'Conectado', mode: 'Test', detail: 'Modo test — cambiar a produccion en Fase 15' },
    { name: 'MercadoPago', desc: 'Pagos MX (debito, OXXO, transferencia)', status: 'Conectado', mode: 'Test', detail: 'Modo test — cambiar a produccion en Fase 15' },
    { name: 'Supabase Auth', desc: 'Autenticacion, lealtad, reviews, wishlist', status: 'Conectado', mode: 'Produccion', detail: 'Providers: Email + Google OAuth' },
    { name: 'Envia.com', desc: 'Cotizador de envíos (DHL, Estafeta, FedEx)', status: 'Conectado', mode: 'Sandbox', detail: 'Sandbox activo — quotes DHL funcionando' },
    { name: 'Cloudflare', desc: 'DNS + CDN para davidsonsdesign.com', status: 'Conectado', mode: 'Produccion', detail: 'SSL activo | Dominio: davidsonsdesign.com' },
    { name: 'Neon PostgreSQL', desc: 'Base de datos serverless', status: 'Conectado', mode: 'Produccion', detail: 'Free tier | Region: us-east-1' },
    { name: 'Resend', desc: 'Emails transaccionales', status: 'Conectado', mode: 'Produccion', detail: 'Dominio: davidsonsdesign.com verificado' },
    { name: 'Meta Pixel + CAPI', desc: 'Tracking de conversiones para Meta Ads', status: 'Conectado', mode: 'Produccion', detail: 'Pixel ID configurado | CAPI activo' },
  ];

  const available = [
    { name: 'Upstash Redis', desc: 'Cache para mejorar velocidad del backend' },
    { name: 'Facturapi / CFDI', desc: 'Generacion automatica de facturas electronicas MX' },
    { name: 'Google Analytics 4', desc: 'Tracking de trafico y conversiones' },
    { name: 'Google Merchant Center', desc: 'Mostrar productos en Google Shopping gratis' },
    { name: 'WhatsApp Business API', desc: 'Notificaciones al cliente por WhatsApp' },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <STitle>Activas</STitle>
        <div className="space-y-3">
          {active.map((s) => (
            <div key={s.name} className="border border-[var(--border)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--surface2)] flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">{s.name[0]}</div>
                  <div>
                    <h4 className="text-xs font-medium text-[var(--text)]">{s.name}</h4>
                    <p className="text-[10px] text-[var(--text-muted)]">{s.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge text={s.status} variant={s.status === 'Error' ? 'red' : s.status === 'Verificando...' ? 'amber' : 'green'} />
                  {s.mode && <Badge text={'Modo: ' + s.mode} variant={s.mode === 'Test' || s.mode === 'Sandbox' ? 'amber' : 'green'} />}
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] ml-12">{s.detail}</p>
              <div className="flex items-center gap-2 ml-12 mt-2">
                <button className="text-[10px] text-[var(--text-secondary)] border border-[var(--border)] rounded px-2 py-0.5 hover:bg-[var(--surface2)] transition-colors">Configurar</button>
                {s.mode && <button className="text-[10px] text-[var(--text-secondary)] border border-[var(--border)] rounded px-2 py-0.5 hover:bg-[var(--surface2)] transition-colors flex items-center gap-0.5"><RefreshCw size={8} /> Re-sync</button>}
                <button className="text-[10px] text-[var(--text-secondary)] border border-[var(--border)] rounded px-2 py-0.5 hover:bg-[var(--surface2)] transition-colors flex items-center gap-0.5"><ExternalLink size={8} /> Dashboard</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Disponibles (por activar)</STitle>
        <div className="space-y-3">
          {available.map((s) => (
            <div key={s.name} className="flex items-center justify-between border border-dashed border-[var(--border)] rounded-lg p-4 hover:border-wood-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--surface2)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">{s.name[0]}</div>
                <div>
                  <h4 className="text-xs font-medium text-[var(--text)]">{s.name}</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">{s.desc}</p>
                </div>
              </div>
              <button onClick={() => toast.success('Configurando ' + s.name + '...')} className="px-3 py-1.5 text-xs text-[var(--accent)] border border-[var(--accent)]/30 rounded-lg hover:bg-[var(--accent)]/5 transition-colors flex items-center gap-1">
                Conectar <ChevronRight size={10} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <SaveBtn />
    </div>
  );
}

// ===== TAB 8: DEVELOPER =====
function DeveloperTab() {
  const webhooks = [
    { name: 'Stripe', url: '/webhooks/stripe', events: 'payment.*', active: true },
    { name: 'MercadoPago', url: '/webhooks/mercadopago', events: 'payment.*', active: true },
    { name: 'Envia.com', url: '/webhooks/envia', events: 'shipment.*', active: true },
  ];

  const logs = [
    { level: 'warn', time: '10:30', service: 'Medusa', message: 'Slow query: products.list (2.3s)' },
    { level: 'info', time: '10:28', service: 'Stripe', message: 'Payment intent succeeded: pi_xxx' },
    { level: 'info', time: '10:25', service: 'Envia', message: 'Shipment created: ship_xxx' },
    { level: 'error', time: '09:45', service: 'Medusa', message: 'Connection pool exhausted (retry OK)' },
  ];

  const health = [
    { name: 'Frontend (Vercel)', status: 'Online', uptime: '99.98%', resp: '120ms' },
    { name: 'Backend (DigitalOcean)', status: 'Online', uptime: '99.95%', resp: '340ms' },
    { name: 'Database (Neon)', status: 'Online', uptime: '99.99%', resp: '45ms' },
    { name: 'Auth (Supabase)', status: 'Online', uptime: '99.99%', resp: '' },
    { name: 'Envia.com API', status: 'Online', uptime: '99.90%', resp: '' },
  ];

  const levelCfg: Record<string, { cls: string; label: string }> = {
    info: { cls: 'text-green-600', label: 'INFO' },
    warn: { cls: 'text-amber-600', label: 'WARN' },
    error: { cls: 'text-red-500', label: 'ERROR' },
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <STitle>API Keys (Medusa)</STitle>
        <div className="space-y-3">
          <Field label="Backend URL"><Input defaultValue="https://urchin-app-xxxxx.ondigitalocean.app" className="w-full font-mono" readOnly /></Field>
          <SecretField label="Admin API Key" value="sk_••••••••••••••••••••" />
          <SecretField label="Publishable API Key" value="pk_••••••••••••••••••••" />
          <button className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
            <Plus size={12} /> Generar nueva API Key
          </button>
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Webhooks</STitle>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="px-3 py-2">Webhook</th>
                <th className="px-3 py-2">URL</th>
                <th className="px-3 py-2">Eventos</th>
                <th className="px-3 py-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {webhooks.map((w) => (
                <tr key={w.name}>
                  <td className="px-3 py-2 text-xs font-medium text-[var(--text)]">{w.name}</td>
                  <td className="px-3 py-2 text-xs text-[var(--text-secondary)] font-mono">{w.url}</td>
                  <td className="px-3 py-2 text-xs text-[var(--text-secondary)] font-mono">{w.events}</td>
                  <td className="px-3 py-2"><Badge text="Activo" variant="green" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="mt-2 text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
          <Plus size={12} /> Agregar webhook personalizado
        </button>
      </Card>

      <Card className="p-5">
        <STitle>Variables de Entorno</STitle>
        <div className="space-y-2">
          {[
            { platform: 'Vercel (frontend)', vars: 12, updated: '26 Feb 2026' },
            { platform: 'DigitalOcean', vars: 18, updated: '27 Feb 2026' },
          ].map((e) => (
            <div key={e.platform} className="flex items-center justify-between p-2.5 bg-[var(--surface2)] rounded-lg text-xs">
              <span className="text-[var(--text)] font-medium">{e.platform}</span>
              <span className="text-[var(--text-secondary)]">{e.vars} variables configuradas</span>
              <span className="text-[var(--text-muted)]">Ultima actualizacion: {e.updated}</span>
            </div>
          ))}
        </div>
        <button className="mt-2 text-[10px] text-[var(--accent)] hover:underline">Ver lista completa (referencia, no editable desde aqui)</button>
      </Card>

      <Card className="p-5">
        <STitle>Logs del Sistema</STitle>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <select className="border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs bg-[var(--surface)]">
            <option>Nivel: Todos</option><option>INFO</option><option>WARN</option><option>ERROR</option>
          </select>
          <select className="border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs bg-[var(--surface)]">
            <option>Servicio: Todos</option><option>Medusa</option><option>Stripe</option><option>Envia</option>
          </select>
          <button className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors ml-auto">Exportar logs</button>
        </div>
        <div className="border border-[var(--border)] rounded-lg overflow-hidden">
          {logs.map((l, i) => {
            const cfg = levelCfg[l.level];
            return (
              <div key={i} className={'flex items-center gap-3 px-3 py-2 text-xs font-mono ' + (i < logs.length - 1 ? 'border-b border-[var(--border)]' : '')}>
                <span className={'font-bold text-[10px] w-12 ' + cfg.cls}>{cfg.label}</span>
                <span className="text-[var(--text-muted)] w-12">{l.time}</span>
                <span className="text-[var(--text-secondary)] w-16">{l.service}</span>
                <span className="text-[var(--text)] flex-1">{l.message}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <STitle>Salud del Sistema</STitle>
        <div className="space-y-2">
          {health.map((h) => (
            <div key={h.name} className="flex items-center gap-3 p-2.5 bg-[var(--surface2)] rounded-lg text-xs">
              <Check size={12} className="text-green-500 shrink-0" />
              <span className="text-[var(--text)] font-medium w-44">{h.name}</span>
              <Badge text={h.status} variant="green" />
              <span className="text-[var(--text-secondary)] ml-auto">Uptime 30d: {h.uptime}</span>
              {h.resp && <span className="text-[var(--text-muted)]">Avg resp: {h.resp}</span>}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-3">Ultima alerta: 09:45 - Connection pool exhausted (resuelto automaticamente)</p>
      </Card>

      <SaveBtn />
    </div>
  );
}

// ===== MAIN =====
export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<STab>('general');
  // primitivos via src/theme/primitives — leen de useTheme() directamente

  const tabContent: Record<STab, React.ReactNode> = {
    general: <GeneralTab />,
    store: <StoreTab />,
    payments: <PaymentsTab />,
    shipping: <ShippingTab />,
    taxes: <TaxesTab />,

    integrations: <IntegrationsTab />,
    developer: <DeveloperTab />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-serif text-lg text-[var(--text)] flex items-center gap-2">
          <Settings size={20} className="text-[var(--accent)]" /> Configuracion
        </h3>
        <button onClick={() => toast.success('Todo guardado')} className="px-3 py-1.5 text-xs bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-1.5">
          <Save size={12} /> Guardar todo
        </button>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 min-w-max border-b border-[var(--border)]">
          {tabItems.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={
                'flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors border-b-2 whitespace-nowrap ' +
                (activeTab === t.id
                  ? 'border-[var(--accent)] text-[var(--accent)] font-medium'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]')
              }
            >
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};