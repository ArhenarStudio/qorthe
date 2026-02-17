import React from 'react';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const WarrantyPolicyPage = () => {
  const sections = [
    { id: 'alcance', label: '1. Alcance' },
    { id: 'naturaleza', label: '2. Naturaleza Artesanal' },
    { id: 'plazo', label: '3. Plazo de Garantía' },
    { id: 'cobertura', label: '4. Cobertura' },
    { id: 'procedimiento', label: '5. Procedimiento' },
    { id: 'evaluacion', label: '6. Evaluación' },
    { id: 'solucion', label: '7. Solución' },
    { id: 'responsabilidad', label: '8. Limitación de Responsabilidad' },
    { id: 'exclusion', label: '9. Exclusión de Garantías' },
    { id: 'modificaciones', label: '10. Modificaciones' },
  ];

  return (
    <LegalLayout 
      title="Política de Garantía" 
      lastUpdated="12 de Febrero, 2026"
      sections={sections}
    >
      <div className="space-y-16">

        <section id="alcance" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">1. Alcance</h3>
          <p>
            La presente Política de Garantía regula las condiciones aplicables a defectos de fabricación en los productos comercializados a través del sitio web operado por DavidSon´s Co. (en adelante, el “Titular”).
          </p>
          <p className="mt-4">
            Al realizar una compra, el cliente acepta expresamente esta Política.
          </p>
        </section>

        <section id="naturaleza" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">2. Naturaleza Artesanal de los Productos</h3>
          <p>
            Los productos comercializados pueden ser artesanales, únicos o de producción limitada. El cliente reconoce y acepta que las variaciones en veta, tonalidad, textura, dimensiones mínimas y acabado forman parte del carácter natural del material y no constituyen defectos de fabricación.
          </p>
          <p className="mt-4">
            La singularidad es una característica esencial del producto.
          </p>
        </section>

        <section id="plazo" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">3. Plazo de Garantía</h3>
          <p>
            Para productos funcionales como tablas de picar y piezas de contacto alimenticio, se otorga una garantía limitada de 3 (tres) meses contados a partir de la fecha de entrega.
          </p>
          <p className="mt-4">
            Para otras piezas artesanales, la garantía cubrirá únicamente defectos estructurales atribuibles directamente al proceso de fabricación, evaluados caso por caso.
          </p>
        </section>

        <section id="cobertura" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">4. Cobertura</h3>
          <p>
            La garantía cubre exclusivamente defectos estructurales de fabricación y fallas atribuibles directamente al proceso productivo.
          </p>
          <p className="mt-4 font-medium text-wood-900 dark:text-sand-100">La garantía no cubre:</p>
          <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>Daños ocasionados durante el transporte.</li>
            <li>Desgaste natural.</li>
            <li>Cambios por humedad, exposición al agua o calor excesivo.</li>
            <li>Uso indebido o negligente.</li>
            <li>Golpes, caídas o manipulación incorrecta.</li>
            <li>Pérdida, robo o extravío.</li>
            <li>Alteraciones o modificaciones realizadas por el cliente.</li>
          </ul>
        </section>

        <section id="procedimiento" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">5. Procedimiento de Reclamación</h3>
          <p>
            Para solicitar garantía, el cliente deberá contactar al Titular mediante el correo oficial, indicando número de pedido, proporcionando descripción detallada del defecto y adjuntando evidencia fotográfica o audiovisual.
          </p>
          <p className="mt-4">
            La solicitud deberá presentarse dentro del plazo de garantía aplicable.
          </p>
        </section>

        <section id="evaluacion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">6. Evaluación</h3>
          <p>
            El Titular evaluará el reclamo y determinará si el defecto es atribuible a fabricación. La determinación técnica del Titular será definitiva.
          </p>
        </section>

        <section id="solucion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">7. Solución</h3>
          <p>
            En caso de proceder la garantía, el Titular podrá, a su discreción, reparar el producto, reemplazarlo por uno equivalente o reembolsar el monto efectivamente pagado.
          </p>
          <p className="mt-4">
            La elección del mecanismo de solución corresponderá exclusivamente al Titular.
          </p>
        </section>

        <section id="responsabilidad" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">8. Limitación de Responsabilidad</h3>
          <p>
            La responsabilidad total del Titular bajo esta garantía se limita estrictamente al monto efectivamente pagado por el producto. En ningún caso se cubrirán daños indirectos, pérdidas comerciales o perjuicios derivados del uso del producto.
          </p>
        </section>

        <section id="exclusion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">9. Exclusión de Garantías Implícitas</h3>
          <p>
            En la medida permitida por la legislación aplicable, se excluyen garantías implícitas no expresamente establecidas en el presente documento.
          </p>
        </section>

        <section id="modificaciones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">10. Modificaciones</h3>
          <p>
            El Titular podrá modificar la presente Política de Garantía en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el Sitio.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
};
