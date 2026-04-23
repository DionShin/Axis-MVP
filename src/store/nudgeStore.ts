import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NudgeStore {
  enabled: boolean;
  intervalHours: number;   // 1 | 2 | 3
  activeStart: string;     // "HH:00" e.g. "09:00"
  activeEnd: string;       // "HH:00" e.g. "22:00"
  selectedIds: string[];   // preset nudge ids
  customNudges: string[];  // user-written texts
  setEnabled: (v: boolean) => void;
  setIntervalHours: (h: number) => void;
  setActiveStart: (t: string) => void;
  setActiveEnd: (t: string) => void;
  toggleNudge: (id: string) => void;
  addCustomNudge: (text: string) => void;
  removeCustomNudge: (text: string) => void;
}

export const useNudgeStore = create<NudgeStore>()(
  persist(
    (set, get) => ({
      enabled: false,
      intervalHours: 2,
      activeStart: '09:00',
      activeEnd: '22:00',
      selectedIds: [],
      customNudges: [],

      setEnabled: (v) => set({ enabled: v }),
      setIntervalHours: (h) => set({ intervalHours: h }),
      setActiveStart: (t) => set({ activeStart: t }),
      setActiveEnd: (t) => set({ activeEnd: t }),

      toggleNudge: (id) => {
        const { selectedIds } = get();
        set({
          selectedIds: selectedIds.includes(id)
            ? selectedIds.filter((s) => s !== id)
            : [...selectedIds, id],
        });
      },

      addCustomNudge: (text) =>
        set((s) => ({ customNudges: [...s.customNudges, text] })),

      removeCustomNudge: (text) =>
        set((s) => ({ customNudges: s.customNudges.filter((n) => n !== text) })),
    }),
    {
      name: 'nudge-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
