import { create } from 'zustand';
import { Routine, RoutineCheck } from '../types';
import {
  fetchRoutines,
  insertRoutine,
  patchRoutine,
  fetchTodayChecks,
  fetchChecksForRange,
  upsertCheck,
} from '../lib/supabase/db';

interface RoutineState {
  routines: Routine[];
  // today's checks — used by home screen for fast check/uncheck
  todayChecks: RoutineCheck[];
  // historical checks (90 days) — used by history & report screens
  checks: RoutineCheck[];
  setRoutines: (routines: Routine[]) => void;
  setTodayChecks: (checks: RoutineCheck[]) => void;
  setChecks: (checks: RoutineCheck[]) => void;
  loadRoutines: (userId: string) => Promise<void>;
  loadTodayChecks: (userId: string, today: string) => Promise<void>;
  loadChecks: (userId: string, startDate: string, endDate: string) => Promise<void>;
  addRoutine: (userId: string, name: string, category: string) => Promise<void>;
  updateRoutine: (id: string, patch: Partial<Routine>) => Promise<void>;
  archiveRoutine: (id: string) => Promise<void>;
  restartRoutine: (id: string) => Promise<void>;
  toggleCheck: (userId: string, routineId: string, today: string) => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routines: [],
  todayChecks: [],
  checks: [],

  setRoutines: (routines) => set({ routines }),
  setTodayChecks: (todayChecks) => set({ todayChecks }),
  setChecks: (checks) => set({ checks }),

  loadRoutines: async (userId) => {
    const routines = await fetchRoutines(userId);
    set({ routines });
  },

  loadTodayChecks: async (userId, today) => {
    const todayChecks = await fetchTodayChecks(userId, today);
    set({ todayChecks });
  },

  loadChecks: async (userId, startDate, endDate) => {
    const checks = await fetchChecksForRange(userId, startDate, endDate);
    // merge today's checks so they're always current
    const today = new Date().toISOString().split('T')[0];
    const todayChecks = get().todayChecks;
    const merged = [
      ...checks.filter((c) => c.date !== today),
      ...todayChecks,
    ];
    set({ checks: merged });
  },

  addRoutine: async (userId, name, category) => {
    const tempId = `temp-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const temp: Routine = {
      id: tempId,
      user_id: userId,
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
    set((state) => ({ routines: [...state.routines, temp] }));

    const created = await insertRoutine(userId, name, category);
    if (created) {
      set((state) => ({
        routines: state.routines.map((r) => (r.id === tempId ? created : r)),
      }));
    }
  },

  updateRoutine: async (id, patch) => {
    set((state) => ({
      routines: state.routines.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
    await patchRoutine(id, patch);
  },

  archiveRoutine: async (id) => {
    const archived_at = new Date().toISOString();
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === id ? { ...r, status: 'archived', archived_at } : r
      ),
    }));
    await patchRoutine(id, { status: 'archived', archived_at });
  },

  restartRoutine: async (id) => {
    const restarted_at = new Date().toISOString();
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === id
          ? { ...r, status: 'active', archived_at: null, restarted_at }
          : r
      ),
    }));
    await patchRoutine(id, { status: 'active', archived_at: null, restarted_at });
  },

  toggleCheck: async (userId, routineId, today) => {
    const existing = get().todayChecks.find((c) => c.routine_id === routineId);
    const newChecked = existing ? !existing.checked : true;

    // optimistic update — todayChecks
    if (existing) {
      set((s) => ({
        todayChecks: s.todayChecks.map((c) =>
          c.routine_id === routineId ? { ...c, checked: newChecked } : c
        ),
      }));
    } else {
      const optimistic: RoutineCheck = {
        id: `${routineId}-${today}`,
        user_id: userId,
        routine_id: routineId,
        date: today,
        checked: true,
        checked_at: new Date().toISOString(),
      };
      set((s) => ({ todayChecks: [...s.todayChecks, optimistic] }));
    }

    const saved = await upsertCheck(userId, routineId, today, newChecked);
    if (saved) {
      // update todayChecks
      set((s) => ({
        todayChecks: s.todayChecks.map((c) =>
          c.routine_id === routineId && c.date === today ? saved : c
        ),
      }));
      // also keep checks in sync
      set((s) => {
        const alreadyInChecks = s.checks.some(
          (c) => c.routine_id === routineId && c.date === today
        );
        if (alreadyInChecks) {
          return {
            checks: s.checks.map((c) =>
              c.routine_id === routineId && c.date === today ? saved : c
            ),
          };
        }
        return { checks: [...s.checks, saved] };
      });
    }
  },
}));
