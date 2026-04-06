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
export function categoryLabel(cat: string): string {
  if (BASE_CATEGORY_LABELS[cat]) return BASE_CATEGORY_LABELS[cat];
  // custom: snake_case → Title Case
  return cat
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
