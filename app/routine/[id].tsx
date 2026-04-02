import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useRoutineStore } from '../../src/store/routineStore';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function TimelineRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={timelineStyles.row}>
      <View style={timelineStyles.dot} />
      <View style={timelineStyles.content}>
        <Text style={timelineStyles.label}>{label}</Text>
        <Text style={[timelineStyles.value, accent && timelineStyles.valueAccent]}>{value}</Text>
      </View>
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: spacing.md,
  },
  content: { flex: 1 },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: 2 },
  value: { ...typography.body, color: colors.text },
  valueAccent: { fontWeight: '600' },
});

export default function RoutineDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines, archiveRoutine, restartRoutine, todayChecks } = useRoutineStore();
  const routine = routines.find((r) => r.id === id);

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
        </View>
        <View style={styles.center}>
          <Text style={styles.notFound}>Routine not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isArchived = routine.status === 'archived';
  const checkedDays = todayChecks.filter((c) => c.routine_id === id && c.checked).length;

  const handleArchive = () => {
    Alert.alert(
      'Archive routine',
      `Archive "${routine.name}"? You can restart it anytime.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            archiveRoutine(id);
            router.back();
          },
        },
      ]
    );
  };

  const handleRestart = () => {
    restartRoutine(id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        {!isArchived && (
          <Pressable onPress={() => router.push(`/routine/edit/${id}`)}>
            <Text style={styles.editBtn}>Edit</Text>
          </Pressable>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{routine.name}</Text>
          <View style={[styles.badge, isArchived && styles.badgeArchived]}>
            <Text style={[styles.badgeText, isArchived && styles.badgeTextArchived]}>
              {isArchived ? 'Archived' : 'Active'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Timeline</Text>
        <View style={styles.timeline}>
          <TimelineRow label="Created" value={formatDate(routine.created_at)} accent />
          {routine.restarted_at && (
            <TimelineRow label="Restarted" value={formatDate(routine.restarted_at)} />
          )}
          {routine.archived_at && (
            <TimelineRow label="Archived" value={formatDate(routine.archived_at)} />
          )}
        </View>

        <Text style={styles.sectionLabel}>Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{checkedDays}</Text>
            <Text style={styles.statLabel}>Checked today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{routine.frequency_type === 'daily' ? 'Daily' : `${routine.frequency_value}x/wk`}</Text>
            <Text style={styles.statLabel}>Frequency</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{routine.category.replace('_', ' ')}</Text>
            <Text style={styles.statLabel}>Category</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isArchived ? (
          <Pressable style={styles.restartBtn} onPress={handleRestart}>
            <Text style={styles.restartBtnText}>Restart routine</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.archiveBtn} onPress={handleArchive}>
            <Text style={styles.archiveBtnText}>Archive routine</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  back: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  editBtn: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  name: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  badgeArchived: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    ...typography.small,
    color: '#fff',
    fontWeight: '600',
  },
  badgeTextArchived: {
    color: colors.textSecondary,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  timeline: {
    paddingLeft: spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  statLabel: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  archiveBtn: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  archiveBtnText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  restartBtn: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  restartBtnText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
