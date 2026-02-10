"use client";

import Link from 'next/link';
import { useAppState } from '@/modules/app-state';
import { Newsletter } from '@/modules/newsletter';
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Calendar,
  Calculator,
  GitCompare,
  Image,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

export function Footer() {
  const { isDarkMode, language } = useAppState();

  const companyDescription = language === 'es'
    ? "Una herencia sin nombre que hoy encuentra forma. Artesanía consciente, diseño sobrio y madera trabajada con precisión. Piezas de autor creadas desde la tradición, pensadas para el tiempo."
    : "A nameless heritage that finds form today. Conscious craftsmanship, sober design and precisely worked wood. Author pieces created from tradition, designed for time.";

  const aboutTitle = language === 'es' ? 'Sobre Nosotros' : 'About Us';
  const toolsTitle = language === 'es' ? 'Herramientas' : 'Tools';
  const contactTitle = language === 'es' ? 'Contacto' : 'Contact';
  const followUsTitle = language === 'es' ? 'Síguenos' : 'Follow Us';
  const copyright = language === 'es'
    ? '© 2026 Davidsons Design. Todos los derechos reservados.'
    : '© 2026 Davidsons Design. All rights reserved.';

  const aboutLinks = [
    { name: language === 'es' ? 'Misión y Visión' : 'Mission & Vision', href: '/mission-vision' },
    { name: language === 'es' ? 'Quiénes Somos' : 'About Us', href: '/about' },
    { name: language === 'es' ? 'Nuestro Equipo' : 'Our Team', href: '/team' },
    { name: language === 'es' ? 'Historia' : 'Timeline', href: '/timeline' },
    { name: language === 'es' ? 'Certificaciones' : 'Certifications', href: '/certifications' },
  ];

  const tools = [
    { name: language === 'es' ? 'Agendar Cita' : 'Schedule Appointment', href: '/appointment', icon: Calendar },
    { name: language === 'es' ? 'Calculadora' : 'Financing Calculator', href: '/financing-calculator', icon: Calculator },
    { name: language === 'es' ? 'Comparador' : 'Product Comparison', href: '/compare', icon: GitCompare },
    { name: language === 'es' ? 'Galería de Proyectos' : 'Project Gallery', href: '/gallery', icon: Image },
    { name: language === 'es' ? 'Preguntas Frecuentes' : 'FAQs', href: '/faq', icon: HelpCircle },
    { name: language === 'es' ? 'Blog' : 'Blog', href: '/blog', icon: BookOpen },
  ];

  const legalLinks = [
    { name: language === 'es' ? 'Política de Privacidad' : 'Privacy Policy', href: '/privacy' },
    { name: language === 'es' ? 'Términos y Condiciones' : 'Terms & Conditions', href: '/terms' },
    { name: language === 'es' ? 'Política de Cookies' : 'Cookie Policy', href: '/cookies' },
  ];

  const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com/davidsonsdesign', icon: Facebook },
    { name: 'Instagram', href: 'https://instagram.com/davidsonsdesign', icon: Instagram },
    { name: 'YouTube', href: 'https://youtube.com/davidsonsdesign', icon: Youtube },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/davidsonsdesign', icon: Linkedin },
  ];

  return (
    <footer id="contact" className={`border-t ${
      isDarkMode ? 'bg-[#0a0806] border-[#3d2f23]' : 'bg-white border-gray-200'
    }`}>
      {/* Newsletter Section */}
      <div className={`border-b ${isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'}`}>
        <Newsletter />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">

        {/* Main Footer Content */}
        <div className="py-16 md:py-20 lg:py-24 space-y-16 md:space-y-20">

          {/* Logo + Description (Centered) */}
          <div className="text-center space-y-6">
            <h4 className={`text-4xl md:text-5xl lg:text-6xl tracking-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="font-bold">DavidSon´s</span>{' '}
              <span className="font-normal">Design</span>
            </h4>
            <p className={`text-base md:text-lg leading-relaxed max-w-3xl mx-auto ${
              isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
            }`}>
              {companyDescription}
            </p>
          </div>

          {/* 4 Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-12">

            {/* Column 1: About Us */}
            <div className="text-center md:text-left">
              <h5 className={`text-sm tracking-widest uppercase mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {aboutTitle}
              </h5>
              <nav className="flex flex-col items-center md:items-start gap-3.5">
                {aboutLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-base transition-colors ${
                      isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Column 2: Tools */}
            <div className="text-center md:text-left">
              <h5 className={`text-sm tracking-widest uppercase mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {toolsTitle}
              </h5>
              <nav className="flex flex-col items-center md:items-start gap-3.5">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className={`flex items-center gap-2 text-base transition-colors ${
                        isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tool.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Column 3: Contact */}
            <div className="text-center md:text-left">
              <h5 className={`text-sm tracking-widest uppercase mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {contactTitle}
              </h5>
              <div className="flex flex-col items-center md:items-start gap-3.5">
                <p className={`text-base ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  Hermosillo, Sonora.
                </p>
                <a
                  href="tel:+526621234567"
                  className={`text-base transition-colors ${
                    isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  +52 662 123 4567
                </a>
                <a
                  href="mailto:contacto@davidsonsdesign.com"
                  className={`text-base transition-colors ${
                    isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  contacto@davidsonsdesign.com
                </a>
              </div>
            </div>

            {/* Column 4: Social Networks */}
            <div className="text-center md:text-left">
              <h5 className={`text-sm tracking-widest uppercase mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {followUsTitle}
              </h5>
              <div className="flex items-center justify-center md:justify-start gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isDarkMode
                          ? 'bg-[#2d2419] text-[#b8a99a] hover:bg-[#8b6f47] hover:text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-[#8b6f47] hover:text-white'
                      }`}
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`py-8 border-t ${
          isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <p className={`text-sm ${
              isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
            }`}>
              {copyright}
            </p>

            {/* Legal Links */}
            <nav className="flex items-center gap-6">
              {legalLinks.map((link, index) => (
                <div key={link.href} className="flex items-center gap-6">
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className={`${isDarkMode ? 'text-[#3d2f23]' : 'text-gray-300'}`}>
                      |
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
