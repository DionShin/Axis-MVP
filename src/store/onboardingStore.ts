import { create } from 'zustand';
import { GoalCategory, MainDifficulty } from '../types';

interface OnboardingState {
  completed: boolean;
  goalCategory: GoalCategory | null;
  mainDifficulty: MainDifficulty | null;
  reminderTimes: string[]; // "HH:MM" 24h strings; empty = disabled
  selectedRoutineNames: string[];
  setGoalCategory: (category: GoalCategory) => void;
  setMainDifficulty: (difficulty: MainDifficulty) => void;
  setReminderTimes: (times: string[]) => void;
  addReminderTime: (time: string) => void;
  removeReminderTime: (time: string) => void;
  toggleRoutine: (name: string) => void;
  setCompleted: (completed: boolean) => void;
  reset: () => void;
}

const initialState = {
  completed: false,
  goalCategory: null,
  mainDifficulty: null,
  reminderTimes: [] as string[],
  selectedRoutineNames: [] as string[],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setGoalCategory: (goalCategory) => set({ goalCategory }),
  setMainDifficulty: (mainDifficulty) => set({ mainDifficulty }),
  setReminderTimes: (reminderTimes) => set({ reminderTimes }),
  addReminderTime: (time) =>
    set((state) => {
      if (state.reminderTimes.includes(time)) return state;
      return { reminderTimes: [...state.reminderTimes, time].sort() };
    }),
  removeReminderTime: (time) =>
    set((state) => ({ reminderTimes: state.reminderTimes.filter((t) => t !== time) })),
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
