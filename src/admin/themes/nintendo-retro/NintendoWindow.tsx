"use client";
// ═══════════════════════════════════════════════════════════════
// NintendoWindow.tsx — Ventana modal estilo Nintendo
// Chrome rojo con borde pixel doble, botones retro
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from 'react';

const C = {
  bg: '#0D0D1A', surface: '#1A1A2E', surf2: '#16213E',
  border: '#2D2D5E', border2: '#4A4A8A',
  mario: '#E52521', marioH: '#FF3B38', marioL: '#FF6B6B', marioT: '#3D0A09',
  coin: '#FFD700', sky: '#4FC3F7',
  text: '#F8F8F8', text2: '#A0A0C0', text3: '#4A4A7A',
};

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  accentColor?: string;
}

export function NintendoWindow({ title, onClose, children, accentColor }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void accentColor; // reserved for future per-app accent color
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Drag
  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  };
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      setPos({
        x: dragStart.current.px + (e.clientX - dragStart.current.mx),
        y: dragStart.current.py + (e.clientY - dragStart.current.my),
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.15s',
      }}
    >
      <div
        style={{
          position: 'relative',
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${visible ? 1 : 0.92})`,
          transition: dragging ? 'none' : 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1)',
          width: 'min(960px, 92vw)',
          height: 'min(680px, 88vh)',
          display: 'flex', flexDirection: 'column',
          background: C.surface,
          // Pixel border doble — estilo NES
          border: `2px solid ${C.mario}`,
          outline: `2px solid #000`,
          outlineOffset: '2px',
          borderRadius: '4px',
          boxShadow: `
            6px 6px 0px #000,
            8px 8px 0px rgba(229,37,33,0.3),
            0 0 40px rgba(229,37,33,0.15),
            inset 0 0 0 1px rgba(255,107,107,0.1)
          `,
        }}
      >
        {/* ── Title bar ────────────────────────────────────── */}
        <div
          onMouseDown={onMouseDown}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '0 12px',
            height: '38px', flexShrink: 0,
            background: `linear-gradient(90deg, ${C.mario} 0%, #8B0000 100%)`,
            borderBottom: `2px solid #8B0000`,
            cursor: dragging ? 'grabbing' : 'grab',
            borderRadius: '2px 2px 0 0',
            userSelect: 'none',
          }}
        >
          {/* Traffic lights — NES style */}
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            {/* Close — rojo oscuro */}
            <button onClick={onClose} style={{
              width: '12px', height: '12px', borderRadius: '2px',
              background: '#8B0000', border: '2px solid #5B0000',
              cursor: 'pointer', boxShadow: '1px 1px 0px #000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: '4px', height: '4px', background: '#E52521', borderRadius: '1px' }} />
            </button>
            {/* Minimize — amarillo */}
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#5A4400', border: '2px solid #3A2A00', boxShadow: '1px 1px 0px #000' }}>
              <div style={{ width: '4px', height: '4px', background: '#FFD700', borderRadius: '1px', margin: '2px' }} />
            </div>
            {/* Expand — verde */}
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#0A2E0C', border: '2px solid #051506', boxShadow: '1px 1px 0px #000' }}>
              <div style={{ width: '4px', height: '4px', background: '#4CAF50', borderRadius: '1px', margin: '2px' }} />
            </div>
          </div>

          {/* Title */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {/* Pixel star deco */}
            <span style={{ fontSize: '8px', color: C.coin, textShadow: `1px 1px 0px #000` }}>★</span>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: '#fff', letterSpacing: '0.08em', textShadow: '1px 1px 0px #000' }}>
              {title.toUpperCase()}
            </span>
            <span style={{ fontSize: '8px', color: C.coin, textShadow: `1px 1px 0px #000` }}>★</span>
          </div>

          {/* Right action — ESC hint */}
          <div style={{ fontSize: '7px', fontFamily: "'Press Start 2P', monospace", color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>
            ESC
          </div>
        </div>

        {/* ── Pixel border accent under title ──────────────── */}
        <div style={{ height: '3px', flexShrink: 0,
          background: `repeating-linear-gradient(90deg, ${C.coin} 0px, ${C.coin} 4px, transparent 4px, transparent 8px)`,
          opacity: 0.6,
        }} />

        {/* ── Content ──────────────────────────────────────── */}
        <div style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: '20px 24px',
          color: C.text,
          background: C.surface,
        }}>
          {children}
        </div>

        {/* ── Status bar ───────────────────────────────────── */}
        <div style={{
          height: '26px', flexShrink: 0, display: 'flex', alignItems: 'center',
          padding: '0 14px', gap: '12px',
          background: C.bg,
          borderTop: `2px solid ${C.border}`,
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '1px', background: '#4CAF50', boxShadow: '0 0 6px #4CAF5080', animation: 'pulse-nes 2s infinite' }} />
          <span style={{ fontSize: '7px', color: C.text3, letterSpacing: '0.05em' }}>SISTEMA ACTIVO</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '7px', color: C.text3, letterSpacing: '0.04em' }}>ROCKSAGE OS v1.0</span>
        </div>

        {/* Pixel corner decorations */}
        {[
          { top: '-2px', left: '-2px' },
          { top: '-2px', right: '-2px' },
          { bottom: '-2px', left: '-2px' },
          { bottom: '-2px', right: '-2px' },
        ].map((s, i) => (
          <div key={i} style={{
            position: 'absolute', width: '8px', height: '8px',
            background: C.coin, opacity: 0.7, zIndex: 1, ...s,
          }} />
        ))}
      </div>
    </div>
  );
}
