import React from 'react';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const LegalNoticePage = () => {
  const sections = [
    { id: 'identificacion', label: '1. Identificación del Titular' },
    { id: 'objeto', label: '2. Objeto del Sitio' },
    { id: 'condiciones', label: '3. Condiciones de Acceso y Uso' },
    { id: 'exactitud', label: '4. Exactitud de la Información' },
    { id: 'disponibilidad', label: '5. Disponibilidad del Sitio' },
    { id: 'enlaces', label: '6. Enlaces a Terceros' },
    { id: 'propiedad-intelectual', label: '7. Propiedad Intelectual' },
    { id: 'limitacion', label: '8. Limitación de Responsabilidad' },
    { id: 'modificaciones', label: '9. Modificaciones' },
    { id: 'legislacion', label: '10. Legislación Aplicable' },
  ];

  return (
    <LegalLayout 
      title="Aviso Legal" 
      lastUpdated="12 de Febrero, 2026"
      sections={sections}
    >
      <div className="space-y-16">
        
        {/* Intro / Company Info */}
        <div className="bg-wood-900/5 dark:bg-sand-100/5 p-8 rounded-lg border border-wood-900/10 dark:border-sand-100/10 mb-12">
          <h2 className="font-serif text-xl text-wood-900 dark:text-sand-100 mb-4">DavidSon´s Co.</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-wood-900/60 dark:text-sand-100/60 uppercase tracking-widest text-xs mb-1">Nombre Comercial</p>
              <p className="text-wood-900 dark:text-sand-100 font-medium">DavidSon´s Design</p>
            </div>
            <div>
              <p className="text-wood-900/60 dark:text-sand-100/60 uppercase tracking-widest text-xs mb-1">Domicilio</p>
              <p className="text-wood-900 dark:text-sand-100 font-medium">El Conquistador, Hermosillo, Sonora, México</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-wood-900/60 dark:text-sand-100/60 uppercase tracking-widest text-xs mb-1">Contacto</p>
              <a href="mailto:contacto@davidsonsdesign.com" className="text-wood-900 dark:text-sand-100 font-medium hover:text-wood-600 dark:hover:text-sand-300 transition-colors border-b border-wood-900/30 dark:border-sand-100/30 pb-0.5">
                contacto@davidsonsdesign.com
              </a>
            </div>
          </div>
        </div>

        <section id="identificacion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">1. Identificación del Titular</h3>
          <p>
            El presente sitio web (en adelante, el “Sitio”) es operado por DavidSon´s Co., empresa constituida conforme a las leyes de los Estados Unidos Mexicanos, con domicilio parcial en El Conquistador, Hermosillo, Sonora, México.
          </p>
          <p className="mt-4">
            El acceso, navegación y uso del Sitio atribuye la condición de usuario e implica la aceptación plena y sin reservas del presente Aviso Legal.
          </p>
        </section>

        <section id="objeto" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">2. Objeto del Sitio</h3>
          <p>
            El Sitio tiene como finalidad la exhibición, promoción y comercialización de productos físicos artesanales, piezas únicas, objetos decorativos, obras de arte y productos de producción limitada, así como cualquier otro producto o servicio que el titular incorpore en el futuro.
          </p>
          <p className="mt-4">
            El titular se reserva el derecho de modificar, suspender o descontinuar en cualquier momento el contenido, productos, servicios o funcionalidades del Sitio sin previo aviso.
          </p>
        </section>

        <section id="condiciones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">3. Condiciones de Acceso y Uso</h3>
          <p>
            El usuario se compromete a utilizar el Sitio de conformidad con la legislación aplicable, la buena fe, el orden público y el presente Aviso Legal.
          </p>
          <p className="mt-4 font-medium text-wood-900 dark:text-sand-100">Queda estrictamente prohibido:</p>
          <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>Utilizar el Sitio con fines ilícitos o fraudulentos.</li>
            <li>Introducir virus, malware o cualquier elemento tecnológico dañino.</li>
            <li>Intentar acceder de manera no autorizada a sistemas, bases de datos o información del titular.</li>
            <li>Realizar actos que puedan dañar, inutilizar o sobrecargar la infraestructura del Sitio.</li>
          </ul>
          <p className="mt-4">
            El titular podrá restringir o cancelar el acceso al Sitio a cualquier usuario que incumpla estas disposiciones.
          </p>
        </section>

        <section id="exactitud" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">4. Exactitud de la Información</h3>
          <p>
            La información contenida en el Sitio se proporciona con fines informativos y comerciales. Aunque se realizan esfuerzos razonables para mantener la información actualizada y precisa, el titular no garantiza la ausencia de errores tipográficos, técnicos o involuntarios.
          </p>
          <p className="mt-4">
            En caso de error evidente en precios, disponibilidad o características de producto, el titular se reserva el derecho de cancelar la transacción y reembolsar cualquier cantidad pagada.
          </p>
        </section>

        <section id="disponibilidad" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">5. Disponibilidad del Sitio</h3>
          <p>
            El titular no garantiza la disponibilidad continua, permanente o ininterrumpida del Sitio. El acceso puede verse suspendido temporalmente por razones técnicas, mantenimiento, actualizaciones o causas ajenas al control del titular.
          </p>
          <p className="mt-4">
            No se asume responsabilidad por daños derivados de interrupciones, fallos técnicos o indisponibilidad temporal.
          </p>
        </section>

        <section id="enlaces" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">6. Enlaces a Terceros</h3>
          <p>
            El Sitio puede contener enlaces a plataformas o servicios de terceros. El titular no controla ni asume responsabilidad por el contenido, políticas o prácticas de dichos terceros.
          </p>
          <p className="mt-4">
            La inclusión de enlaces externos no implica relación, respaldo ni aprobación alguna.
          </p>
        </section>

        <section id="propiedad-intelectual" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">7. Propiedad Intelectual</h3>
          <p>
            Todos los contenidos del Sitio, incluyendo de manera enunciativa mas no limitativa:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-6 bg-wood-900/5 dark:bg-sand-100/5 border border-wood-900/10 dark:border-sand-100/10 rounded-lg">
            {['Diseños', 'Fotografía', 'Renders', 'Textos', 'Logotipos', 'Elementos gráficos', 'Conceptos creativos'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-wood-900 dark:bg-sand-100 rounded-full opacity-60"></span>
                <span className="text-wood-900 dark:text-sand-100 font-medium">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-6">
            son propiedad exclusiva de DavidSon´s Co. y se encuentran protegidos por la legislación aplicable en materia de propiedad intelectual e industrial.
          </p>
          <p className="mt-4">
            Queda prohibida su reproducción, distribución, comunicación pública, modificación o uso comercial sin autorización previa y por escrito.
          </p>
        </section>

        <section id="limitacion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">8. Limitación General de Responsabilidad</h3>
          <p>
            El titular no será responsable por daños directos, indirectos, incidentales o consecuenciales derivados del uso o imposibilidad de uso del Sitio, salvo en los casos expresamente previstos por la ley aplicable.
          </p>
          <p className="mt-4">
            La responsabilidad total del titular frente al usuario, en cualquier caso, se limitará estrictamente al monto efectivamente pagado por el producto o servicio adquirido.
          </p>
        </section>

        <section id="modificaciones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">9. Modificaciones</h3>
          <p>
            El titular se reserva el derecho de modificar el presente Aviso Legal en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el Sitio.
          </p>
          <p className="mt-4">
            Se recomienda al usuario revisar periódicamente esta sección.
          </p>
        </section>

        <section id="legislacion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">10. Legislación Aplicable</h3>
          <p>
            El presente Aviso Legal se rige por las leyes de los Estados Unidos Mexicanos.
          </p>
          <p className="mt-4">
            Cualquier controversia relacionada con el acceso o uso del Sitio será resuelta conforme a lo establecido en la sección correspondiente de Resolución de Disputas y Arbitraje publicada en este Sitio.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
};
