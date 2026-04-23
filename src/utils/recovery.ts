import { Routine, RoutineCheck } from '../types';

/** Check completion rate for each routine (0..1) */
function getCheckRates(routines: Routine[], checks: RoutineCheck[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of routines) {
    const all = checks.filter((c) => c.routine_id === r.id);
    const done = all.filter((c) => c.checked).length;
    map.set(r.id, all.length > 0 ? done / all.length : 0);
  }
  return map;
}

/**
 * Recommend 1–2 routines for reduced mode.
 * Priority: highest completion rate → oldest (most established).
 */
export function recommendReducedRoutines(
  routines: Routine[],
  checks: RoutineCheck[]
): Routine[] {
  const active = routines.filter((r) => r.status === 'active');
  if (active.length === 0) return [];

  const rates = getCheckRates(active, checks);
  const sorted = [...active].sort((a, b) => {
    const rDiff = (rates.get(b.id) ?? 0) - (rates.get(a.id) ?? 0);
    if (rDiff !== 0) return rDiff;
    // fallback: older routine first
    return a.created_at.localeCompare(b.created_at);
  });

  return sorted.slice(0, Math.min(2, sorted.length));
}

/**
 * Candidates to add back during rebuild phase.
 * Active routines not in reducedIds, sorted by past success.
 */
export function getRebuildCandidates(
  routines: Routine[],
  checks: RoutineCheck[],
  reducedIds: string[]
): Routine[] {
  const candidates = routines.filter(
    (r) => r.status === 'active' && !reducedIds.includes(r.id)
  );
  if (candidates.length === 0) return [];

  const rates = getCheckRates(candidates, checks);
  return [...candidates]
    .sort((a, b) => (rates.get(b.id) ?? 0) - (rates.get(a.id) ?? 0))
    .slice(0, 4);
}
