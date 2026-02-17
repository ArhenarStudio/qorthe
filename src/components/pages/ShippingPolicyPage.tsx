"use client";

import React from 'react';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const ShippingPolicyPage = () => {
  const sections = [
    { id: 'alcance', label: '1. Alcance' },
    { id: 'cobertura', label: '2. Cobertura de Envíos' },
    { id: 'procesamiento', label: '3. Tiempos de Procesamiento' },
    { id: 'entrega', label: '4. Tiempos de Entrega' },
    { id: 'impuestos', label: '5. Impuestos y Aduanas' },
    { id: 'direccion', label: '6. Dirección de Entrega' },
    { id: 'riesgo', label: '7. Transferencia de Riesgo' },
    { id: 'danios', label: '8. Daños Durante el Transporte' },
    { id: 'perdida', label: '9. Pérdida, Robo o Extravío' },
    { id: 'fallida', label: '10. Entrega Fallida' },
    { id: 'fuerzamayor', label: '11. Fuerza Mayor' },
    { id: 'modificaciones', label: '12. Modificaciones' },
  ];

  return (
    <LegalLayout 
      title="Política de Envíos" 
      lastUpdated="12 de Febrero, 2026"
      sections={sections}
    >
      <div className="space-y-16">

        <section id="alcance" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">1. Alcance</h3>
          <p>
            La presente Política de Envíos regula las condiciones aplicables a la entrega de productos adquiridos a través del sitio web operado por DavidSon´s Co. (en adelante, el “Titular”).
          </p>
          <p className="mt-4">
            Al realizar una compra, el cliente acepta expresamente esta Política.
          </p>
        </section>

        <section id="cobertura" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">2. Cobertura de Envíos</h3>
          <p>
            El Titular realiza envíos locales, nacionales (México) e internacionales. La disponibilidad de envío puede variar según el destino.
          </p>
        </section>

        <section id="procesamiento" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">3. Tiempos de Procesamiento</h3>
          <p>
            Los tiempos de procesamiento pueden variar dependiendo de la naturaleza del producto, disponibilidad, producción artesanal y volumen de pedidos.
          </p>
          <p className="mt-4">
            Los tiempos estimados son informativos y no constituyen garantía de entrega en fecha específica.
          </p>
        </section>

        <section id="entrega" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">4. Tiempos de Entrega</h3>
          <p>
            Los tiempos de entrega son estimados y dependen del transportista seleccionado. El Titular no será responsable por retrasos derivados de procesos aduanales, condiciones climáticas, eventos de fuerza mayor, retrasos logísticos o inspecciones gubernamentales.
          </p>
        </section>

        <section id="impuestos" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">5. Impuestos y Aduanas (Envíos Internacionales)</h3>
          <p className="font-medium text-wood-900 dark:text-sand-100 mb-2">En pedidos internacionales:</p>
          <ul className="list-disc pl-5 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>El cliente es el importador del producto.</li>
            <li>El cliente asume la totalidad de aranceles, impuestos y cargos aduanales.</li>
            <li>El cliente es responsable de cumplir con la normativa del país de destino.</li>
          </ul>
          <p className="mt-4">
            El Titular no se hace responsable por retenciones aduanales. En caso de que el paquete sea retenido, rechazado o abandonado por el cliente, no se realizará reembolso.
          </p>
        </section>

        <section id="direccion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">6. Dirección de Entrega</h3>
          <p>
            El cliente es responsable de proporcionar datos completos y correctos de envío.
          </p>
          <p className="mt-4 font-medium text-wood-900 dark:text-sand-100 mb-2">En caso de error en la dirección:</p>
          <ul className="list-disc pl-5 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>El Titular hará esfuerzos razonables para apoyar en la corrección.</li>
            <li>Cualquier costo adicional será responsabilidad del cliente.</li>
            <li>Si el paquete no puede ser entregado por información incorrecta, no se garantiza reembolso.</li>
          </ul>
        </section>

        <section id="riesgo" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">7. Transferencia de Riesgo</h3>
          <p>
            El riesgo sobre el producto se transfiere al cliente una vez que el pedido es entregado al transportista.
          </p>
        </section>

        <section id="danios" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">8. Daños Durante el Transporte</h3>
          <p>
            La responsabilidad primaria por daños durante el transporte corresponde al transportista. Si el cliente adquiere seguro adicional, cualquier reclamación se gestionará conforme a los términos de la póliza correspondiente.
          </p>
          <p className="mt-4">
            En ausencia de seguro, el Titular podrá evaluar el caso de manera discrecional. El cliente deberá reportar daños visibles dentro de las primeras 48 horas posteriores a la recepción, proporcionando evidencia fotográfica.
          </p>
        </section>

        <section id="perdida" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">9. Pérdida, Robo o Extravío</h3>
          <p>
            Una vez que el pedido ha sido entregado al transportista, el Titular no será responsable por pérdida, robo o extravío. Cualquier reclamación deberá realizarse directamente con la empresa transportista o aseguradora correspondiente.
          </p>
        </section>

        <section id="fallida" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">10. Entrega Fallida</h3>
          <p>
            Si un envío es devuelto al remitente por causas imputables al cliente (dirección incorrecta, ausencia reiterada, rechazo injustificado), el cliente deberá cubrir los costos de reenvío y no se garantizará reembolso del costo original de envío.
          </p>
        </section>

        <section id="fuerzamayor" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">11. Fuerza Mayor</h3>
          <p>
            El Titular no será responsable por retrasos o incumplimientos derivados de causas fuera de su control razonable, incluyendo desastres naturales, conflictos laborales, interrupciones logísticas o actos gubernamentales.
          </p>
        </section>

        <section id="modificaciones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">12. Modificaciones</h3>
          <p>
            El Titular se reserva el derecho de modificar la presente Política de Envíos en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el Sitio.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
};
