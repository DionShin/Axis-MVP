import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useRoutineStore } from '../../src/store/routineStore';
import { useAuthStore } from '../../src/store/authStore';
import { daysSinceLastCheck } from '../../src/utils/report';
import { RECOVERY_TRIGGER_DAYS } from '../../src/constants';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getWeekDays() {
  const today = new Date();
  const day = today.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - day + i);
    return { label: DAYS[i], isToday: i === day, date: d };
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning.';
  if (hour < 18) return 'Good afternoon.';
  return 'Good evening.';
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function HomeScreen() {
  const c = useColors();
  const styles = makeStyles(c);

  const { routines, todayChecks, toggleCheck } = useRoutineStore();
  const { user } = useAuthStore();
  const [archivedOpen, setArchivedOpen] = useState(false);

  const weekDays = getWeekDays();
  const today = new Date().toISOString().split('T')[0];

  const activeRoutines   = routines.filter((r) => r.status === 'active');
  const archivedRoutines = routines.filter((r) => r.status === 'archived');
  const checkedIds = new Set(todayChecks.filter((c) => c.checked).map((c) => c.routine_id));
  const checkedCount = checkedIds.size;
  const totalCount   = activeRoutines.length;
  const showRecovery = daysSinceLastCheck(todayChecks) >= RECOVERY_TRIGGER_DAYS && totalCount > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{formatDate(new Date())}</Text>
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

        {/* Progress */}
        {totalCount > 0 && (
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{checkedCount}/{totalCount} done today</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(checkedCount / totalCount) * 100}%` }]} />
            </View>
          </View>
        )}

        {/* Active routines */}
        <View style={styles.section}>
          {activeRoutines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No routines yet.</Text>
              <Text style={styles.emptySubText}>Add your first routine to get started.</Text>
            </View>
          ) : (
            activeRoutines.map((routine) => {
              const checked = checkedIds.has(routine.id);
              return (
                <View key={routine.id} style={[styles.routineCard, checked && styles.routineCardChecked]}>
                  {/* Left: tap to check */}
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
                  {/* Right: tap to navigate to detail */}
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

        {/* Recovery banner */}
        {showRecovery && (
          <Pressable style={styles.recoveryBanner} onPress={() => router.push('/modal/recovery')}>
            <Text style={styles.recoveryTitle}>Been a while?</Text>
            <Text style={styles.recoveryBody}>Tap to restart gently — no guilt.</Text>
          </Pressable>
        )}

        {/* Add routine */}
        <Pressable style={styles.addButton} onPress={() => router.push('/modal/add-routine')}>
          <Text style={styles.addButtonText}>+ Add routine</Text>
        </Pressable>

        {/* Archived section */}
        {archivedRoutines.length > 0 && (
          <View style={styles.archivedSection}>
            <Pressable style={styles.archivedToggle} onPress={() => setArchivedOpen((v) => !v)}>
              <Text style={styles.archivedToggleText}>
                Archived ({archivedRoutines.length})
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
    progressRow: { marginBottom: spacing.lg },
    progressText: { ...typography.caption, color: c.textSecondary, marginBottom: spacing.xs },
    progressBar: { height: 4, backgroundColor: c.border, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: c.primary, borderRadius: 2 },
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
