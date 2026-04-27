import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useRoutineStore } from '../../src/store/routineStore';
import { useAuthStore } from '../../src/store/authStore';
import { useRecoveryStore } from '../../src/store/recoveryStore';
import { daysSinceLastCheck } from '../../src/utils/report';
import { RECOVERY_TRIGGER_DAYS } from '../../src/constants';
import { useStrings } from '../../src/hooks/useStrings';

function getWeekDays(dayLabels: readonly string[]) {
  const today = new Date();
  const day = today.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - day + i);
    return { label: dayLabels[i], isToday: i === day, date: d };
  });
}

function getGreeting(s: { greeting_morning: string; greeting_afternoon: string; greeting_evening: string }) {
  const hour = new Date().getHours();
  if (hour < 12) return s.greeting_morning;
  if (hour < 18) return s.greeting_afternoon;
  return s.greeting_evening;
}

function formatDate(date: Date, locale: string) {
  return date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function HomeScreen() {
  const c = useColors();
  const styles = makeStyles(c);

  const { routines, todayChecks, toggleCheck } = useRoutineStore();
  const { user } = useAuthStore();
  const {
    mode, reducedRoutineIds, reducedStreakDays, lastReducedSuccessDate,
    recordReducedSuccess, exitReducedMode,
  } = useRecoveryStore();
  const s = useStrings().home;
  const weekDays = getWeekDays(s.day_labels);

  const [archivedOpen, setArchivedOpen] = useState(false);

  const completionAnim = useRef(new Animated.Value(0)).current;
  const prevCheckedCount = useRef(0);

  const today = new Date().toISOString().split('T')[0];

  const allActiveRoutines  = routines.filter((r) => r.status === 'active');
  const archivedRoutines   = routines.filter((r) => r.status === 'archived');

  // In reduced mode, show only the selected subset
  const displayRoutines = mode === 'reduced'
    ? allActiveRoutines.filter((r) => reducedRoutineIds.includes(r.id))
    : allActiveRoutines;

  const checkedIds   = new Set(todayChecks.filter((c) => c.checked).map((c) => c.routine_id));
  const checkedCount = displayRoutines.filter((r) => checkedIds.has(r.id)).length;
  const totalCount   = displayRoutines.length;

  // Banner logic
  const showRecovery = mode === 'normal'
    && daysSinceLastCheck(todayChecks) >= RECOVERY_TRIGGER_DAYS
    && allActiveRoutines.length > 0;
  const showRebuild  = mode === 'reduced' && reducedStreakDays >= 3;

  // Completion feedback animation
  useEffect(() => {
    if (totalCount > 0 && checkedCount === totalCount && prevCheckedCount.current < totalCount) {
      completionAnim.setValue(0);
      Animated.sequence([
        Animated.timing(completionAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(completionAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
    prevCheckedCount.current = checkedCount;
  }, [checkedCount, totalCount]);

  // Track reduced mode streak — guard prevents re-trigger after recording
  useEffect(() => {
    if (mode !== 'reduced' || reducedRoutineIds.length === 0) return;
    if (lastReducedSuccessDate === today) return;
    const checkedSet = new Set(todayChecks.filter((c) => c.checked).map((c) => c.routine_id));
    const allDone = reducedRoutineIds.every((id) => checkedSet.has(id));
    if (allDone) recordReducedSuccess(today);
  }, [mode, reducedRoutineIds, todayChecks, lastReducedSuccessDate]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting(s)}</Text>
          <Text style={styles.date}>{formatDate(new Date(), s.date_locale)}</Text>
        </View>

        {/* Weekly strip */}
        <View style={styles.weekRow}>
          {weekDays.map((d, i) => (
            <View key={i} style={[styles.dayCell, d.isToday && styles.dayCellActive]}>
              <Text style={[styles.dayLabel, d.isToday && styles.dayLabelActive]}>{d.label}</Text>
              <Text style={[styles.dayNum, d.isToday && styles.dayNumActive]}>
                {d.date.getDate()}
              </Text>
            </View>
          ))}
        </View>

        {/* Reduced mode indicator */}
        {mode === 'reduced' && (
          <View style={styles.reducedBadge}>
            <Text style={styles.reducedBadgeText}>{s.reduced_badge}</Text>
            <Pressable onPress={exitReducedMode} hitSlop={8}>
              <Text style={styles.reducedExit}>{s.reduced_exit}</Text>
            </Pressable>
          </View>
        )}

        {/* Progress */}
        {totalCount > 0 && (
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {s.progress(checkedCount, totalCount)}
              {mode === 'reduced' ? ` ${s.progress_reduced_suffix}` : ''}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(checkedCount / totalCount) * 100}%` }]} />
            </View>
          </View>
        )}

        {/* Completion feedback */}
        <Animated.View
          style={[
            styles.completionBanner,
            {
              opacity: completionAnim,
              transform: [{
                translateY: completionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              }],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.completionText}>{s.completion_feedback}</Text>
        </Animated.View>

        {/* Routines */}
        <View style={styles.section}>
          {displayRoutines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{s.no_routines}</Text>
              <Text style={styles.emptySubText}>{s.no_routines_sub}</Text>
            </View>
          ) : (
            displayRoutines.map((routine) => {
              const checked = checkedIds.has(routine.id);
              return (
                <View key={routine.id} style={[styles.routineCard, checked && styles.routineCardChecked]}>
                  <Pressable
                    style={styles.checkArea}
                    onPress={() => user && toggleCheck(user.id, routine.id, today)}
                  >
                    <View style={[styles.checkCircle, checked && styles.checkCircleChecked]}>
                      {checked && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                    <Text style={[styles.routineName, checked && styles.routineNameChecked]}>
                      {routine.name}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.chevronArea}
                    onPress={() => router.push(`/routine/${routine.id}`)}
                    hitSlop={8}
                  >
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        {/* Recovery banner — inactive user */}
        {showRecovery && (
          <Pressable style={styles.recoveryBanner} onPress={() => router.push('/modal/recovery')}>
            <Text style={styles.recoveryTitle}>{s.recovery_title}</Text>
            <Text style={styles.recoveryBody}>{s.recovery_body}</Text>
          </Pressable>
        )}

        {/* Rebuild banner — after 3 successful days in reduced mode */}
        {showRebuild && (
          <Pressable style={styles.rebuildBanner} onPress={() => router.push('/modal/recovery-rebuild')}>
            <Text style={styles.rebuildTitle}>{s.rebuild_title}</Text>
            <Text style={styles.rebuildBody}>{s.rebuild_body}</Text>
          </Pressable>
        )}

        {/* Add routine — hidden in reduced mode */}
        {mode === 'normal' && (
          <Pressable style={styles.addButton} onPress={() => router.push('/modal/add-routine')}>
            <Text style={styles.addButtonText}>{s.add_routine}</Text>
          </Pressable>
        )}

        {/* Archived section */}
        {archivedRoutines.length > 0 && (
          <View style={styles.archivedSection}>
            <Pressable style={styles.archivedToggle} onPress={() => setArchivedOpen((v) => !v)}>
              <Text style={styles.archivedToggleText}>
                {s.archived} ({archivedRoutines.length})
              </Text>
              <Text style={styles.archivedToggleIcon}>{archivedOpen ? '∧' : '∨'}</Text>
            </Pressable>

            {archivedOpen && archivedRoutines.map((routine) => (
              <Pressable
                key={routine.id}
                style={styles.archivedRow}
                onPress={() => router.push(`/routine/${routine.id}`)}
              >
                <Text style={styles.archivedName}>{routine.name}</Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
    header: { marginTop: spacing.xl, marginBottom: spacing.lg },
    greeting: { ...typography.h2, color: c.text },
    date: { ...typography.body, color: c.textSecondary, marginTop: spacing.xs },

    weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
    dayCell: { alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, borderRadius: radius.sm, minWidth: 36 },
    dayCellActive: { backgroundColor: c.primary },
    dayLabel: { ...typography.small, color: c.textSecondary, marginBottom: 2 },
    dayLabelActive: { color: c.background },
    dayNum: { ...typography.body, fontWeight: '600', color: c.text },
    dayNumActive: { color: c.background },

    reducedBadge: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: c.surface, borderRadius: radius.sm,
      borderWidth: 1, borderColor: c.border, borderLeftWidth: 3, borderLeftColor: c.primary,
      paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    reducedBadgeText: { ...typography.caption, color: c.text },
    reducedExit: { ...typography.caption, color: c.primary, fontWeight: '600' },

    progressRow: { marginBottom: spacing.lg },
    progressText: { ...typography.caption, color: c.textSecondary, marginBottom: spacing.xs },
    progressBar: { height: 4, backgroundColor: c.border, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: c.primary, borderRadius: 2 },

    completionBanner: {
      marginBottom: spacing.md,
      paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
      backgroundColor: c.primary, borderRadius: radius.md,
      alignItems: 'center',
    },
    completionText: { ...typography.body, color: c.background, fontWeight: '600' },

    section: { gap: spacing.sm },
    routineCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
    },
    routineCardChecked: { borderColor: c.primary, backgroundColor: c.border },
    checkArea: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      gap: spacing.md, paddingVertical: spacing.md, paddingLeft: spacing.md,
    },
    checkCircle: {
      width: 28, height: 28, borderRadius: 14,
      borderWidth: 1.5, borderColor: c.textSecondary,
      alignItems: 'center', justifyContent: 'center',
    },
    checkCircleChecked: { backgroundColor: c.primary, borderColor: c.primary },
    checkMark: { color: c.background, fontSize: 13, fontWeight: '700' },
    routineName: { ...typography.body, color: c.text, flex: 1 },
    routineNameChecked: { color: c.textSecondary, textDecorationLine: 'line-through' },
    chevronArea: { paddingVertical: spacing.md, paddingHorizontal: spacing.md },
    chevron: { fontSize: 20, color: c.muted },

    emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
    emptyText: { ...typography.h3, color: c.text, marginBottom: spacing.xs },
    emptySubText: { ...typography.body, color: c.textSecondary },

    recoveryBanner: {
      marginTop: spacing.lg, backgroundColor: c.surface,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
      borderLeftWidth: 3, borderLeftColor: c.primary, padding: spacing.md,
    },
    recoveryTitle: { ...typography.body, color: c.text, fontWeight: '600', marginBottom: 2 },
    recoveryBody: { ...typography.caption, color: c.textSecondary },

    rebuildBanner: {
      marginTop: spacing.lg, backgroundColor: c.surface,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
      borderLeftWidth: 3, borderLeftColor: '#f59e0b', padding: spacing.md,
    },
    rebuildTitle: { ...typography.body, color: c.text, fontWeight: '600', marginBottom: 2 },
    rebuildBody: { ...typography.caption, color: c.textSecondary },

    addButton: {
      marginTop: spacing.lg, paddingVertical: spacing.md,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border, alignItems: 'center',
    },
    addButtonText: { ...typography.body, color: c.textSecondary },

    archivedSection: { marginTop: spacing.xl },
    archivedToggle: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    archivedToggleText: { ...typography.caption, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
    archivedToggleIcon: { color: c.muted, fontSize: 12 },
    archivedRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
      backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, marginTop: spacing.sm,
      opacity: 0.6,
    },
    archivedName: { ...typography.body, color: c.textSecondary },
  });
}
