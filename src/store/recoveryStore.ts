import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecoveryMode = 'normal' | 'reduced';

interface RecoveryStore {
  mode: RecoveryMode;
  reducedRoutineIds: string[];
  reducedStreakDays: number;
  lastReducedSuccessDate: string | null;

  enterReducedMode: (ids: string[]) => void;
  exitReducedMode: () => void;
  addToReduced: (id: string) => void;
  recordReducedSuccess: (date: string) => void;
}

export const useRecoveryStore = create<RecoveryStore>()(
  persist(
    (set, get) => ({
      mode: 'normal',
      reducedRoutineIds: [],
      reducedStreakDays: 0,
      lastReducedSuccessDate: null,

      enterReducedMode: (ids) =>
        set({ mode: 'reduced', reducedRoutineIds: ids, reducedStreakDays: 0, lastReducedSuccessDate: null }),

      exitReducedMode: () =>
        set({ mode: 'normal', reducedRoutineIds: [], reducedStreakDays: 0, lastReducedSuccessDate: null }),

      addToReduced: (id) =>
        set((s) => ({ reducedRoutineIds: [...s.reducedRoutineIds, id] })),

      recordReducedSuccess: (date) =>
        set((s) => {
          if (s.lastReducedSuccessDate === date) return s; // already recorded today
          const prev = s.lastReducedSuccessDate;
          const yesterday = new Date(date);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const streak = prev === yesterdayStr ? s.reducedStreakDays + 1 : 1;
          return { reducedStreakDays: streak, lastReducedSuccessDate: date };
        }),
    }),
    {
      name: 'recovery-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
