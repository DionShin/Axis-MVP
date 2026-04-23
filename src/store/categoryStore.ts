import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_CATEGORIES = [
  'exercise',
  'study',
  'productivity',
  'life_habits',
  'self_improvement',
] as const;

export const BASE_CATEGORY_LABELS: Record<string, string> = {
  exercise: 'Exercise',
  study: 'Study',
  productivity: 'Productivity',
  life_habits: 'Life habits',
  self_improvement: 'Self-improvement',
};

export const BASE_CATEGORY_LABELS_KO: Record<string, string> = {
  exercise: '운동',
  study: '공부',
  productivity: '생산성',
  life_habits: '생활 습관',
  self_improvement: '자기계발',
};

interface CategoryState {
  customCategories: string[]; // raw user-entered strings
  addCustomCategory: (name: string) => void;
  removeCustomCategory: (name: string) => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set) => ({
      customCategories: [],
      addCustomCategory: (name) =>
        set((state) => {
          const trimmed = name.trim().toLowerCase().replace(/\s+/g, '_');
          if (!trimmed || state.customCategories.includes(trimmed)) return state;
          return { customCategories: [...state.customCategories, trimmed] };
        }),
      removeCustomCategory: (name) =>
        set((state) => ({
          customCategories: state.customCategories.filter((c) => c !== name),
        })),
    }),
    {
      name: 'axis-categories',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/** Display label for any category (base or custom) */
export function categoryLabel(cat: string, lang: 'en' | 'ko' = 'en'): string {
  if (lang === 'ko') {
    if (BASE_CATEGORY_LABELS_KO[cat]) return BASE_CATEGORY_LABELS_KO[cat];
    return cat.split('_').join(' ');
  }
  if (BASE_CATEGORY_LABELS[cat]) return BASE_CATEGORY_LABELS[cat];
  return cat
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
