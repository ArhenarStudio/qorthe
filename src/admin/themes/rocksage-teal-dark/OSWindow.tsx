"use client";
// ═══════════════════════════════════════════════════════════════
// OSWindow.tsx — Ventana modal tipo macOS para Komerzly OS
// Chrome: botones rojo/amarillo/verde + título + drawer lateral
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from 'react';
import { Settings, X } from 'lucide-react';

interface OSWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: string;
  maxHeight?: string;
  actions?: React.ReactNode;
  drawerContent?: React.ReactNode;
  children: React.ReactNode;
}

export function OSWindow({
  isOpen,
  onClose,
  title,
  subtitle,
  width = '880px',
  maxHeight = '84vh',
  actions,
  drawerContent,
  children,
}: OSWindowProps) {
  const [visible, setVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDrawerOpen(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.78)',
    backdropFilter: 'blur(14px) saturate(150%)',
    zIndex: 400,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.22s ease',
  };

  const winStyle: React.CSSProperties = {
    background: '#0F1114',
    borderRadius: '20px',
    border: '1px solid #243038',
    width, maxWidth: '93vw', maxHeight,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(45,212,191,0.06), 0 0 60px rgba(13,148,136,0.05)',
    transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
    opacity: visible ? 1 : 0,
    transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease',
  };

  return (
    <div
      ref={overlayRef}
      style={overlayStyle}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div style={winStyle}>
        {/* Chrome */}
        <div style={{
          height: '52px', padding: '0 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(8,9,11,0.7)',
          borderBottom: '1px solid #1A2228',
          flexShrink: 0, position: 'relative',
        }}>
          {/* Línea inferior decorativa */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg,transparent,rgba(45,212,191,0.18),transparent)',
          }} />

          {/* Left: traffic lights + título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {/* Traffic lights */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                onClick={onClose}
                style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: '#FF5F57', border: '1px solid rgba(0,0,0,0.2)',
                  cursor: 'pointer', transition: 'filter 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.3)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
              />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FEBC2E', border: '1px solid rgba(0,0,0,0.2)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28C840', border: '1px solid rgba(0,0,0,0.2)' }} />
            </div>
            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '14px' }}>
              <span style={{
                fontFamily: "'Sora', sans-serif", fontSize: '13.5px', fontWeight: 700,
                color: '#E8ECF0', letterSpacing: '-0.2px', lineHeight: 1.2,
              }}>{title}</span>
              {subtitle && (
                <span style={{ fontSize: '11px', color: '#6B7A85', fontWeight: 400 }}>{subtitle}</span>
              )}
            </div>
          </div>

          {/* Right: acciones */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {actions}
            {drawerContent && (
              <button
                onClick={() => setDrawerOpen(o => !o)}
                style={{
                  height: '28px', padding: '0 12px', borderRadius: '7px',
                  fontSize: '11px', fontWeight: 600,
                  cursor: 'pointer',
                  border: drawerOpen ? '1px solid #0D9488' : '1px solid #243038',
                  background: drawerOpen ? '#0C2420' : 'transparent',
                  color: drawerOpen ? '#2DD4BF' : '#6B7A85',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  transition: 'all 0.15s',
                }}
              >
                <Settings size={11} />
                Configuración
              </button>
            )}
          </div>
        </div>

        {/* Body + Drawer */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {/* Contenido scrollable */}
          <div style={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
            padding: '22px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#1A2228 transparent',
          }}>
            {children}
          </div>

          {/* Drawer lateral */}
          {drawerContent && (
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: '268px',
              background: 'rgba(6,8,10,0.97)',
              borderLeft: '1px solid #1A2228',
              padding: '20px', overflowY: 'auto',
              transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
              zIndex: 10, backdropFilter: 'blur(8px)',
            }}>
              {drawerContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
