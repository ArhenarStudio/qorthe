import React from 'react';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const IntellectualPropertyPage = () => {
  const sections = [
    { id: 'titularidad', label: '1. Titularidad' },
    { id: 'proteccion', label: '2. Protección de Diseños y Obras' },
    { id: 'prohibidos', label: '3. Usos Prohibidos' },
    { id: 'marca', label: '4. Marca' },
    { id: 'usuarios', label: '5. Contenido de Usuarios' },
    { id: 'terceros', label: '6. Derechos de Terceros' },
    { id: 'reserva', label: '7. Reserva de Derechos' },
    { id: 'modificaciones', label: '8. Modificaciones' },
  ];

  return (
    <LegalLayout 
      title="Política de Propiedad Intelectual" 
      lastUpdated="12 de Febrero, 2026"
      sections={sections}
    >
      <div className="space-y-16">

        <section id="titularidad" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">1. Titularidad</h3>
          <p>
            Todos los contenidos publicados en el sitio web, incluyendo de manera enunciativa mas no limitativa:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>Diseños originales</li>
            <li>Piezas artísticas y artesanales</li>
            <li>Bocetos y conceptos creativos</li>
            <li>Renders y visualizaciones digitales</li>
            <li>Fotografías</li>
            <li>Textos y descripciones</li>
            <li>Logotipos y elementos gráficos</li>
            <li>Identidad visual y elementos de marca</li>
          </ul>
          <p className="mt-4">
            son propiedad exclusiva de DavidSon´s Co., y se encuentran protegidos por la legislación aplicable en materia de propiedad intelectual e industrial, tanto en México como en el ámbito internacional.
          </p>
        </section>

        <section id="proteccion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">2. Protección de Diseños y Obras</h3>
          <p>
            Las piezas comercializadas pueden constituir obras artísticas o diseños originales. La adquisición de un producto no implica la cesión de derechos de propiedad intelectual sobre el diseño, concepto o reproducción del mismo. El cliente adquiere únicamente la propiedad material del objeto físico.
          </p>
        </section>

        <section id="prohibidos" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">3. Usos Prohibidos</h3>
          <p>
            Queda estrictamente prohibido sin autorización previa y por escrito del Titular:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>Reproducir total o parcialmente cualquier contenido del Sitio.</li>
            <li>Copiar, modificar o adaptar diseños.</li>
            <li>Comercializar productos derivados de los diseños.</li>
            <li>Utilizar imágenes o renders con fines comerciales.</li>
            <li>Registrar como propios elementos creativos del Titular.</li>
          </ul>
          <p className="mt-4">
            El uso no autorizado podrá dar lugar a acciones civiles, administrativas o penales conforme a la legislación aplicable.
          </p>
        </section>

        <section id="marca" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">4. Marca</h3>
          <p>
            El nombre comercial DavidSon´s Design, así como cualquier signo distintivo asociado, constituye un activo protegido. El uso no autorizado de la marca, logotipo o identidad visual está prohibido.
          </p>
        </section>

        <section id="usuarios" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">5. Contenido Generado por Usuarios</h3>
          <p>
            Si el usuario envía reseñas, fotografías o contenido relacionado con los productos, concede al Titular una licencia no exclusiva para utilizar dicho contenido con fines promocionales, salvo manifestación expresa en contrario. El usuario garantiza que dicho contenido no infringe derechos de terceros.
          </p>
        </section>

        <section id="terceros" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">6. Derechos de Terceros</h3>
          <p>
            Si cualquier persona considera que un contenido del Sitio infringe sus derechos de propiedad intelectual, podrá notificarlo al correo oficial proporcionando información suficiente para su análisis. El Titular evaluará la solicitud y, en su caso, adoptará las medidas pertinentes.
          </p>
        </section>

        <section id="reserva" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">7. Reserva de Derechos</h3>
          <p>
            Todos los derechos no expresamente concedidos en el presente documento quedan reservados.
          </p>
        </section>

        <section id="modificaciones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">8. Modificaciones</h3>
          <p>
            El Titular podrá modificar la presente Política de Propiedad Intelectual en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el Sitio.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
};
