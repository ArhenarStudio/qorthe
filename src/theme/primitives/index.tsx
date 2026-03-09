"use client";
// ═══════════════════════════════════════════════════════════════
// src/theme/primitives/index.tsx
// Componentes primitivos del admin — todos leen de useTheme()
// Importar SIEMPRE desde aquí, nunca hardcodear colores en módulos
// ═══════════════════════════════════════════════════════════════
import React from "react";
import { useTheme } from "../ThemeContext";

// ── CARD ──────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}
export const Card: React.FC<CardProps> = ({
  children, className = "", style, padding = "none", hoverable = false,
}) => {
  const { t } = useTheme();
  const padMap = { none: "", sm: "p-3", md: "p-4", lg: "p-6" };
  return (
    <div
      className={`overflow-hidden transition-shadow duration-200 ${padMap[padding]} ${
        hoverable ? "hover:shadow-md cursor-pointer" : ""
      } ${className}`}
      style={{
        backgroundColor: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: t.radiusCard,
        boxShadow: t.shadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ── BADGE ─────────────────────────────────────────────────────
type BadgeVariant = "success" | "error" | "warning" | "info" | "accent" | "neutral" | "muted";
interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}
export const Badge: React.FC<BadgeProps> = ({
  text, variant = "neutral", className = "", dot = false,
}) => {
  const { t } = useTheme();
  const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
    success: { backgroundColor: t.successSubtle, color: t.success },
    error: { backgroundColor: t.errorSubtle, color: t.error },
    warning: { backgroundColor: t.warningSubtle, color: t.warning },
    info: { backgroundColor: t.infoSubtle, color: t.info },
    accent: { backgroundColor: t.accentSubtle, color: t.accent },
    neutral: { backgroundColor: t.surface2, color: t.textSecondary, border: `1px solid ${t.border}` },
    muted: { backgroundColor: "transparent", color: t.textMuted },
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 ${className}`}
      style={{ borderRadius: t.radiusBadge, fontFamily: t.fontBody, ...variantStyles[variant] }}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "currentColor" }} />
      )}
      {text}
    </span>
  );
};

// ── BUTTON ────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "xs" | "sm" | "md" | "lg";
interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}
export const Button: React.FC<ButtonProps> = ({
  children, variant = "primary", size = "md", onClick, disabled,
  loading = false, className = "", type = "button", style,
}) => {
  const { t } = useTheme();
  const sizeMap: Record<ButtonSize, string> = {
    xs: "px-2 py-1 text-[10px]",
    sm: "px-2.5 py-1.5 text-[11px]",
    md: "px-3.5 py-2 text-xs",
    lg: "px-5 py-2.5 text-sm",
  };
  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: { backgroundColor: t.accent, color: t.accentText, border: "none" },
    secondary: { backgroundColor: t.surface2, color: t.text, border: `1px solid ${t.border}` },
    ghost: { backgroundColor: "transparent", color: t.textSecondary, border: "none" },
    danger: { backgroundColor: t.errorSubtle, color: t.error, border: `1px solid ${t.error}30` },
    success: { backgroundColor: t.successSubtle, color: t.success, border: `1px solid ${t.success}30` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 font-semibold transition-all duration-150 ${sizeMap[size]} ${className}`}
      style={{
        borderRadius: t.radiusButton,
        fontFamily: t.fontBody,
        cursor: (disabled || loading) ? "not-allowed" : "pointer",
        opacity: (disabled || loading) ? 0.55 : 1,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {loading && (
        <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
};

// ── INPUT ────────────────────────────────────────────────────
interface InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  style?: React.CSSProperties;
}
export const Input: React.FC<InputProps> = ({
  value, onChange, placeholder, type = "text", disabled,
  className = "", prefix, suffix, style,
}) => {
  const { t } = useTheme();
  return (
    <div
      className="relative flex items-center"
      style={{
        backgroundColor: t.surface2,
        border: `1px solid ${t.border}`,
        borderRadius: t.radiusInput,
      }}
    >
      {prefix && (
        <span className="absolute left-2.5" style={{ color: t.textMuted }}>
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-transparent text-xs outline-none ${prefix ? "pl-8" : "pl-3"} ${
          suffix ? "pr-8" : "pr-3"
        } py-2 ${className}`}
        style={{
          color: t.text,
          fontFamily: t.fontBody,
          fontSize: t.fontSizeBase,
          opacity: disabled ? 0.5 : 1,
          ...style,
        }}
      />
      {suffix && (
        <span className="absolute right-2.5" style={{ color: t.textMuted }}>
          {suffix}
        </span>
      )}
    </div>
  );
};

// ── TABLE ────────────────────────────────────────────────────
interface TableProps {
  children: React.ReactNode;
  className?: string;
}
export const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  const { t } = useTheme();
  return (
    <div
      className={`overflow-x-auto w-full ${className}`}
      style={{ borderRadius: t.radiusCard, border: `1px solid ${t.border}` }}
    >
      <table className="w-full text-xs" style={{ color: t.text, borderCollapse: "collapse" }}>
        {children}
      </table>
    </div>
  );
};

export const Thead: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTheme();
  return (
    <thead style={{ backgroundColor: t.surface2, borderBottom: `1px solid ${t.border}` }}>
      {children}
    </thead>
  );
};

export const Th: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children, className = "",
}) => {
  const { t } = useTheme();
  return (
    <th
      className={`px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider ${className}`}
      style={{ color: t.textMuted, fontFamily: t.fontBody }}
    >
      {children}
    </th>
  );
};

export const Tr: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = "" }) => {
  const { t } = useTheme();
  return (
    <tr
      onClick={onClick}
      className={`transition-colors duration-100 ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{
        borderBottom: `1px solid ${t.border}`,
      }}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.backgroundColor = t.surface2;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "";
      }}
    >
      {children}
    </tr>
  );
};

export const Td: React.FC<{
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
}> = ({ children, className = "", colSpan }) => {
  const { t } = useTheme();
  return (
    <td
      className={`px-3 py-3 ${className}`}
      colSpan={colSpan}
      style={{ color: t.text, fontFamily: t.fontBody }}
    >
      {children}
    </td>
  );
};

// ── STAT CARD ────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}
export const StatCard: React.FC<StatCardProps> = ({
  label, value, change, changeType = "neutral", icon, className = "",
}) => {
  const { t } = useTheme();
  const changeColor =
    changeType === "positive" ? t.success :
    changeType === "negative" ? t.error : t.textMuted;
  return (
    <div
      className={`p-4 ${className}`}
      style={{
        backgroundColor: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: t.radiusCard,
        boxShadow: t.shadow,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: t.textMuted, fontFamily: t.fontBody }}
        >
          {label}
        </span>
        {icon && (
          <span style={{ color: t.accent, opacity: 0.7 }}>{icon}</span>
        )}
      </div>
      <p
        className="text-2xl font-bold leading-none"
        style={{ color: t.text, fontFamily: t.fontHeading, fontWeight: t.fontWeightHeading }}
      >
        {value}
      </p>
      {change && (
        <span
          className="text-[10px] mt-1.5 inline-block font-medium"
          style={{ color: changeColor }}
        >
          {change}
        </span>
      )}
    </div>
  );
};

// ── PAGE HEADER ───────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}
export const PageHeader: React.FC<PageHeaderProps> = ({
  title, subtitle, icon, actions, className = "",
}) => {
  const { t } = useTheme();
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2.5">
        {icon && (
          <span style={{ color: t.accent }}>{icon}</span>
        )}
        <div>
          <h1
            className="text-lg leading-tight"
            style={{
              color: t.text,
              fontFamily: t.fontHeading,
              fontWeight: t.fontWeightHeading,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: t.textMuted, fontFamily: t.fontBody }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

// ── DIVIDER ───────────────────────────────────────────────────
export const Divider: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { t } = useTheme();
  return (
    <div
      className={`w-full h-px ${className}`}
      style={{ backgroundColor: t.border }}
    />
  );
};

// ── EMPTY STATE ───────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, action }) => {
  const { t } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      {icon && <span style={{ color: t.textMuted }}>{icon}</span>}
      <p className="text-sm font-medium" style={{ color: t.text, fontFamily: t.fontHeading }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-xs max-w-xs" style={{ color: t.textMuted, fontFamily: t.fontBody }}>
          {subtitle}
        </p>
      )}
      {action}
    </div>
  );
};
