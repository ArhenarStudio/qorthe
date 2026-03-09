"use client";
import { useAdminTheme } from '@/contexts/AdminThemeContext';

export function useThemeComponents() {
  const { components } = useAdminTheme();
  return components;
}
