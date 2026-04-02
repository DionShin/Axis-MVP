import { RoutineCheck, Routine } from '../types';

// completion rate for a routine over a set of dates
export function completionRate(
  routineId: string,
  dates: string[],
  checks: RoutineCheck[]
): number {
  if (dates.length === 0) return 0;
  const checked = checks.filter(
    (c) => c.routine_id === routineId && dates.includes(c.date) && c.checked
  ).length;
  return checked / dates.length;
}

// total checked days for a routine
export function totalCheckedDays(routineId: string, checks: RoutineCheck[]): number {
  return checks.filter((c) => c.routine_id === routineId && c.checked).length;
}

// how many routines were checked on a given date
export function checkedCountOnDate(date: string, checks: RoutineCheck[]): number {
  return checks.filter((c) => c.date === date && c.checked).length;
}

// best streak for a routine
export function bestStreak(routineId: string, checks: RoutineCheck[]): number {
  const sortedDates = checks
    .filter((c) => c.routine_id === routineId && c.checked)
    .map((c) => c.date)
    .sort();

  if (sortedDates.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      if (current > best) best = current;
    } else {
      current = 1;
    }
  }
  return best;
}

// intensity level for heatmap (0–4)
export function heatmapLevel(
  date: string,
  activeRoutineCount: number,
  checks: RoutineCheck[]
): 0 | 1 | 2 | 3 | 4 {
  if (activeRoutineCount === 0) return 0;
  const count = checkedCountOnDate(date, checks);
  const ratio = count / activeRoutineCount;
  if (ratio === 0) return 0;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

// best and worst routine by completion rate over given dates
export function getBestAndWorstRoutines(
  routines: Routine[],
  dates: string[],
  checks: RoutineCheck[]
): { best: Routine | null; worst: Routine | null } {
  const active = routines.filter((r) => r.status === 'active');
  if (active.length === 0) return { best: null, worst: null };

  const rated = active.map((r) => ({
    routine: r,
    rate: completionRate(r.id, dates, checks),
  }));

  rated.sort((a, b) => b.rate - a.rate);
  return {
    best: rated[0].routine,
    worst: rated[rated.length - 1].routine,
  };
}
