import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useRoutineStore } from '../../src/store/routineStore';
import { Routine } from '../../src/types';

function RoutineRow({ routine, onPress, c }: { routine: Routine; onPress: () => void; c: AppColors }) {
  const isArchived = routine.status === 'archived';
  return (
    <Pressable
      style={[
        { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: c.border, marginBottom: spacing.sm },
        isArchived && { opacity: 0.5 },
      ]}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text style={[{ ...typography.body, color: c.text, fontWeight: '500' }, isArchived && { color: c.textSecondary }]}>
          {routine.name}
        </Text>
        <Text style={{ ...typography.caption, color: c.textSecondary, marginTop: 2 }}>
          {routine.frequency_type === 'daily' ? 'Daily' : `${routine.frequency_value}x / week`}
        </Text>
      </View>
      <Text style={{ fontSize: 20, color: c.muted }}>›</Text>
    </Pressable>
  );
}

export default function RoutinesScreen() {
  const c = useColors();
  const styles = makeStyles(c);

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
                  <RoutineRow key={r.id} routine={r} c={c} onPress={() => router.push(`/routine/${r.id}`)} />
                ))}
              </View>
            )}
            {archived.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Archived</Text>
                {archived.map((r) => (
                  <RoutineRow key={r.id} routine={r} c={c} onPress={() => router.push(`/routine/${r.id}`)} />
                ))}
              </View>
            )}
          </>
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
    addBtn: { backgroundColor: c.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm },
    addBtnText: { ...typography.caption, color: c.background, fontWeight: '600' },
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
    section: { marginBottom: spacing.xl },
    sectionLabel: {
      ...typography.caption, color: c.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm,
    },
    emptyState: { alignItems: 'center', paddingTop: spacing.xxl * 2 },
    emptyTitle: { ...typography.h3, color: c.text, marginBottom: spacing.xs },
    emptyBody: { ...typography.body, color: c.textSecondary, marginBottom: spacing.xl },
    emptyBtn: { backgroundColor: c.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: radius.md },
    emptyBtnText: { ...typography.body, color: c.background, fontWeight: '600' },
  });
}
