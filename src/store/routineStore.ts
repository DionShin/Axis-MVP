import { create } from 'zustand';
import { Routine, RoutineCheck } from '../types';

interface RoutineState {
  routines: Routine[];
  todayChecks: RoutineCheck[];
  setRoutines: (routines: Routine[]) => void;
  setTodayChecks: (checks: RoutineCheck[]) => void;
  toggleCheck: (routineId: string) => void;
}

export const useRoutineStore = create<RoutineState>((set) => ({
  routines: [],
  todayChecks: [],
  setRoutines: (routines) => set({ routines }),
  setTodayChecks: (todayChecks) => set({ todayChecks }),
  toggleCheck: (routineId) =>
    set((state) => {
      const today = new Date().toISOString().split('T')[0];
      const existing = state.todayChecks.find((c) => c.routine_id === routineId);
      if (existing) {
        return {
          todayChecks: state.todayChecks.map((c) =>
            c.routine_id === routineId ? { ...c, checked: !c.checked } : c
          ),
        };
      }
      const newCheck: RoutineCheck = {
        id: `${routineId}-${today}`,
        user_id: '',
        routine_id: routineId,
        date: today,
        checked: true,
        checked_at: new Date().toISOString(),
      };
      return { todayChecks: [...state.todayChecks, newCheck] };
    }),
}));
