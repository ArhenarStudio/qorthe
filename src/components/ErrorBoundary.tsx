"use client";

import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  /** Custom fallback UI — if omitted, renders default error card */
  fallback?: React.ReactNode;
  /** Context label shown in error card (e.g. "checkout", "admin") */
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production this would go to a monitoring service (Sentry, etc.)
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[ErrorBoundary:${this.props.context ?? 'unknown'}]`, error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    const ctx = this.props.context ?? 'la aplicación';

    return (
      <div className="min-h-[200px] flex items-center justify-center p-8">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Algo salió mal</h2>
            <p className="text-xs text-gray-500 mt-1">
              Ocurrió un error inesperado en {ctx}. Por favor intenta de nuevo.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <RotateCcw size={12} /> Intentar de nuevo
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              <Home size={12} /> Inicio
            </a>
          </div>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="text-left mt-4">
              <summary className="text-[10px] text-gray-400 cursor-pointer">Detalle del error (dev)</summary>
              <pre className="text-[9px] text-red-400 bg-red-50 p-2 rounded mt-1 overflow-auto max-h-32 whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

// ── Admin-themed variant ─────────────────────────────────────
export const AdminErrorBoundary: React.FC<{ children: React.ReactNode; context?: string }> = ({ children, context }) => (
  <ErrorBoundary
    context={context}
    fallback={
      <div className="min-h-[200px] flex items-center justify-center p-8">
        <div className="max-w-sm w-full text-center space-y-3" style={{ color: 'var(--admin-text)' }}>
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={18} style={{ color: '#EF4444' }} />
            </div>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Error en {context ?? 'este módulo'}</p>
          <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>Recarga la página o contacta soporte si el error persiste.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{ background: 'var(--admin-surface2)', color: 'var(--admin-text-secondary)', border: '1px solid var(--admin-border)' }}
          >
            <RotateCcw size={12} /> Recargar
          </button>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);
