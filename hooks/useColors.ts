import { useApp } from '../context/AppContext';

export function useColors() {
  const { isDark } = useApp();
  return isDark ? {
    text: '#f1f5f9', foreground: '#f1f5f9', accent: '#D4AF37', background: '#0A1128',
    card: '#16213E', border: '#2a3550', mutedForeground: '#94a3b8',
    destructive: '#EF4444', success: '#10B981', warning: '#F59E0B', info: '#3B82F6',
  } : {
    text: '#1a1a2e', foreground: '#1a1a2e', accent: '#D4AF37', background: '#f8f9fb',
    card: '#ffffff', border: '#e5e7eb', mutedForeground: '#6b7280',
    destructive: '#EF4444', success: '#10B981', warning: '#F59E0B', info: '#3B82F6',
  };
}
