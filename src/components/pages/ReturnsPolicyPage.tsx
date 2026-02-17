import React from 'react';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const ReturnsPolicyPage = () => {
  const sections = [
    { id: 'alcance', label: '1. Alcance' },
    { id: 'plazo', label: '2. Plazo para Solicitar Devolución' },
    { id: 'condiciones', label: '3. Condiciones del Producto' },
    { id: 'personalizados', label: '4. Productos Personalizados' },
    { id: 'internacionales', label: '5. Devoluciones Internacionales' },
    { id: 'costos', label: '6. Costos de Envío' },
    { id: 'procedimiento', label: '7. Procedimiento' },
    { id: 'inspeccion', label: '8. Inspección y Resolución' },
    { id: 'defectos', label: '9. Defecto de Fabricación' },
    { id: 'exclusiones', label: '10. Exclusiones' },
    { id: 'limitacion', label: '11. Limitación de Responsabilidad' },
    { id: 'modificaciones', label: '12. Modificaciones' },
  ];

  return (
    <LegalLayout 
      title="Política de Devoluciones" 
      lastUpdated="12 de Febrero, 2026"
      sections={sections}
    >
      <div className="space-y-16">

        <section id="alcance" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">1. Alcance</h3>
          <p>
            La presente Política de Devoluciones regula las condiciones bajo las cuales los clientes podrán solicitar la devolución de productos adquiridos a través del sitio web operado por DavidSon´s Co. (en adelante, el “Titular”).
          </p>
          <p className="mt-4">
            Al realizar una compra, el cliente acepta expresamente esta Política.
          </p>
        </section>

        <section id="plazo" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">2. Plazo para Solicitar Devolución</h3>
          <p>
            Para productos estándar (no personalizados), el cliente podrá solicitar devolución dentro de los 15 días naturales posteriores a la fecha de recepción del producto. Después de dicho plazo, no se aceptarán devoluciones.
          </p>
        </section>

        <section id="condiciones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">3. Condiciones del Producto</h3>
          <p>
            Para que una devolución sea aceptada:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>El producto debe encontrarse en estado original.</li>
            <li>No debe presentar señales de uso indebido.</li>
            <li>Debe conservar su empaque original cuando sea posible.</li>
            <li>No debe haber sido modificado o alterado.</li>
          </ul>
          <p className="mt-4">
            El Titular se reserva el derecho de rechazar devoluciones que no cumplan estas condiciones.
          </p>
        </section>

        <section id="personalizados" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">4. Productos Personalizados</h3>
          <p>
            Los productos personalizados o fabricados bajo especificaciones del cliente no son reembolsables, salvo que presenten defectos de fabricación comprobables.
          </p>
          <p className="mt-4">
            Las variaciones derivadas del carácter artesanal no constituyen defecto.
          </p>
        </section>

        <section id="internacionales" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">5. Devoluciones Internacionales</h3>
          <p>
            No se aceptan devoluciones en pedidos internacionales. Al realizar una compra internacional, el cliente acepta expresamente esta condición.
          </p>
        </section>

        <section id="costos" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">6. Costos de Envío de Devolución</h3>
          <p>
            El cliente será responsable de cubrir el costo total del envío de devolución.
          </p>
          <p className="mt-4">
            El Titular no reembolsará costos de envío originales, salvo que exista defecto de fabricación comprobado.
          </p>
        </section>

        <section id="procedimiento" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">7. Procedimiento</h3>
          <p>
            Para iniciar una solicitud de devolución, el cliente deberá contactar al Titular a través del correo oficial, indicando número de pedido y proporcionando evidencia fotográfica si aplica.
          </p>
          <p className="mt-4">
            La devolución deberá ser previamente autorizada por escrito. El envío sin autorización podrá ser rechazado.
          </p>
        </section>

        <section id="inspeccion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">8. Inspección y Resolución</h3>
          <p>
            Una vez recibido el producto, el Titular realizará una inspección para verificar su estado. Si la devolución es aprobada, el Titular podrá, a su discreción, reembolsar el monto pagado o emitir crédito en tienda.
          </p>
          <p className="mt-4">
            El reembolso se realizará por el mismo medio de pago utilizado en la compra, salvo imposibilidad técnica.
          </p>
        </section>

        <section id="defectos" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">9. Productos con Defecto de Fabricación</h3>
          <p>
            En caso de defecto de fabricación comprobado dentro del plazo aplicable, el cliente podrá optar por reparación, reemplazo o reembolso. La determinación final del mecanismo de solución corresponderá al Titular.
          </p>
        </section>

        <section id="exclusiones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">10. Exclusiones</h3>
          <p>
            No se aceptarán devoluciones por variaciones naturales en materiales artesanales, desgaste natural, daños derivados de mal uso, daños ocasionados después de la entrega o preferencia estética subjetiva.
          </p>
        </section>

        <section id="limitacion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">11. Limitación de Responsabilidad</h3>
          <p>
            La responsabilidad total del Titular en relación con devoluciones se limita estrictamente al monto efectivamente pagado por el producto.
          </p>
        </section>

        <section id="modificaciones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">12. Modificaciones</h3>
          <p>
            El Titular podrá modificar la presente Política de Devoluciones en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el Sitio.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
};
