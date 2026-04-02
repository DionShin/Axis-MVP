import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useRoutineStore } from '../../src/store/routineStore';
import { Routine } from '../../src/types';

function RoutineRow({ routine, onPress }: { routine: Routine; onPress: () => void }) {
  const isArchived = routine.status === 'archived';
  return (
    <Pressable style={[styles.row, isArchived && styles.rowArchived]} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowName, isArchived && styles.rowNameArchived]}>{routine.name}</Text>
        <Text style={styles.rowMeta}>
          {routine.frequency_type === 'daily' ? 'Daily' : `${routine.frequency_value}x / week`}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function RoutinesScreen() {
  const { routines } = useRoutineStore();
  const active = routines.filter((r) => r.status === 'active');
  const archived = routines.filter((r) => r.status === 'archived');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Routines</Text>
        <Pressable style={styles.addBtn} onPress={() => router.push('/modal/add-routine')}>
          <Text style={styles.addBtnText}>+ New</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {active.length === 0 && archived.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No routines yet.</Text>
            <Text style={styles.emptyBody}>Create your first routine to start tracking.</Text>
            <Pressable style={styles.emptyBtn} onPress={() => router.push('/modal/add-routine')}>
              <Text style={styles.emptyBtnText}>Create routine</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {active.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Active</Text>
                {active.map((r) => (
                  <RoutineRow
                    key={r.id}
                    routine={r}
                    onPress={() => router.push(`/routine/${r.id}`)}
                  />
                ))}
              </View>
            )}

            {archived.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Archived</Text>
                {archived.map((r) => (
                  <RoutineRow
                    key={r.id}
                    routine={r}
                    onPress={() => router.push(`/routine/${r.id}`)}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  addBtnText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  rowArchived: {
    opacity: 0.5,
  },
  rowLeft: {
    flex: 1,
  },
  rowName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  rowNameArchived: {
    color: colors.textSecondary,
  },
  rowMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: colors.muted,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  emptyBtnText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600',
  },
});
