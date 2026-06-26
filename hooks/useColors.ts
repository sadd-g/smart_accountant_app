import { useApp } from '../context/AppContext';

export function useColors() {
  const { isDark } = useApp();
  return isDark ? {
    text: '#f1f5f9', accent: '#D4AF37', background: '#0A1128',
    card: '#16213E', border: '#2a3550', mutedForeground: '#94a3b8',
  } : {
    text: '#1a1a2e', accent: '#D4AF37', background: '#f8f9fb',
    card: '#ffffff', border: '#e5e7eb', mutedForeground: '#6b7280',
  };
}
