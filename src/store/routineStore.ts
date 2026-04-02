import { create } from 'zustand';
import { Routine, RoutineCheck } from '../types';

interface RoutineState {
  routines: Routine[];
  todayChecks: RoutineCheck[];
  setRoutines: (routines: Routine[]) => void;
  setTodayChecks: (checks: RoutineCheck[]) => void;
  addRoutine: (name: string, category: string) => void;
  updateRoutine: (id: string, patch: Partial<Routine>) => void;
  archiveRoutine: (id: string) => void;
  restartRoutine: (id: string) => void;
  toggleCheck: (routineId: string) => void;
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export const useRoutineStore = create<RoutineState>((set) => ({
  routines: [],
  todayChecks: [],

  setRoutines: (routines) => set({ routines }),
  setTodayChecks: (todayChecks) => set({ todayChecks }),

  addRoutine: (name, category) =>
    set((state) => {
      const now = new Date().toISOString();
      const routine: Routine = {
        id: makeId(),
        user_id: '',
        name,
        category,
        frequency_type: 'daily',
        frequency_value: 1,
        preferred_time: null,
        status: 'active',
        created_at: now,
        archived_at: null,
        restarted_at: null,
      };
      return { routines: [...state.routines, routine] };
    }),

  updateRoutine: (id, patch) =>
    set((state) => ({
      routines: state.routines.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),

  archiveRoutine: (id) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === id
          ? { ...r, status: 'archived', archived_at: new Date().toISOString() }
          : r
      ),
    })),

  restartRoutine: (id) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'active',
              archived_at: null,
              restarted_at: new Date().toISOString(),
            }
          : r
      ),
    })),

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
