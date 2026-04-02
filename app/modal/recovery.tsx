import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useRoutineStore } from '../../src/store/routineStore';

type RecoveryOption = 'minimum' | 'continue' | 'reduce';

export default function RecoveryModal() {
  const { routines, archiveRoutine } = useRoutineStore();
  const active = routines.filter((r) => r.status === 'active');

  const handleOption = (option: RecoveryOption) => {
    if (option === 'reduce' && active.length > 2) {
      // Archive all but the top 2 (by creation date — simplest heuristic)
      const toKeep = active.slice(0, 2).map((r) => r.id);
      active.forEach((r) => {
        if (!toKeep.includes(r.id)) archiveRoutine(r.id);
      });
    }
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.heading}>Welcome back.</Text>
        <Text style={styles.body}>
          Missing days happens. You're here now — that's what matters.
        </Text>
        <Text style={styles.body}>How do you want to restart?</Text>

        <View style={styles.options}>
          <Pressable style={styles.optionCard} onPress={() => handleOption('continue')}>
            <Text style={styles.optionTitle}>Continue as usual</Text>
            <Text style={styles.optionDesc}>
              Keep all {active.length} routine{active.length !== 1 ? 's' : ''} active and check in normally.
            </Text>
          </Pressable>

          <Pressable style={styles.optionCard} onPress={() => handleOption('minimum')}>
            <Text style={styles.optionTitle}>Just one routine today</Text>
            <Text style={styles.optionDesc}>
              Check only one routine today. Low bar, easy win.
            </Text>
          </Pressable>

          {active.length > 2 && (
            <Pressable style={styles.optionCard} onPress={() => handleOption('reduce')}>
              <Text style={styles.optionTitle}>Reduce routine load</Text>
              <Text style={styles.optionDesc}>
                Archive down to 2 routines so it feels lighter to start again.
              </Text>
            </Pressable>
          )}
        </View>

        <Pressable style={styles.dismissBtn} onPress={() => router.back()}>
          <Text style={styles.dismissText}>Maybe later</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  emoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  heading: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  options: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  optionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  dismissBtn: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  dismissText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
