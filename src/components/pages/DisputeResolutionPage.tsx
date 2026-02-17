import React from 'react';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const DisputeResolutionPage = () => {
  const sections = [
    { id: 'alcance', label: '1. Alcance' },
    { id: 'amistosa', label: '2. Solución Amistosa' },
    { id: 'arbitraje', label: '3. Arbitraje Vinculante' },
    { id: 'jurisdiccion', label: '4. Jurisdicción' },
    { id: 'colectivas', label: '5. Renuncia a Demandas Colectivas' },
    { id: 'limitacion', label: '6. Limitación de Responsabilidad' },
    { id: 'garantias', label: '7. Exclusión de Garantías' },
    { id: 'fuerza', label: '8. Fuerza Mayor' },
    { id: 'separabilidad', label: '9. Separabilidad' },
    { id: 'modificaciones', label: '10. Modificaciones' },
  ];

  return (
    <LegalLayout 
      title="Resolución de Disputas y Limitación de Responsabilidad" 
      lastUpdated="12 de Febrero, 2026"
      sections={sections}
    >
      <div className="space-y-16">

        <section id="alcance" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">1. Alcance</h3>
          <p>
            La presente sección regula los mecanismos de resolución de controversias y establece las limitaciones integrales de responsabilidad aplicables a cualquier reclamación derivada del uso del sitio web o de la adquisición de productos.
          </p>
          <p className="mt-4">
            Al utilizar el Sitio o realizar una compra, el usuario acepta expresamente estas disposiciones.
          </p>
        </section>

        <section id="amistosa" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">2. Solución Amistosa Previa</h3>
          <p>
            Ante cualquier controversia, el usuario se compromete a contactar previamente al Titular con el fin de intentar una solución amistosa. El Titular contará con un plazo razonable para responder y proponer alternativas de solución.
          </p>
        </section>

        <section id="arbitraje" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">3. Arbitraje Internacional Vinculante</h3>
          <p>
            En caso de no lograrse una solución amistosa, cualquier disputa será sometida a arbitraje vinculante.
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>Será confidencial.</li>
            <li>Se realizará por un árbitro independiente.</li>
            <li>Tendrá carácter definitivo y obligatorio.</li>
            <li>Sustituirá cualquier proceso judicial ordinario, salvo disposición legal imperativa en contrario.</li>
          </ul>
          <p className="mt-4">
            La sede del arbitraje será determinada conforme a la legislación mexicana, salvo acuerdo distinto entre las partes.
          </p>
        </section>

        <section id="jurisdiccion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">4. Jurisdicción Subsidiaria</h3>
          <p>
            En caso de que el arbitraje no sea aplicable por disposición legal obligatoria, las partes se someten a la jurisdicción de los tribunales competentes en México, renunciando a cualquier otro fuero que pudiera corresponderles por razón de su domicilio presente o futuro.
          </p>
        </section>

        <section id="colectivas" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">5. Renuncia a Demandas Colectivas</h3>
          <p>
            En la medida permitida por la legislación aplicable, el usuario acepta que cualquier reclamación deberá presentarse de manera individual. No se permitirá la consolidación de reclamaciones ni acciones colectivas.
          </p>
        </section>

        <section id="limitacion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">6. Limitación Integral de Responsabilidad</h3>
          <p>
            La responsabilidad total de DavidSon´s Co., por cualquier reclamación derivada del uso del Sitio o de la adquisición de productos, se limitará estrictamente al monto efectivamente pagado por el producto objeto de la reclamación.
          </p>
          <p className="mt-4 font-medium text-wood-900 dark:text-sand-100">En ningún caso el Titular será responsable por:</p>
          <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>Daños indirectos, incidentales o consecuenciales.</li>
            <li>Pérdida de ingresos, beneficios u oportunidades comerciales.</li>
            <li>Daños reputacionales.</li>
          </ul>
        </section>

        <section id="garantias" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">7. Exclusión de Garantías No Expresas</h3>
          <p>
            Salvo disposición legal imperativa en contrario, el Titular excluye cualquier garantía implícita no expresamente establecida en los documentos contractuales publicados en el Sitio.
          </p>
        </section>

        <section id="fuerza" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">8. Fuerza Mayor</h3>
          <p>
            El Titular no será responsable por incumplimientos derivados de causas fuera de su control razonable, incluyendo desastres naturales, actos gubernamentales, conflictos laborales, interrupciones logísticas o fallos tecnológicos generalizados.
          </p>
        </section>

        <section id="separabilidad" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">9. Separabilidad</h3>
          <p>
            Si alguna disposición de esta sección fuera considerada inválida o inaplicable, las restantes disposiciones continuarán en pleno vigor.
          </p>
        </section>

        <section id="modificaciones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">10. Modificaciones</h3>
          <p>
            El Titular podrá modificar la presente sección en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el Sitio.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
};
