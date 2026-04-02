import { create } from 'zustand';
import { GoalCategory, MainDifficulty } from '../types';

interface OnboardingState {
  completed: boolean;
  goalCategory: GoalCategory | null;
  mainDifficulty: MainDifficulty | null;
  reminderTime: string;
  selectedRoutineNames: string[];
  setGoalCategory: (category: GoalCategory) => void;
  setMainDifficulty: (difficulty: MainDifficulty) => void;
  setReminderTime: (time: string) => void;
  toggleRoutine: (name: string) => void;
  setCompleted: (completed: boolean) => void;
  reset: () => void;
}

const initialState = {
  completed: false,
  goalCategory: null,
  mainDifficulty: null,
  reminderTime: '21:00',
  selectedRoutineNames: [] as string[],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setGoalCategory: (goalCategory) => set({ goalCategory }),
  setMainDifficulty: (mainDifficulty) => set({ mainDifficulty }),
  setReminderTime: (reminderTime) => set({ reminderTime }),
  toggleRoutine: (name) =>
    set((state) => {
      const exists = state.selectedRoutineNames.includes(name);
      if (exists) {
        return { selectedRoutineNames: state.selectedRoutineNames.filter((n) => n !== name) };
      }
      if (state.selectedRoutineNames.length >= 3) return state;
      return { selectedRoutineNames: [...state.selectedRoutineNames, name] };
    }),
  setCompleted: (completed) => set({ completed }),
  reset: () => set(initialState),
}));
