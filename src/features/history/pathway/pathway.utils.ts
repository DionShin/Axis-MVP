import { Routine, RoutineCheck } from '../../../types';
import { PathwayEvent } from './pathway.types';

const MILESTONE_DAYS = [7, 14, 30];
const INACTIVITY_THRESHOLD = 3;

function datesBetween(a: string, b: string): number {
  const diff = new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

/** routine_added / routine_stopped / routine_restarted */
function getRoutineLifecycleEvents(routines: Routine[]): PathwayEvent[] {
  const events: PathwayEvent[] = [];

  for (const r of routines) {
    // Added
    const addedDate = r.created_at.split('T')[0];
    events.push({
      id: `added-${r.id}`,
      type: 'routine_added',
      date: addedDate,
      title: `'${r.name}' 루틴 시작`,
      subtitle: formatDate(addedDate),
      routineName: r.name,
    });

    // Stopped
    if (r.archived_at) {
      const stoppedDate = r.archived_at.split('T')[0];
      events.push({
        id: `stopped-${r.id}`,
        type: 'routine_stopped',
        date: stoppedDate,
        title: `'${r.name}' 루틴 중단`,
        subtitle: formatDate(stoppedDate),
        routineName: r.name,
      });
    }

    // Restarted
    if (r.restarted_at) {
      const restartedDate = r.restarted_at.split('T')[0];
      events.push({
        id: `restarted-${r.id}`,
        type: 'routine_restarted',
        date: restartedDate,
        title: `'${r.name}' 다시 시작`,
        subtitle: formatDate(restartedDate),
        routineName: r.name,
      });
    }
  }

  return events;
}

/** continuity_milestone: first time a routine hits 7/14/30 day streak */
function getMilestoneEvents(routines: Routine[], checks: RoutineCheck[]): PathwayEvent[] {
  const events: PathwayEvent[] = [];

  for (const r of routines) {
    const checkedDates = checks
      .filter((c) => c.routine_id === r.id && c.checked)
      .map((c) => c.date)
      .sort();

    if (checkedDates.length === 0) continue;

    const achieved = new Set<number>();
    let streak = 1;

    for (let i = 1; i < checkedDates.length; i++) {
      const gap = datesBetween(checkedDates[i - 1], checkedDates[i]);
      streak = gap === 1 ? streak + 1 : 1;

      for (const m of MILESTONE_DAYS) {
        if (streak === m && !achieved.has(m)) {
          achieved.add(m);
          events.push({
            id: `milestone-${r.id}-${m}`,
            type: 'continuity_milestone',
            date: checkedDates[i],
            title: `'${r.name}' ${m}일 연속 달성`,
            subtitle: formatDate(checkedDates[i]),
            routineName: r.name,
          });
        }
      }
    }
  }

  return events;
}

/** inactivity_gap + recovery_started: gaps >= 3 days in overall check history */
function getGapEvents(checks: RoutineCheck[]): PathwayEvent[] {
  const events: PathwayEvent[] = [];

  const uniqueDates = [
    ...new Set(checks.filter((c) => c.checked).map((c) => c.date)),
  ].sort();

  if (uniqueDates.length < 2) return events;

  for (let i = 1; i < uniqueDates.length; i++) {
    const gap = datesBetween(uniqueDates[i - 1], uniqueDates[i]);
    if (gap >= INACTIVITY_THRESHOLD) {
      events.push({
        id: `gap-${uniqueDates[i - 1]}`,
        type: 'inactivity_gap',
        date: uniqueDates[i - 1],
        title: `${gap}일 공백`,
        subtitle: `${formatDate(uniqueDates[i - 1])} 이후`,
      });
      events.push({
        id: `recovery-${uniqueDates[i]}`,
        type: 'recovery_started',
        date: uniqueDates[i],
        title: '다시 흐름 시작',
        subtitle: `${gap}일 이후 재개`,
      });
    }
  }

  return events;
}

/** Generate all pathway events, sorted newest → oldest */
export function generatePathwayEvents(
  routines: Routine[],
  checks: RoutineCheck[]
): PathwayEvent[] {
  const all = [
    ...getRoutineLifecycleEvents(routines),
    ...getMilestoneEvents(routines, checks),
    ...getGapEvents(checks),
  ];

  // Deduplicate by id, sort descending by date
  const seen = new Set<string>();
  return all
    .filter((e) => { if (seen.has(e.id)) return false; seen.add(e.id); return true; })
    .sort((a, b) => b.date.localeCompare(a.date));
}
