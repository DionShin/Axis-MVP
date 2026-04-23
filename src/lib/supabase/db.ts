import { supabase } from './index';
import { Routine, RoutineCheck, User } from '../../types';

// ─── Profile ────────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as User;
}

export async function upsertProfile(patch: Partial<User> & { id: string }): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user || session.user.id !== patch.id) return;
  await supabase.from('profiles').upsert(patch);
}

// ─── Routines ────────────────────────────────────────────────────────────────

export async function fetchRoutines(userId: string): Promise<Routine[]> {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) return [];
  return (data ?? []) as Routine[];
}

export async function insertRoutine(
  userId: string,
  name: string,
  category: string
): Promise<Routine | null> {
  const { data, error } = await supabase
    .from('routines')
    .insert({ user_id: userId, name, category })
    .select()
    .single();
  if (error) return null;
  return data as Routine;
}

export async function patchRoutine(id: string, patch: Partial<Routine>): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;
  await supabase.from('routines').update(patch).eq('id', id).eq('user_id', session.user.id);
}

// ─── Checks ─────────────────────────────────────────────────────────────────

export async function fetchChecksForRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<RoutineCheck[]> {
  const { data, error } = await supabase
    .from('routine_checks')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
  if (error) return [];
  return (data ?? []) as RoutineCheck[];
}

export async function fetchTodayChecks(userId: string, today: string): Promise<RoutineCheck[]> {
  return fetchChecksForRange(userId, today, today);
}

export async function upsertCheck(
  userId: string,
  routineId: string,
  date: string,
  checked: boolean
): Promise<RoutineCheck | null> {
  const { data, error } = await supabase
    .from('routine_checks')
    .upsert(
      { user_id: userId, routine_id: routineId, date, checked, checked_at: new Date().toISOString() },
      { onConflict: 'routine_id,date' }
    )
    .select()
    .single();
  if (error) return null;
  return data as RoutineCheck;
}
