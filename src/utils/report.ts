import { Routine, RoutineCheck } from '../types';
import { completionRate } from './history';
import { getWeekRange, getMonthRange, dateRange, toDateString } from '../lib/date';

interface ReportLabels {
  weekly: string;
  monthly: string;
  insight_no_routines: string;
  insight_pattern_weekday: string;
  insight_pattern_too_many: (count: number) => string;
  insight_pattern_restarted: (count: number) => string;
  insight_pattern_consistent: (name: string, period: string) => string;
  insight_next_reduce: (name: string) => string;
  insight_next_add_more: (count: number) => string;
  insight_next_add_complementary: (name: string) => string;
}

export interface RoutineInsight {
  bestRoutine: Routine | null;
  worstRoutine: Routine | null;
  bestRate: number;
  worstRate: number;
  patterns: string[];
  nextAction: string | null;
}

function weekdayDates(dates: string[]): string[] {
  return dates.filter((d) => {
    const day = new Date(d + 'T00:00:00').getDay();
    return day >= 1 && day <= 5;
  });
}

function weekendDates(dates: string[]): string[] {
  return dates.filter((d) => {
    const day = new Date(d + 'T00:00:00').getDay();
    return day === 0 || day === 6;
  });
}

export function generateInsight(
  routines: Routine[],
  checks: RoutineCheck[],
  period: 'weekly' | 'monthly',
  labels: ReportLabels
): RoutineInsight {
  const now = new Date();
  const range =
    period === 'weekly' ? getWeekRange(now) : getMonthRange(now);
  const dates = dateRange(range.start, range.end);
  const today = toDateString(now);
  const activeDates = dates.filter((d) => d <= today);

  const active = routines.filter((r) => r.status === 'active');

  if (active.length === 0) {
    return {
      bestRoutine: null,
      worstRoutine: null,
      bestRate: 0,
      worstRate: 0,
      patterns: [],
      nextAction: labels.insight_no_routines,
    };
  }

  // Rate each routine
  const rated = active.map((r) => ({
    routine: r,
    rate: completionRate(r.id, activeDates, checks),
    weekdayRate: completionRate(r.id, weekdayDates(activeDates), checks),
    weekendRate: completionRate(r.id, weekendDates(activeDates), checks),
  }));

  rated.sort((a, b) => b.rate - a.rate);

  const best = rated[0];
  const worst = rated[rated.length - 1];

  const patterns: string[] = [];

  // Pattern: weekday vs weekend
  const weekdayWeekendDiff = rated.filter(
    (r) => r.weekdayRate - r.weekendRate > 0.3
  );
  if (weekdayWeekendDiff.length > 0) {
    patterns.push(labels.insight_pattern_weekday);
  }

  // Pattern: too many active routines
  if (active.length > 4) {
    patterns.push(labels.insight_pattern_too_many(active.length));
  }

  // Pattern: restarted routines
  const restarted = routines.filter((r) => r.restarted_at !== null);
  if (restarted.length > 0) {
    patterns.push(labels.insight_pattern_restarted(restarted.length));
  }

  // Pattern: best routine consistent
  if (best.rate >= 0.8) {
    patterns.push(labels.insight_pattern_consistent(best.routine.name, period === 'weekly' ? labels.weekly : labels.monthly));
  }

  // Next action
  let nextAction: string | null = null;
  if (worst.rate < 0.3 && worst.routine.id !== best.routine.id) {
    nextAction = labels.insight_next_reduce(worst.routine.name);
  } else if (active.length < 2) {
    nextAction = labels.insight_next_add_more(active.length);
  } else if (best.rate >= 0.9) {
    nextAction = labels.insight_next_add_complementary(best.routine.name);
  }

  return {
    bestRoutine: best.routine,
    worstRoutine: worst.routine.id !== best.routine.id ? worst.routine : null,
    bestRate: best.rate,
    worstRate: worst.rate,
    patterns,
    nextAction,
  };
}

export function daysSinceLastCheck(checks: RoutineCheck[]): number {
  if (checks.length === 0) return 0;
  const sorted = [...checks]
    .filter((c) => c.checked)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) return 0;
  const last = new Date(sorted[0].date + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}
