"use client";

import React from 'react';
import { LegalLayout } from '@/components/layout/LegalLayout';

export const TermsPage = () => {
  const sections = [
    { id: 'objeto', label: '1. Objeto' },
    { id: 'usuario', label: '2. Condición de Usuario' },
    { id: 'uso', label: '3. Uso Permitido' },
    { id: 'cuentas', label: '4. Cuentas de Usuario' },
    { id: 'disponibilidad', label: '5. Disponibilidad' },
    { id: 'contenido', label: '6. Contenido y Representaciones' },
    { id: 'modificaciones', label: '7. Modificaciones' },
    { id: 'enlaces', label: '8. Enlaces Externos' },
    { id: 'responsabilidad', label: '9. Responsabilidad' },
    { id: 'suspension', label: '10. Suspensión' },
    { id: 'integridad', label: '11. Integridad Contractual' },
    { id: 'legislacion', label: '12. Legislación Aplicable' },
  ];

  return (
    <LegalLayout 
      title="Términos y Condiciones Generales de Uso" 
      lastUpdated="12 de Febrero, 2026"
      sections={sections}
    >
      <div className="space-y-16">

        <section id="objeto" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">1. Objeto</h3>
          <p>
            Los presentes Términos y Condiciones Generales de Uso (en adelante, los “Términos”) regulan el acceso, navegación y utilización del sitio web operado por Qorthe´s Co. (en adelante, el “Titular”).
          </p>
          <p className="mt-4">
            El acceso al Sitio implica la aceptación plena, expresa y sin reservas de los presentes Términos. Si el usuario no está de acuerdo, deberá abstenerse de utilizar el Sitio.
          </p>
        </section>

        <section id="usuario" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">2. Condición de Usuario</h3>
          <p>
            Se considera usuario a toda persona que acceda, navegue, se registre o realice una compra a través del Sitio.
          </p>
          <p className="mt-4">
            El usuario declara que la información proporcionada será veraz, completa y actualizada. El Titular no será responsable por información incorrecta proporcionada por el usuario.
          </p>
        </section>

        <section id="uso" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">3. Uso Permitido</h3>
          <p>
            El usuario se compromete a utilizar el Sitio únicamente para fines legítimos y conforme a la legislación aplicable.
          </p>
          <p className="mt-4 font-medium text-wood-900 dark:text-sand-100">Queda prohibido:</p>
          <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
            <li>Utilizar el Sitio con fines fraudulentos.</li>
            <li>Realizar actos que puedan afectar la seguridad, integridad o funcionamiento del Sitio.</li>
            <li>Intentar acceder a áreas restringidas sin autorización.</li>
            <li>Reproducir, copiar o explotar contenidos sin autorización escrita del Titular.</li>
          </ul>
          <p className="mt-4">
            El incumplimiento podrá dar lugar a la suspensión inmediata del acceso.
          </p>
        </section>

        <section id="cuentas" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">4. Cuentas de Usuario</h3>
          <p>
            El Sitio podrá permitir la creación de cuentas personales. El usuario es responsable de mantener la confidencialidad de sus credenciales y de todas las actividades realizadas desde su cuenta.
          </p>
          <p className="mt-4">
            El Titular podrá suspender o cancelar cuentas en caso de uso indebido, sospecha de fraude o incumplimiento de los presentes Términos. El usuario podrá solicitar la eliminación de su cuenta conforme a la Política de Privacidad.
          </p>
        </section>

        <section id="disponibilidad" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">5. Disponibilidad y Continuidad</h3>
          <p>
            El Titular no garantiza que el Sitio funcione de manera ininterrumpida o libre de errores. El acceso puede verse limitado por mantenimiento, actualizaciones técnicas o causas de fuerza mayor.
          </p>
          <p className="mt-4">
            El Titular no será responsable por interrupciones, fallos técnicos o pérdida de información derivada del uso del Sitio.
          </p>
        </section>

        <section id="contenido" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">6. Contenido y Representaciones</h3>
          <p>
            Los productos comercializados pueden ser artesanales o de producción limitada. Las imágenes, colores y texturas mostradas en pantalla pueden variar respecto al producto final debido a variaciones naturales del material, procesos artesanales o la configuración de dispositivos del usuario.
          </p>
          <p className="mt-4">
            Estas variaciones no constituyen defecto.
          </p>
        </section>

        <section id="modificaciones" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">7. Modificaciones del Sitio</h3>
          <p>
            El Titular se reserva el derecho de modificar, actualizar o eliminar contenidos, productos, precios o funcionalidades sin previo aviso.
          </p>
          <p className="mt-4">
            La continuidad en el uso del Sitio tras la publicación de cambios implica la aceptación de los mismos.
          </p>
        </section>

        <section id="enlaces" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">8. Enlaces Externos</h3>
          <p>
            El Sitio puede incluir enlaces a servicios o plataformas externas. El Titular no controla ni asume responsabilidad por el contenido, políticas o prácticas de dichos terceros.
          </p>
        </section>

        <section id="responsabilidad" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">9. Limitación de Responsabilidad por Uso</h3>
          <p>
            El uso del Sitio se realiza bajo responsabilidad exclusiva del usuario. El Titular no será responsable por decisiones tomadas con base en información del Sitio, daños derivados del uso indebido del Sitio, o ataques informáticos o accesos no autorizados fuera de su control razonable.
          </p>
        </section>

        <section id="suspension" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">10. Suspensión o Cancelación</h3>
          <p>
            El Titular podrá restringir, suspender o cancelar el acceso al Sitio sin previo aviso en caso de incumplimiento de los presentes Términos, actividades sospechosas o fraudulentas, o uso que comprometa la seguridad del Sitio.
          </p>
        </section>

        <section id="integridad" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">11. Integridad Contractual</h3>
          <p>
            Estos Términos regulan exclusivamente el uso del Sitio. Las condiciones específicas de compra se regulan en las Condiciones de Venta correspondientes.
          </p>
        </section>

        <section id="legislacion" className="scroll-mt-32">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">12. Legislación Aplicable</h3>
          <p>
            Los presentes Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será resuelta conforme a la sección de Resolución de Disputas y Arbitraje publicada en el Sitio.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
};
