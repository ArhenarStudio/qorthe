"use client";

import React from 'react';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const PrivacyPolicyPage = () => {
  const sections = [
    { id: 'responsable', label: '1. Responsable del Tratamiento' },
    { id: 'datos', label: '2. Datos Personales Recopilados' },
    { id: 'finalidades', label: '3. Finalidades del Tratamiento' },
    { id: 'base', label: '4. Base Legal' },
    { id: 'seguridad', label: '5. Almacenamiento y Seguridad' },
    { id: 'transferencia', label: '6. Transferencia de Datos' },
    { id: 'derechos', label: '7. Derechos del Titular' },
    { id: 'conservacion', label: '8. Conservación de Datos' },
    { id: 'comunicaciones', label: '9. Comunicaciones Comerciales' },
    { id: 'cookies', label: '10. Cookies' },
    { id: 'internacionales', label: '11. Transferencias Internacionales' },
    { id: 'modificaciones', label: '12. Modificaciones' },
  ];

  return (
    <LegalLayout 
      title="Política de Privacidad" 
      lastUpdated="12 de Febrero, 2026"
      sections={sections}
    >
      <div className="space-y-16">

        {/* Intro / Company Info */}
        <div className="bg-wood-900/5 dark:bg-sand-100/5 p-8 rounded-lg border border-wood-900/10 dark:border-sand-100/10 mb-12">
          <h2 className="font-serif text-xl text-wood-900 dark:text-sand-100 mb-4">DavidSon´s Co.</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-wood-500 dark:text-sand-100/60 uppercase tracking-widest text-xs mb-1">Nombre Comercial</p>
              <p className="text-wood-900 dark:text-sand-100 font-medium">DavidSon´s Design</p>
            </div>
            <div>
              <p className="text-wood-500 dark:text-sand-100/60 uppercase tracking-widest text-xs mb-1">Domicilio</p>
              <p className="text-wood-900 dark:text-sand-100 font-medium">El Conquistador, Hermosillo, Sonora, México</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-wood-500 dark:text-sand-100/60 uppercase tracking-widest text-xs mb-1">Contacto de Privacidad</p>
              <a href="mailto:contacto@davidsonsdesign.com" className="text-wood-900 dark:text-sand-100 font-medium hover:text-wood-600 dark:hover:text-sand-300 transition-colors border-b border-wood-900/30 dark:border-sand-100/30 pb-0.5">
                contacto@davidsonsdesign.com
              </a>
            </div>
          </div>
        </div>

        <section id="responsable" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">1. Responsable del Tratamiento</h3>
          <p>
            DavidSon´s Co. (en adelante, el “Responsable”) es el encargado del tratamiento de los datos personales recabados a través del sitio web. El tratamiento de datos se realiza conforme a la legislación aplicable en México y principios internacionales de protección de datos.
          </p>
        </section>

        <section id="datos" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">2. Datos Personales Recopilados</h3>
          <p>
            El Responsable podrá recopilar las siguientes categorías de datos:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-wood-500/50 dark:marker:text-sand-100/50">
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Número telefónico (cuando sea proporcionado)</li>
            <li>Dirección de envío y facturación</li>
            <li>Datos fiscales</li>
            <li>Información de cuenta de usuario</li>
            <li>Historial de compras</li>
            <li>Dirección IP y datos de navegación</li>
          </ul>
          <p className="mt-4">
            Los datos financieros son procesados por plataformas externas de pago. El Responsable no almacena información completa de tarjetas bancarias.
          </p>
        </section>

        <section id="finalidades" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">3. Finalidades del Tratamiento</h3>
          <p>
            Los datos personales se utilizan para procesar y gestionar pedidos, enviar confirmaciones y notificaciones, atender solicitudes de servicio al cliente, gestionar cuentas de usuario, cumplir obligaciones legales y fiscales, enviar comunicaciones comerciales (con autorización) y realizar análisis estadísticos.
          </p>
        </section>

        <section id="base" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">4. Base Legal del Tratamiento</h3>
          <p>
            El tratamiento se basa en la ejecución de una relación contractual, el consentimiento del titular, el cumplimiento de obligaciones legales e intereses legítimos del Responsable.
          </p>
        </section>

        <section id="seguridad" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">5. Almacenamiento y Seguridad</h3>
          <p>
            El Responsable implementa medidas razonables de seguridad técnicas y organizativas para proteger la información contra acceso no autorizado, pérdida o alteración. Sin embargo, ningún sistema es completamente invulnerable, por lo que no se garantiza seguridad absoluta.
          </p>
        </section>

        <section id="transferencia" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">6. Transferencia de Datos</h3>
          <p>
            Los datos podrán compartirse con procesadores de pago, proveedores logísticos, plataformas tecnológicas y autoridades competentes cuando sea requerido por ley. Estas transferencias se realizan únicamente cuando son necesarias para la prestación del servicio.
          </p>
        </section>

        <section id="derechos" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">7. Derechos del Titular</h3>
          <p>
            El usuario podrá ejercer en cualquier momento sus derechos de acceso, rectificación, cancelación, oposición, eliminación de cuenta y solicitud de supresión de datos.
          </p>
          <p className="mt-4">
            La solicitud deberá enviarse al correo oficial, acreditando identidad.
          </p>
        </section>

        <section id="conservacion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">8. Conservación de Datos</h3>
          <p>
            Los datos se conservarán durante el tiempo necesario para cumplir con las finalidades descritas y obligaciones legales aplicables. Posteriormente, serán eliminados o anonimizados.
          </p>
        </section>

        <section id="comunicaciones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">9. Comunicaciones Comerciales</h3>
          <p>
            El usuario podrá suscribirse voluntariamente a comunicaciones promocionales y podrá cancelar la suscripción en cualquier momento mediante el enlace incluido en cada comunicación.
          </p>
        </section>

        <section id="cookies" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">10. Cookies y Tecnologías de Seguimiento</h3>
          <p>
            El Sitio utiliza cookies y tecnologías similares para mejorar la experiencia del usuario, realizar análisis estadísticos y campañas publicitarias. Para mayor información, consulte la Política de Cookies.
          </p>
        </section>

        <section id="internacionales" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">11. Transferencias Internacionales</h3>
          <p>
            En caso de que los datos sean transferidos fuera de México, el Responsable procurará que se implementen mecanismos adecuados de protección conforme a estándares internacionales.
          </p>
        </section>

        <section id="modificaciones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">12. Modificaciones</h3>
          <p>
            El Responsable podrá modificar la presente Política de Privacidad en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el Sitio.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
};
