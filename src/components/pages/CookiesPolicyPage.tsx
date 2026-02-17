import React from 'react';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const CookiesPolicyPage = () => {
  const sections = [
    { id: 'definicion', label: '1. ¿Qué son las Cookies?' },
    { id: 'tipos', label: '2. Tipo de Cookies Utilizadas' },
    { id: 'finalidad', label: '3. Finalidad del Uso' },
    { id: 'terceros', label: '4. Cookies de Terceros' },
    { id: 'consentimiento', label: '5. Consentimiento' },
    { id: 'configuracion', label: '6. Configuración' },
    { id: 'conservacion', label: '7. Conservación de Datos' },
    { id: 'modificaciones', label: '8. Modificaciones' },
  ];

  return (
    <LegalLayout 
      title="Política de Cookies" 
      lastUpdated="12 de Febrero, 2026"
      sections={sections}
    >
      <div className="space-y-16">

        <section id="definicion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">1. ¿Qué son las Cookies?</h3>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en el dispositivo del usuario cuando visita un sitio web. Permiten recordar información sobre la navegación y mejorar la experiencia del usuario.
          </p>
        </section>

        <section id="tipos" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">2. Tipo de Cookies Utilizadas</h3>
          <p className="mb-6">El sitio web puede utilizar las siguientes categorías de cookies:</p>
          
          <div className="space-y-8">
            <div className="bg-wood-900/5 dark:bg-sand-100/5 p-6 rounded-lg border border-wood-900/10 dark:border-sand-100/10">
              <h4 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-2">a) Cookies Técnicas o Necesarias</h4>
              <p className="text-sm mb-4">Permiten el funcionamiento básico del sitio, como gestión de sesión, acceso a cuenta, procesamiento de pagos y seguridad.</p>
              <span className="text-xs uppercase tracking-widest text-wood-900/60 dark:text-sand-100/60 border border-wood-900/20 dark:border-sand-100/20 px-2 py-1 rounded">Esenciales</span>
            </div>

            <div className="bg-wood-900/5 dark:bg-sand-100/5 p-6 rounded-lg border border-wood-900/10 dark:border-sand-100/10">
              <h4 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-2">b) Cookies Analíticas</h4>
              <p className="text-sm mb-4">Permiten recopilar información estadística sobre el uso del Sitio, como páginas visitadas, tiempo de permanencia e interacciones.</p>
              <span className="text-xs uppercase tracking-widest text-wood-900/60 dark:text-sand-100/60 border border-wood-900/20 dark:border-sand-100/20 px-2 py-1 rounded">Rendimiento</span>
            </div>

            <div className="bg-wood-900/5 dark:bg-sand-100/5 p-6 rounded-lg border border-wood-900/10 dark:border-sand-100/10">
              <h4 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-2">c) Cookies Publicitarias</h4>
              <p className="text-sm mb-4">Permiten mostrar anuncios personalizados y realizar campañas de marketing basadas en el comportamiento de navegación.</p>
              <span className="text-xs uppercase tracking-widest text-wood-900/60 dark:text-sand-100/60 border border-wood-900/20 dark:border-sand-100/20 px-2 py-1 rounded">Marketing</span>
            </div>
          </div>
        </section>

        <section id="finalidad" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">3. Finalidad del Uso de Cookies</h3>
          <p>
            Las cookies se utilizan para mejorar la experiencia de navegación, analizar el comportamiento de los usuarios, optimizar el funcionamiento del Sitio, realizar campañas publicitarias y medir la efectividad de estrategias comerciales.
          </p>
        </section>

        <section id="terceros" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">4. Cookies de Terceros</h3>
          <p>
            El Sitio puede integrar herramientas de terceros para procesamiento de pagos, análisis estadístico, publicidad digital e integración con redes sociales.
          </p>
          <p className="mt-4">
            Estas herramientas pueden instalar sus propias cookies conforme a sus respectivas políticas de privacidad. El Titular no controla directamente las cookies gestionadas por terceros.
          </p>
        </section>

        <section id="consentimiento" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">5. Consentimiento</h3>
          <p>
            Al continuar navegando en el Sitio, el usuario acepta el uso de cookies conforme a la presente Política. Cuando sea legalmente requerido, el usuario podrá gestionar su consentimiento mediante el banner o herramienta de configuración disponible en el Sitio.
          </p>
        </section>

        <section id="configuracion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">6. Configuración y Desactivación</h3>
          <p>
            El usuario puede configurar su navegador para bloquear cookies, eliminar las almacenadas o recibir notificaciones antes de su instalación.
          </p>
          <p className="mt-4">
            La desactivación de ciertas cookies puede afectar el funcionamiento del Sitio.
          </p>
        </section>

        <section id="conservacion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">7. Conservación de Datos</h3>
          <p>
            Las cookies pueden conservarse durante el tiempo necesario para cumplir con su finalidad específica, dependiendo de su tipo.
          </p>
        </section>

        <section id="modificaciones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">8. Modificaciones</h3>
          <p>
            El Titular podrá modificar la presente Política de Cookies en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el Sitio.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
};
