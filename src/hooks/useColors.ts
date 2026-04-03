import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors, AppColors } from '../theme';

export function useColors(): AppColors {
  const { darkMode } = useThemeStore();
  return darkMode ? darkColors : lightColors;
}
