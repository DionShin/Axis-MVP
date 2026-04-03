import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useThemeStore } from '../../src/store/themeStore';
import { useRoutineStore } from '../../src/store/routineStore';
import { getLastNWeeks, getMonthDays, formatMonthLabel, today } from '../../src/lib/date';
import { heatmapLevel, completionRate, bestStreak } from '../../src/utils/history';

type ViewMode = 'weekly' | 'monthly';

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

  const [mode, setMode] = useState<ViewMode>('weekly');
  const { routines, checks } = useRoutineStore();

  const todayStr = today();
  const now = new Date();
  const activeRoutines = routines.filter((r) => r.status === 'active');

  const weeks = getLastNWeeks(8);
  const monthDays = getMonthDays(now.getFullYear(), now.getMonth());
  const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const paddedMonth = [...Array(firstDayOfWeek).fill(null), ...monthDays];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <View style={styles.toggle}>
          {(['weekly', 'monthly'] as ViewMode[]).map((m) => (
            <Pressable
              key={m}
              style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            {mode === 'weekly' ? 'Last 8 weeks' : formatMonthLabel(now.getFullYear(), now.getMonth())}
          </Text>

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
            <Text style={styles.legendLabel}>Less</Text>
            {(useThemeStore.getState().darkMode ? HEATMAP_DARK : HEATMAP_LIGHT).map((color, i) => (
              <View key={i} style={[styles.legendCell, { backgroundColor: color }]} />
            ))}
            <Text style={styles.legendLabel}>More</Text>
          </View>
        </View>

        {activeRoutines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Routine summary</Text>
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
                    <Text style={styles.summaryMeta}>Best streak: {streak} day{streak !== 1 ? 's' : ''}</Text>
                  </View>
                  <View style={styles.summaryRight}>
                    <Text style={styles.summaryRate}>{Math.round(rate * 100)}%</Text>
                    <Text style={styles.summaryRateLabel}>completion</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {activeRoutines.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No routines tracked yet.</Text>
            <Text style={styles.emptyBody}>Start checking routines to see your history here.</Text>
          </View>
        )}
      </ScrollView>
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
    toggle: {
      flexDirection: 'row', backgroundColor: c.surface,
      borderRadius: radius.sm, borderWidth: 1, borderColor: c.border, overflow: 'hidden',
    },
    toggleBtn: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
    toggleBtnActive: { backgroundColor: c.primary },
    toggleText: { ...typography.caption, color: c.textSecondary },
    toggleTextActive: { color: c.background, fontWeight: '600' },
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
    card: {
      backgroundColor: c.surface, borderRadius: radius.lg,
      borderWidth: 1, borderColor: c.border, padding: spacing.md, marginBottom: spacing.lg,
    },
    cardLabel: { ...typography.caption, color: c.textSecondary, marginBottom: spacing.md },
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
