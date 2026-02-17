import React from 'react';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const SalesConditionsPage = () => {
  const sections = [
    { id: 'alcance', label: '1. Alcance' },
    { id: 'naturaleza', label: '2. Naturaleza de los Productos' },
    { id: 'compra', label: '3. Proceso de Compra' },
    { id: 'precios', label: '4. Precios' },
    { id: 'pagos', label: '5. Métodos de Pago' },
    { id: 'fraude', label: '6. Fraude y Chargebacks' },
    { id: 'personalizaciones', label: '7. Personalizaciones' },
    { id: 'cancelacion', label: '8. Cancelación' },
    { id: 'riesgo', label: '9. Transferencia de Riesgo' },
    { id: 'responsabilidad', label: '10. Limitación de Responsabilidad' },
    { id: 'integridad', label: '11. Integridad Contractual' },
    { id: 'legislacion', label: '12. Legislación Aplicable' },
  ];

  return (
    <LegalLayout 
      title="Condiciones de Venta" 
      lastUpdated="12 de Febrero, 2026"
      sections={sections}
    >
      <div className="space-y-16">

        <section id="alcance" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">1. Alcance</h3>
          <p>
            Las presentes Condiciones de Venta regulan la adquisición de productos ofrecidos a través del sitio web operado por DavidSon´s Co. (en adelante, el “Titular”).
          </p>
          <p className="mt-4">
            Al realizar una compra, el cliente acepta expresamente estas Condiciones de Venta.
          </p>
        </section>

        <section id="naturaleza" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">2. Naturaleza de los Productos</h3>
          <p>
            Los productos comercializados pueden ser:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>Piezas artesanales únicas</li>
            <li>Productos de producción limitada</li>
            <li>Objetos decorativos y funcionales</li>
            <li>Obras de arte</li>
          </ul>
          <p className="mt-4">
            Debido a su carácter artesanal, pueden existir variaciones naturales en color, veta, textura, dimensiones y acabado. Estas variaciones forman parte esencial del producto y no constituyen defecto.
          </p>
        </section>

        <section id="compra" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">3. Proceso de Compra</h3>
          <p>
            El proceso de compra se considera completado cuando:
          </p>
          <ol className="list-decimal pl-5 mt-4 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>El cliente confirma el pedido.</li>
            <li>El pago es autorizado por la plataforma correspondiente.</li>
            <li>El Titular envía confirmación electrónica de la orden.</li>
          </ol>
          <p className="mt-4">
            La confirmación de pago no garantiza disponibilidad en caso de errores técnicos, fallas de inventario o inconsistencias evidentes en el precio.
          </p>
          <p className="mt-4">
            El Titular se reserva el derecho de cancelar pedidos cuando exista error manifiesto en el precio, se detecte actividad fraudulenta, el producto no esté disponible o exista imposibilidad material de producción.
          </p>
          <p className="mt-4">
            En caso de cancelación, se reembolsará el monto efectivamente pagado.
          </p>
        </section>

        <section id="precios" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">4. Precios</h3>
          <p>
            Todos los precios se muestran en la moneda indicada en el Sitio.
          </p>
          <p className="mt-4">
            El Titular se reserva el derecho de modificar precios sin previo aviso. No obstante, los cambios no afectarán pedidos ya confirmados.
          </p>
          <p className="mt-4">
            Los precios no incluyen impuestos de importación, aranceles ni cargos aduanales internacionales, los cuales serán responsabilidad exclusiva del cliente.
          </p>
        </section>

        <section id="pagos" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">5. Métodos de Pago</h3>
          <p>
            Los pagos se procesan mediante plataformas externas especializadas. El Titular no almacena información completa de tarjetas bancarias.
          </p>
          <p className="mt-4">
            El cliente garantiza que cuenta con autorización para utilizar el método de pago seleccionado. Cualquier intento de fraude será reportado a las autoridades competentes.
          </p>
        </section>

        <section id="fraude" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">6. Fraude y Chargebacks</h3>
          <p>
            El cliente acepta que la presentación de contracargos (chargebacks) injustificados constituye incumplimiento contractual.
          </p>
          <p className="mt-4 font-medium text-wood-900 dark:text-sand-100">En caso de contracargo fraudulento o improcedente, el Titular podrá:</p>
          <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>Aportar evidencia documental ante la institución financiera.</li>
            <li>Reclamar el monto adeudado por las vías legales correspondientes.</li>
            <li>Suspender futuras compras del cliente.</li>
          </ul>
          <p className="mt-4">
            La confirmación de entrega por parte del transportista constituirá evidencia válida de cumplimiento.
          </p>
        </section>

        <section id="personalizaciones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">7. Personalizaciones</h3>
          <p>
            Los productos personalizados no son reembolsables salvo que presenten defectos de fabricación.
          </p>
          <p className="mt-4">
            El cliente es responsable de proporcionar especificaciones correctas. El Titular no será responsable por errores derivados de instrucciones imprecisas proporcionadas por el cliente.
          </p>
        </section>

        <section id="cancelacion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">8. Cancelación por parte del Cliente</h3>
          <p>
            El cliente podrá solicitar cancelación antes de que el producto haya sido enviado o iniciado su proceso de fabricación.
          </p>
          <p className="mt-4">
            Una vez iniciado el proceso de producción o enviado el producto, no será posible cancelar el pedido salvo disposición expresa del Titular.
          </p>
        </section>

        <section id="riesgo" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">9. Transferencia de Riesgo</h3>
          <p>
            El riesgo sobre el producto se transfiere al cliente una vez que el pedido es entregado al transportista.
          </p>
        </section>

        <section id="responsabilidad" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">10. Limitación de Responsabilidad Contractual</h3>
          <p>
            La responsabilidad total del Titular frente al cliente, en relación con cualquier reclamación derivada de la compra, se limitará estrictamente al monto efectivamente pagado por el producto.
          </p>
          <p className="mt-4 font-medium text-wood-900 dark:text-sand-100">En ningún caso el Titular será responsable por:</p>
          <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>Pérdida de ingresos</li>
            <li>Daños indirectos</li>
            <li>Daños consecuenciales</li>
            <li>Pérdidas comerciales</li>
          </ul>
        </section>

        <section id="integridad" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">11. Integridad Contractual</h3>
          <p>
            Las presentes Condiciones de Venta deben interpretarse conjuntamente con los Términos y Condiciones Generales de Uso, Política de Envíos, Política de Devoluciones, Política de Garantía y Política de Privacidad.
          </p>
        </section>

        <section id="legislacion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">12. Legislación Aplicable</h3>
          <p>
            Estas Condiciones de Venta se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será resuelta conforme a la sección de Resolución de Disputas y Arbitraje publicada en el Sitio.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
};
