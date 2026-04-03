import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useRoutineStore } from '../../src/store/routineStore';
import { totalCheckedDays, bestStreak } from '../../src/utils/history';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function TimelineRow({ label, value, accent, c }: { label: string; value: string; accent?: boolean; c: AppColors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary, marginTop: 6, marginRight: spacing.md }} />
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.caption, color: c.textSecondary, marginBottom: 2 }}>{label}</Text>
        <Text style={[{ ...typography.body, color: c.text }, accent && { fontWeight: '600' }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function RoutineDetail() {
  const c = useColors();
  const styles = makeStyles(c);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines, archiveRoutine, restartRoutine, checks } = useRoutineStore();
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
  const totalDays = totalCheckedDays(id, checks);
  const streak = bestStreak(id, checks);

  const handleArchive = () => {
    Alert.alert(
      'Archive routine',
      `Archive "${routine.name}"? You can restart it anytime.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', style: 'destructive', onPress: () => { archiveRoutine(id); router.back(); } },
      ]
    );
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
          <TimelineRow label="Created" value={formatDate(routine.created_at)} accent c={c} />
          {routine.restarted_at && <TimelineRow label="Restarted" value={formatDate(routine.restarted_at)} c={c} />}
          {routine.archived_at && <TimelineRow label="Archived" value={formatDate(routine.archived_at)} c={c} />}
        </View>

        <Text style={styles.sectionLabel}>Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalDays}</Text>
            <Text style={styles.statLabel}>Total days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Best streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{routine.category.replace('_', ' ')}</Text>
            <Text style={styles.statLabel}>Category</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isArchived ? (
          <Pressable style={styles.restartBtn} onPress={() => { restartRoutine(id); router.back(); }}>
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
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
    name: { ...typography.h2, color: c.text, flex: 1, marginRight: spacing.md },
    badge: { backgroundColor: c.primary, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
    badgeArchived: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
    badgeText: { ...typography.small, color: c.background, fontWeight: '600' },
    badgeTextArchived: { color: c.textSecondary },
    sectionLabel: {
      ...typography.caption, color: c.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginBottom: spacing.md, marginTop: spacing.lg,
    },
    timeline: { paddingLeft: spacing.sm, borderLeftWidth: 1, borderLeftColor: c.border, marginLeft: spacing.xs },
    statsRow: { flexDirection: 'row', gap: spacing.sm },
    statCard: {
      flex: 1, backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, padding: spacing.md, alignItems: 'center',
    },
    statValue: { ...typography.h3, color: c.text, marginBottom: 2, textTransform: 'capitalize' },
    statLabel: { ...typography.small, color: c.textSecondary, textAlign: 'center' },
    footer: {
      paddingHorizontal: spacing.xl, paddingBottom: spacing.xl,
      paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: c.border,
    },
    archiveBtn: { paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, alignItems: 'center' },
    archiveBtnText: { ...typography.body, color: c.textSecondary },
    restartBtn: { paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: c.primary, alignItems: 'center' },
    restartBtnText: { ...typography.body, color: c.background, fontWeight: '600' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    notFound: { ...typography.body, color: c.textSecondary },
  });
}
