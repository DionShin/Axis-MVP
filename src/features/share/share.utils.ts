import { Routine, RoutineCheck } from '../../types';
import { ShareData } from './share.types';
import { Language } from '../../i18n/strings';

function daysBetween(a: string, b: string): number {
  return Math.floor(
    (new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000
  );
}

function currentMonthPrefix(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function generateShareData(routines: Routine[], checks: RoutineCheck[], language: Language = 'ko'): ShareData {
  const monthPrefix = currentMonthPrefix();
  const locale = language === 'ko' ? 'ko-KR' : 'en-US';
  const currentMonthLabel = language === 'ko'
    ? `${new Date().getMonth() + 1}월`
    : new Date().toLocaleDateString('en-US', { month: 'long' });
  const daysElapsed = new Date().getDate();
  const activeRoutines = routines.filter((r) => r.status === 'active');

  // ─── Template 1: Monthly ────────────────────────────────────────────
  const monthChecks = checks.filter((c) => c.checked && c.date.startsWith(monthPrefix));
  const expectedChecks = activeRoutines.length * daysElapsed;
  const monthCompletionRate = expectedChecks > 0
    ? Math.min(monthChecks.length / expectedChecks, 1)
    : 0;

  // Top routine: most checks this month
  const countByRoutine: Record<string, number> = {};
  for (const c of monthChecks) {
    countByRoutine[c.routine_id] = (countByRoutine[c.routine_id] ?? 0) + 1;
  }
  const topRoutineId = Object.entries(countByRoutine).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topRoutineName = topRoutineId
    ? (routines.find((r) => r.id === topRoutineId)?.name ?? null)
    : null;

  const routinesWithCheckThisMonth = new Set(monthChecks.map((c) => c.routine_id));
  const continuedRoutineCount = activeRoutines.filter((r) =>
    routinesWithCheckThisMonth.has(r.id)
  ).length;

  const restartCount = routines.filter((r) => r.restarted_at?.startsWith(monthPrefix)).length;

  // ─── Template 2: Recovery Comeback ──────────────────────────────────
  const allCheckedDates = [
    ...new Set(checks.filter((c) => c.checked).map((c) => c.date)),
  ].sort();

  let hasComeback = false;
  let inactivityGapDays = 0;
  let comebackDateLabel = '';

  // Find most recent comeback (gap ≥ 3 days, then resumed)
  for (let i = allCheckedDates.length - 1; i > 0; i--) {
    const gap = daysBetween(allCheckedDates[i - 1], allCheckedDates[i]);
    if (gap >= 3) {
      hasComeback = true;
      inactivityGapDays = gap;
      const d = new Date(allCheckedDates[i] + 'T00:00:00');
      comebackDateLabel = d.toLocaleDateString(locale, { month: 'long', day: 'numeric' });
      break;
    }
  }

  // ─── Template 3: Milestone ───────────────────────────────────────────
  let milestoneRoutineName: string | null = null;
  let milestoneDays = 0;
  let longestStreak = 0;

  for (const r of routines) {
    const dates = checks
      .filter((c) => c.routine_id === r.id && c.checked)
      .map((c) => c.date)
      .sort();

    if (dates.length === 0) continue;

    let streak = 1;
    let maxStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      streak = daysBetween(dates[i - 1], dates[i]) === 1 ? streak + 1 : 1;
      if (streak > maxStreak) maxStreak = streak;
    }

    if (maxStreak > longestStreak) longestStreak = maxStreak;

    for (const m of [30, 14, 7]) {
      if (maxStreak >= m && m > milestoneDays) {
        milestoneDays = m;
        milestoneRoutineName = r.name;
      }
    }
  }

  // Fallback: use top routine + longest streak if no formal milestone
  if (!milestoneRoutineName && topRoutineName) {
    milestoneRoutineName = topRoutineName;
    milestoneDays = longestStreak;
  }

  return {
    currentMonthLabel,
    monthCompletionRate,
    topRoutineName,
    continuedRoutineCount,
    activeRoutineCount: activeRoutines.length,
    restartCount,
    hasComeback,
    inactivityGapDays,
    comebackDateLabel,
    milestoneRoutineName,
    milestoneDays,
    longestStreak,
  };
}

// ─── Text representation for native Share sheet ──────────────────────────────
export function buildShareText(template: 'monthly' | 'recovery' | 'milestone', data: ShareData, language: Language = 'ko'): string {
  if (language === 'en') {
    if (template === 'monthly') {
      const rate = Math.round(data.monthCompletionRate * 100);
      const top = data.topRoutineName ? `\nMost consistent: ${data.topRoutineName}` : '';
      return `${data.currentMonthLabel} — how it went\n\nCompletion: ${rate}%${top}\nKept going: ${data.continuedRoutineCount}\n\n— Axis`;
    }
    if (template === 'recovery') {
      return `Getting back into flow\n\nAfter a ${data.inactivityGapDays}-day gap\nBack since ${data.comebackDateLabel}\n\n— Axis`;
    }
    const name = data.milestoneRoutineName ?? 'My routine';
    return `My milestone\n\n${name}\n${data.milestoneDays} days in a row\n\n— Axis`;
  }

  // Korean
  if (template === 'monthly') {
    const rate = Math.round(data.monthCompletionRate * 100);
    const top = data.topRoutineName ? `\n가장 꾸준한 루틴: ${data.topRoutineName}` : '';
    return `${data.currentMonthLabel}, 이렇게 이어왔어요\n\n완료율: ${rate}%${top}\n이어간 루틴: ${data.continuedRoutineCount}개\n\n— Axis`;
  }
  if (template === 'recovery') {
    return `다시 흐름을 만들고 있어요\n\n${data.inactivityGapDays}일의 공백 이후\n${data.comebackDateLabel}부터 다시 시작했어요\n\n— Axis`;
  }
  const name = data.milestoneRoutineName ?? '루틴';
  return `내 루틴의 마일스톤\n\n${name}\n${data.milestoneDays}일 연속으로 이어왔어요\n\n— Axis`;
}
