"use client";
// ═══════════════════════════════════════════════════════════════
// NintendoWindow.tsx — Ventana modal estilo Nintendo/cartucho
// Barra de título roja, borde pixel doble, botones NES
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from 'react';

const C = {
  bg: '#0D0D1A', surface: '#1A1A2E', surf2: '#16213E',
  border: '#2D2D5E', border2: '#4A4A8A',
  mario: '#E52521', marioH: '#FF3B38',
  coin: '#FFD700',
  text: '#F8F8F8', text2: '#A0A0C0', text3: '#4A4A7A',
};

interface Props {
  title: string;
  accentColor: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function NintendoWindow({ title, accentColor, onClose, children }: Props) {
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // ESC to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Drag
  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y };
  };
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      setPos({
        x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
        y: dragStart.current.oy + (e.clientY - dragStart.current.my),
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(13,13,26,0.75)',
          backdropFilter: 'blur(6px)',
          transition: 'opacity 0.2s',
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Window */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', zIndex: 101,
          left: `calc(50% + ${pos.x}px)`, top: `calc(50% + ${pos.y}px)`,
          transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.88})`,
          width: 'min(900px, calc(100vw - 48px))',
          height: 'min(640px, calc(100vh - 80px))',
          background: C.surface,
          // Pixel double border: inner accent, outer black shadow
          border: `3px solid ${accentColor}`,
          outline: `3px solid #000`,
          outlineOffset: '3px',
          borderRadius: '4px',
          display: 'flex', flexDirection: 'column',
          boxShadow: `8px 8px 0px #000, 0 0 40px ${accentColor}30`,
          transition: visible
            ? 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s'
            : 'none',
          opacity: visible ? 1 : 0,
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        {/* Title bar */}
        <div
          onMouseDown={onMouseDown}
          style={{
            height: '36px', flexShrink: 0,
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}CC)`,
            borderBottom: `3px solid #000`,
            display: 'flex', alignItems: 'center',
            padding: '0 10px', gap: '10px', cursor: dragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        >
          {/* Traffic lights pixel-style */}
          <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
            {/* Close */}
            <button onClick={onClose} style={{
              width: 14, height: 14, borderRadius: '2px',
              background: '#FF3B30', border: '2px solid #8B0000',
              cursor: 'pointer', boxShadow: '1px 1px 0 #000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '8px', color: '#8B0000', fontWeight: 'bold',
              padding: 0, lineHeight: 1,
            }}>×</button>
            {/* Min */}
            <div style={{ width: 14, height: 14, borderRadius: '2px',
              background: '#FFBD2E', border: '2px solid #8B6500', boxShadow: '1px 1px 0 #000' }} />
            {/* Max */}
            <div style={{ width: 14, height: 14, borderRadius: '2px',
              background: '#28C840', border: '2px solid #006500', boxShadow: '1px 1px 0 #000' }} />
          </div>

          {/* Title */}
          <span style={{ flex: 1, fontSize: '9px', color: '#fff',
            textShadow: '1px 1px 0 #000', letterSpacing: '0.08em',
            textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </span>

          {/* Coin badge */}
          <div style={{ fontSize: '8px', color: '#000', background: C.coin,
            padding: '2px 8px', borderRadius: '2px', border: `2px solid #B8860B`,
            boxShadow: '2px 2px 0 #000', whiteSpace: 'nowrap', flexShrink: 0 }}>
            MÓDULO
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', background: C.bg,
          borderTop: `2px solid ${accentColor}30` }}>
          {children}
        </div>

        {/* Bottom pixel bar */}
        <div style={{ height: '6px', flexShrink: 0,
          background: `repeating-linear-gradient(90deg, ${accentColor} 0px, ${accentColor} 4px, transparent 4px, transparent 8px)`,
          opacity: 0.4 }} />
      </div>
    </>
  );
}
