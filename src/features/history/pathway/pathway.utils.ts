import { Routine, RoutineCheck } from '../../../types';
import { PathwayEvent } from './pathway.types';
import { strings, Language } from '../../../i18n/strings';

interface PathwayLabels {
  event_started: (name: string) => string;
  event_stopped: (name: string) => string;
  event_restarted: (name: string) => string;
  event_milestone: (name: string, days: number) => string;
  event_gap: (days: number) => string;
  event_gap_since: (date: string) => string;
  event_recovery: string;
  event_recovery_sub: (days: number) => string;
  date_locale: string;
}

const MILESTONE_DAYS = [7, 14, 30];
const INACTIVITY_THRESHOLD = 3;

function datesBetween(a: string, b: string): number {
  const diff = new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(locale, { month: 'long', day: 'numeric' });
}

/** routine_added / routine_stopped / routine_restarted */
function getRoutineLifecycleEvents(routines: Routine[], pw: PathwayLabels): PathwayEvent[] {
  const events: PathwayEvent[] = [];

  for (const r of routines) {
    const addedDate = r.created_at.split('T')[0];
    events.push({
      id: `added-${r.id}`,
      type: 'routine_added',
      date: addedDate,
      title: pw.event_started(r.name),
      subtitle: formatDate(addedDate, pw.date_locale),
      routineName: r.name,
    });

    if (r.archived_at) {
      const stoppedDate = r.archived_at.split('T')[0];
      events.push({
        id: `stopped-${r.id}`,
        type: 'routine_stopped',
        date: stoppedDate,
        title: pw.event_stopped(r.name),
        subtitle: formatDate(stoppedDate, pw.date_locale),
        routineName: r.name,
      });
    }

    if (r.restarted_at) {
      const restartedDate = r.restarted_at.split('T')[0];
      events.push({
        id: `restarted-${r.id}`,
        type: 'routine_restarted',
        date: restartedDate,
        title: pw.event_restarted(r.name),
        subtitle: formatDate(restartedDate, pw.date_locale),
        routineName: r.name,
      });
    }
  }

  return events;
}

/** continuity_milestone: first time a routine hits 7/14/30 day streak */
function getMilestoneEvents(routines: Routine[], checks: RoutineCheck[], pw: PathwayLabels): PathwayEvent[] {
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
            title: pw.event_milestone(r.name, m),
            subtitle: formatDate(checkedDates[i], pw.date_locale),
            routineName: r.name,
          });
        }
      }
    }
  }

  return events;
}

/** inactivity_gap + recovery_started: gaps >= 3 days in overall check history */
function getGapEvents(checks: RoutineCheck[], pw: PathwayLabels): PathwayEvent[] {
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
        title: pw.event_gap(gap),
        subtitle: pw.event_gap_since(formatDate(uniqueDates[i - 1], pw.date_locale)),
      });
      events.push({
        id: `recovery-${uniqueDates[i]}`,
        type: 'recovery_started',
        date: uniqueDates[i],
        title: pw.event_recovery,
        subtitle: pw.event_recovery_sub(gap),
      });
    }
  }

  return events;
}

/** Generate all pathway events, sorted newest → oldest */
export function generatePathwayEvents(
  routines: Routine[],
  checks: RoutineCheck[],
  language: Language = 'ko'
): PathwayEvent[] {
  const pw = strings[language].pathway;
  const all = [
    ...getRoutineLifecycleEvents(routines, pw),
    ...getMilestoneEvents(routines, checks, pw),
    ...getGapEvents(checks, pw),
  ];

  const seen = new Set<string>();
  return all
    .filter((e) => { if (seen.has(e.id)) return false; seen.add(e.id); return true; })
    .sort((a, b) => b.date.localeCompare(a.date));
}
