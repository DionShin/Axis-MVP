import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useThemeStore } from '../../src/store/themeStore';
import { useStrings } from '../../src/hooks/useStrings';
import { useLanguageStore } from '../../src/store/languageStore';
import { useRoutineStore } from '../../src/store/routineStore';
import { getLastNWeeks, getMonthDays, formatMonthLabel, today } from '../../src/lib/date';
import { heatmapLevel, completionRate, bestStreak } from '../../src/utils/history';
import { generatePathwayEvents } from '../../src/features/history/pathway/pathway.utils';
import { PathwayTimeline } from '../../src/features/history/pathway/PathwayTimeline';

type HistoryTab = 'calendar' | 'pathway';
type ViewMode   = 'weekly' | 'monthly';

const HEATMAP_LIGHT = ['#eeeeee', '#d4d4d4', '#a3a3a3', '#6b6b6b', '#1a1a1a'];
const HEATMAP_DARK  = ['#2a2a2a', '#3d3d3d', '#6b6b6b', '#9a9a9a', '#f0f0f0'];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function HeatmapCell({ level, isToday }: { level: 0 | 1 | 2 | 3 | 4; isToday: boolean }) {
  const c = useColors();
  const { darkMode } = useThemeStore();
  const heatColors = darkMode ? HEATMAP_DARK : HEATMAP_LIGHT;
  return (
    <View
      style={[
        heatCellStyle,
        { backgroundColor: heatColors[level] },
        isToday && { borderWidth: 2, borderColor: c.primary },
      ]}
    />
  );
}

const heatCellStyle = { width: 32, height: 32, borderRadius: 6, margin: 2 };

export default function HistoryScreen() {
  const c = useColors();
  const styles = makeStyles(c);

  const s = useStrings().history;
  const { language } = useLanguageStore();
  const [tab, setTab] = useState<HistoryTab>('calendar');
  const [mode, setMode] = useState<ViewMode>('weekly');
  const { routines, checks } = useRoutineStore();

  const todayStr = today();
  const now = new Date();
  const activeRoutines = routines.filter((r) => r.status === 'active');

  const weeks = getLastNWeeks(8);
  const monthDays = getMonthDays(now.getFullYear(), now.getMonth());
  const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const paddedMonth = [...Array(firstDayOfWeek).fill(null), ...monthDays];

  const pathwayEvents = tab === 'pathway'
    ? generatePathwayEvents(routines, checks, language)
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{s.title}</Text>
        <View style={styles.tabToggle}>
          {(['calendar', 'pathway'] as HistoryTab[]).map((t) => (
            <Pressable
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'calendar' ? s.tab_calendar : s.tab_pathway}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── Calendar tab ──────────────────────────────────────── */}
      {tab === 'calendar' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <View style={styles.viewModeRow}>
              <Text style={styles.cardLabel}>
                {mode === 'weekly' ? s.last_weeks(8) : formatMonthLabel(now.getFullYear(), now.getMonth())}
              </Text>
              <View style={styles.modeToggle}>
                {(['weekly', 'monthly'] as ViewMode[]).map((m) => (
                  <Pressable
                    key={m}
                    style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
                    onPress={() => setMode(m)}
                  >
                    <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
                      {m === 'weekly' ? s.weekly : s.monthly}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {mode === 'weekly' ? (
              <View>
                <View style={styles.dayLabelsRow}>
                  {DAY_LABELS.map((d) => (
                    <Text key={d} style={styles.dayLabelText}>{d}</Text>
                  ))}
                </View>
                {weeks.map((week) => (
                  <View key={week.weekStart} style={styles.weekRow}>
                    {week.days.map((date) => (
                      <HeatmapCell
                        key={date}
                        level={heatmapLevel(date, activeRoutines.length, checks)}
                        isToday={date === todayStr}
                      />
                    ))}
                  </View>
                ))}
              </View>
            ) : (
              <View>
                <View style={styles.dayLabelsRow}>
                  {DAY_LABELS.map((d) => (
                    <Text key={d} style={styles.dayLabelText}>{d}</Text>
                  ))}
                </View>
                <View style={styles.monthGrid}>
                  {paddedMonth.map((date, i) =>
                    date === null ? (
                      <View key={`pad-${i}`} style={heatCellStyle} />
                    ) : (
                      <HeatmapCell
                        key={date}
                        level={heatmapLevel(date, activeRoutines.length, checks)}
                        isToday={date === todayStr}
                      />
                    )
                  )}
                </View>
              </View>
            )}

            <View style={styles.legendRow}>
              <Text style={styles.legendLabel}>{s.less}</Text>
              {(useThemeStore.getState().darkMode ? HEATMAP_DARK : HEATMAP_LIGHT).map((color, i) => (
                <View key={i} style={[styles.legendCell, { backgroundColor: color }]} />
              ))}
              <Text style={styles.legendLabel}>{s.more}</Text>
            </View>
          </View>

          {activeRoutines.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{s.routine_summary_title}</Text>
              {activeRoutines.map((routine) => {
                const rate = completionRate(
                  routine.id,
                  mode === 'weekly' ? weeks.flatMap((w) => w.days) : monthDays,
                  checks
                );
                const streak = bestStreak(routine.id, checks);
                return (
                  <Pressable
                    key={routine.id}
                    style={styles.summaryCard}
                    onPress={() => router.push(`/routine/${routine.id}`)}
                  >
                    <View style={styles.summaryLeft}>
                      <Text style={styles.summaryName}>{routine.name}</Text>
                      <Text style={styles.summaryMeta}>{s.best_streak}: {streak}{s.days_suffix}</Text>
                    </View>
                    <View style={styles.summaryRight}>
                      <Text style={styles.summaryRate}>{Math.round(rate * 100)}%</Text>
                      <Text style={styles.summaryRateLabel}>{s.completion_rate}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {activeRoutines.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyBody}>{s.no_data}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Pathway tab ───────────────────────────────────────── */}
      {tab === 'pathway' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <PathwayTimeline events={pathwayEvents} c={c} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md,
    },
    title: { ...typography.h2, color: c.text },

    // Top-level Calendar / Pathway tabs
    tabToggle: {
      flexDirection: 'row', backgroundColor: c.surface,
      borderRadius: radius.sm, borderWidth: 1, borderColor: c.border, overflow: 'hidden',
    },
    tabBtn: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
    tabBtnActive: { backgroundColor: c.primary },
    tabText: { ...typography.caption, color: c.textSecondary },
    tabTextActive: { color: c.background, fontWeight: '600' },

    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

    // Calendar card
    card: {
      backgroundColor: c.surface, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border, padding: spacing.md, marginBottom: spacing.lg,
    },
    viewModeRow: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: spacing.md,
    },
    cardLabel: { ...typography.caption, color: c.textSecondary },
    modeToggle: {
      flexDirection: 'row', backgroundColor: c.background,
      borderRadius: radius.sm, borderWidth: 1, borderColor: c.border, overflow: 'hidden',
    },
    modeBtn: { paddingVertical: 3, paddingHorizontal: spacing.sm },
    modeBtnActive: { backgroundColor: c.primary },
    modeText: { ...typography.small, color: c.textSecondary },
    modeTextActive: { color: c.background, fontWeight: '600' },

    dayLabelsRow: { flexDirection: 'row', marginBottom: spacing.xs, paddingHorizontal: 2 },
    dayLabelText: { width: 36, textAlign: 'center', ...typography.small, color: c.textSecondary },
    weekRow: { flexDirection: 'row' },
    monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
    legendLabel: { ...typography.small, color: c.textSecondary },
    legendCell: { width: 12, height: 12, borderRadius: 3 },

    section: { marginBottom: spacing.xl },
    sectionLabel: {
      ...typography.caption, color: c.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.md,
    },
    summaryCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, padding: spacing.md, marginBottom: spacing.sm,
    },
    summaryLeft: { flex: 1 },
    summaryName: { ...typography.body, color: c.text, fontWeight: '500' },
    summaryMeta: { ...typography.caption, color: c.textSecondary, marginTop: 2 },
    summaryRight: { alignItems: 'flex-end' },
    summaryRate: { ...typography.h3, color: c.text },
    summaryRateLabel: { ...typography.small, color: c.textSecondary },

    emptyState: { alignItems: 'center', paddingTop: spacing.xxl },
    emptyTitle: { ...typography.h3, color: c.text, marginBottom: spacing.xs },
    emptyBody: { ...typography.body, color: c.textSecondary, textAlign: 'center' },
  });
}
