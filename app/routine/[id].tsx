import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useRoutineStore } from '../../src/store/routineStore';
import { useStrings } from '../../src/hooks/useStrings';
import { totalCheckedDays, bestStreak } from '../../src/utils/history';
import { Routine, RoutineCheck } from '../../src/types';

// ─── Timeline data ────────────────────────────────────────────────────────────

type CheckEntry = { type: 'day'; date: string };
type GapEntry   = { type: 'gap'; days: number };
type StartEntry = { type: 'start'; date: string; label: string };
type TimelineEntry = CheckEntry | GapEntry | StartEntry;

function buildCheckTimeline(
  routine: Routine,
  checks: RoutineCheck[],
  labels: { anchor_added: string; anchor_restarted: string }
): TimelineEntry[] {
  const checkedSet = new Set(
    checks.filter((c) => c.routine_id === routine.id && c.checked).map((c) => c.date)
  );

  // Use restarted_at if present — archived period doesn't count
  const startIso = routine.restarted_at ?? routine.created_at;
  const startLabel = routine.restarted_at ? labels.anchor_restarted : labels.anchor_added;
  if (!startIso) return [];

  const startDate = new Date(startIso);
  startDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const entries: TimelineEntry[] = [];
  let gapCount = 0;

  for (let i = 0; i <= daysDiff; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    if (checkedSet.has(dateStr)) {
      if (gapCount > 0) {
        entries.push({ type: 'gap', days: gapCount });
        gapCount = 0;
      }
      entries.push({ type: 'day', date: dateStr });
    } else {
      gapCount++;
    }
  }
  // gapCount at end = days from last check to today (leading gap) — don't push
  // Also remove leading gap that was already pushed as first entry
  if (entries.length > 0 && entries[0].type === 'gap') {
    entries.shift();
  }

  // Anchor node at bottom
  entries.push({ type: 'start', date: startIso, label: startLabel });

  return entries;
}

function formatCheckDate(
  dateStr: string,
  labels: { today_label: string; yesterday_label: string; date_locale: string }
): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return labels.today_label;
  if (diff === 1) return labels.yesterday_label;
  return d.toLocaleDateString(labels.date_locale, { month: 'long', day: 'numeric' });
}

function formatDate(iso: string | null, locale: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Timeline component ───────────────────────────────────────────────────────

const DOT = 14;
const LINE_W = 2;

function CheckTimeline({
  entries, c, labels,
}: {
  entries: TimelineEntry[];
  c: AppColors;
  labels: { gap_suffix: string; done_label: string; today_label: string; yesterday_label: string; date_locale: string };
}) {
  return (
    <View>
      {entries.map((entry, i) => {
        const isLast = i === entries.length - 1;

        if (entry.type === 'start') {
          return (
            <View key="start" style={tlStyles.dayRow}>
              <View style={tlStyles.lineCol}>
                <View style={[tlStyles.dot, { backgroundColor: c.border, borderWidth: 1.5, borderColor: c.textSecondary }]} />
              </View>
              <View style={tlStyles.dayContent}>
                <Text style={[tlStyles.dateText, { color: c.textSecondary }]}>{entry.label}</Text>
                <Text style={[tlStyles.doneText, { color: c.muted }]}>{formatDate(entry.date, labels.date_locale)}</Text>
              </View>
            </View>
          );
        }

        if (entry.type === 'gap') {
          return (
            <View key={`gap-${i}`} style={tlStyles.gapRow}>
              <View style={tlStyles.gapLineCol}>
                <View style={[tlStyles.dashedLine, { borderColor: c.border }]} />
              </View>
              <Text style={[tlStyles.gapText, { color: c.muted }]}>
                {entry.days}{labels.gap_suffix}
              </Text>
            </View>
          );
        }

        return (
          <View key={entry.date} style={tlStyles.dayRow}>
            <View style={tlStyles.lineCol}>
              <View style={[tlStyles.dot, { backgroundColor: c.primary }]} />
              {!isLast && <View style={[tlStyles.line, { backgroundColor: c.border }]} />}
            </View>
            <View style={tlStyles.dayContent}>
              <Text style={[tlStyles.dateText, { color: c.text }]}>{formatCheckDate(entry.date, labels)}</Text>
              <Text style={[tlStyles.doneText, { color: c.primary }]}>{labels.done_label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const tlStyles = StyleSheet.create({
  dayRow: { flexDirection: 'row', alignItems: 'flex-start' },
  lineCol: { width: DOT + spacing.md, alignItems: 'center' },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, zIndex: 1 },
  line: { width: LINE_W, flex: 1, minHeight: spacing.xl },
  dayContent: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg, paddingLeft: spacing.sm,
  },
  dateText: { ...typography.body },
  doneText: { ...typography.caption, fontWeight: '600' },
  gapRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  gapLineCol: { width: DOT + spacing.md, alignItems: 'center' },
  dashedLine: {
    width: LINE_W, height: spacing.xl,
    borderLeftWidth: LINE_W, borderStyle: 'dashed',
  },
  gapText: { ...typography.caption, paddingLeft: spacing.sm, fontStyle: 'italic' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function RoutineDetail() {
  const c = useColors();
  const styles = makeStyles(c);
  const s = useStrings().routine;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines, archiveRoutine, restartRoutine, checks, todayChecks } = useRoutineStore();
  const routine = routines.find((r) => r.id === id);

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
        </View>
        <View style={styles.center}>
          <Text style={styles.notFound}>{s.not_found}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isArchived = routine.status === 'archived';
  // Merge todayChecks into historical checks to handle parallel-load race condition
  const today = new Date().toISOString().split('T')[0];
  const mergedChecks = [
    ...checks.filter((c) => c.date !== today),
    ...todayChecks,
  ];
  const totalDays  = totalCheckedDays(id, mergedChecks);
  const streak     = bestStreak(id, mergedChecks);
  const timeline   = buildCheckTimeline(routine, mergedChecks, s);

  const handleArchive = () => {
    Alert.alert(
      s.archive_confirm,
      s.archive_msg,
      [
        { text: s.cancel, style: 'cancel' },
        { text: s.archive_ok, style: 'destructive', onPress: () => { archiveRoutine(id); router.back(); } },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        {!isArchived && (
          <Pressable onPress={() => router.push(`/routine/edit/${id}`)}>
            <Text style={styles.editBtn}>{s.edit_btn}</Text>
          </Pressable>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Title + badge */}
        <View style={styles.titleRow}>
          <Text style={styles.name}>{routine.name}</Text>
          <View style={[styles.badge, isArchived && styles.badgeArchived]}>
            <Text style={[styles.badgeText, isArchived && styles.badgeTextArchived]}>
              {isArchived ? s.status_archived : s.status_active}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalDays}</Text>
            <Text style={styles.statLabel}>{s.stats_total}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>{s.stats_streak}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue} numberOfLines={1}>{routine.category.replace('_', ' ')}</Text>
            <Text style={styles.statLabel}>{s.stats_category}</Text>
          </View>
        </View>

        {/* Lifecycle row */}
        <View style={styles.lifecycleRow}>
          <View style={styles.lifecycleItem}>
            <Text style={styles.lifecycleLabel}>{s.lifecycle_started}</Text>
            <Text style={styles.lifecycleValue}>{formatDate(routine.created_at, s.date_locale)}</Text>
          </View>
          {routine.restarted_at && (
            <View style={styles.lifecycleItem}>
              <Text style={styles.lifecycleLabel}>{s.lifecycle_restarted}</Text>
              <Text style={styles.lifecycleValue}>{formatDate(routine.restarted_at, s.date_locale)}</Text>
            </View>
          )}
          {routine.archived_at && (
            <View style={styles.lifecycleItem}>
              <Text style={styles.lifecycleLabel}>{s.lifecycle_archived}</Text>
              <Text style={styles.lifecycleValue}>{formatDate(routine.archived_at, s.date_locale)}</Text>
            </View>
          )}
        </View>

        {/* Check history timeline */}
        <Text style={styles.sectionLabel}>{s.check_history}</Text>
        <CheckTimeline entries={timeline} c={c} labels={s} />
      </ScrollView>

      <View style={styles.footer}>
        {isArchived ? (
          <Pressable style={styles.restartBtn} onPress={() => { restartRoutine(id); router.back(); }}>
            <Text style={styles.restartBtnText}>{s.restart_btn}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.archiveBtn} onPress={handleArchive}>
            <Text style={styles.archiveBtnText}>{s.archive_btn}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md,
    },
    back: { ...typography.body, color: c.text, fontWeight: '500' },
    editBtn: { ...typography.body, color: c.primary, fontWeight: '600' },
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
    titleRow: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: spacing.lg, marginTop: spacing.sm,
    },
    name: { ...typography.h2, color: c.text, flex: 1, marginRight: spacing.md },
    badge: {
      backgroundColor: c.primary, paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm, borderRadius: radius.sm,
    },
    badgeArchived: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
    badgeText: { ...typography.small, color: c.background, fontWeight: '600' },
    badgeTextArchived: { color: c.textSecondary },
    statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    statCard: {
      flex: 1, backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, padding: spacing.md, alignItems: 'center',
    },
    statValue: {
      ...typography.h3, color: c.text, marginBottom: 2,
      textTransform: 'capitalize', textAlign: 'center',
    },
    statLabel: { ...typography.small, color: c.textSecondary, textAlign: 'center' },
    lifecycleRow: {
      flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg,
      backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, padding: spacing.md,
    },
    lifecycleItem: { flex: 1 },
    lifecycleLabel: { ...typography.small, color: c.textSecondary, marginBottom: 2 },
    lifecycleValue: { ...typography.caption, color: c.text, fontWeight: '500' },
    sectionLabel: {
      ...typography.caption, color: c.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginBottom: spacing.md,
    },
    footer: {
      paddingHorizontal: spacing.xl, paddingBottom: spacing.xl,
      paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: c.border,
    },
    archiveBtn: {
      paddingVertical: spacing.md, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, alignItems: 'center',
    },
    archiveBtnText: { ...typography.body, color: c.textSecondary },
    restartBtn: {
      paddingVertical: spacing.md, borderRadius: radius.md,
      backgroundColor: c.primary, alignItems: 'center',
    },
    restartBtnText: { ...typography.body, color: c.background, fontWeight: '600' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    notFound: { ...typography.body, color: c.textSecondary },
  });
}
