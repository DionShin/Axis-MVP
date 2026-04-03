export const lightColors = {
  background: '#ffffff',
  surface: '#f7f7f7',
  border: '#e5e5e5',
  text: '#1a1a1a',
  textSecondary: '#666666',
  primary: '#1a1a1a',
  accent: '#4a4a4a',
  success: '#2d6a4f',
  muted: '#cccccc',
};

export const darkColors = {
  background: '#0f0f0f',
  surface: '#1a1a1a',
  border: '#2a2a2a',
  text: '#f0f0f0',
  textSecondary: '#999999',
  primary: '#f0f0f0',
  accent: '#aaaaaa',
  success: '#52b788',
  muted: '#555555',
};

// backward compat — screens import this; migrated screens use useColors()
export const colors = lightColors;

export type AppColors = typeof lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '600' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 11, fontWeight: '400' as const },
};
