import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '../../src/theme';
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
  const { routines, todayChecks, toggleCheck } = useRoutineStore();
  const { user } = useAuthStore();

  const weekDays = getWeekDays();
  const today = new Date().toISOString().split('T')[0];

  const displayRoutines = routines.filter((r) => r.status === 'active');

  const checkedIds = new Set(
    todayChecks.filter((c) => c.checked).map((c) => c.routine_id)
  );
  const checkedCount = checkedIds.size;
  const totalCount = displayRoutines.length;
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

        {/* Progress summary */}
        {totalCount > 0 && (
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {checkedCount}/{totalCount} done today
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Routines */}
        <View style={styles.section}>
          {displayRoutines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No routines yet.</Text>
              <Text style={styles.emptySubText}>Add your first routine to get started.</Text>
            </View>
          ) : (
            displayRoutines.map((routine) => {
              const checked = checkedIds.has(routine.id);
              return (
                <Pressable
                  key={routine.id}
                  style={[styles.routineCard, checked && styles.routineCardChecked]}
                  onPress={() => user && toggleCheck(user.id, routine.id, today)}
                >
                  <View style={[styles.checkCircle, checked && styles.checkCircleChecked]}>
                    {checked && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.routineName, checked && styles.routineNameChecked]}>
                    {routine.name}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>

        {/* Recovery CTA */}
        {showRecovery && (
          <Pressable style={styles.recoveryBanner} onPress={() => router.push('/modal/recovery')}>
            <Text style={styles.recoveryTitle}>Been a while?</Text>
            <Text style={styles.recoveryBody}>Tap to restart gently — no guilt.</Text>
          </Pressable>
        )}

        {/* Add routine CTA */}
        <Pressable style={styles.addButton} onPress={() => router.push('/modal/add-routine')}>
          <Text style={styles.addButtonText}>+ Add routine</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  date: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  dayCell: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    minWidth: 36,
  },
  dayCellActive: {
    backgroundColor: colors.primary,
  },
  dayLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dayLabelActive: {
    color: '#fff',
  },
  dayNum: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  dayNumActive: {
    color: '#fff',
  },
  progressRow: {
    marginBottom: spacing.lg,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  section: {
    gap: spacing.sm,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  routineCardChecked: {
    borderColor: colors.primary,
    backgroundColor: '#f5f5f5',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  routineName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  routineNameChecked: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  recoveryBanner: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.md,
  },
  recoveryTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  recoveryBody: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  addButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  addButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
