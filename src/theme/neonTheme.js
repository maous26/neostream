// src/theme/neonTheme.js

export const neonTheme = {
  colors: {
    // Background
    bgDark: '#000000',
    bgPurple: '#1a0a2e',
    bgCyan: '#0a1929',
    
    // Neon colors
    cyan: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e',
    red: '#ef4444',
    
    // Text
    textWhite: '#ffffff',
    textGray: '#9ca3af',
    textCyan: '#06b6d4',
    textPurple: '#a78bfa',
    
    // Transparent overlays
    purpleOverlay: 'rgba(139, 92, 246, 0.1)',
    cyanOverlay: 'rgba(6, 182, 212, 0.1)',
    pinkOverlay: 'rgba(236, 72, 153, 0.1)',
  },
  
  shadows: {
    cyan: {
      shadowColor: '#06b6d4',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 20,
      elevation: 10,
    },
    purple: {
      shadowColor: '#8b5cf6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 20,
      elevation: 10,
    },
    pink: {
      shadowColor: '#ec4899',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 15,
      elevation: 8,
    },
  },
};