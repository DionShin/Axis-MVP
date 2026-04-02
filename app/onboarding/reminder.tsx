import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useOnboardingStore } from '../../src/store/onboardingStore';

const TIME_OPTIONS = [
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
  { label: '10:00 PM', value: '22:00' },
  { label: '11:00 PM', value: '23:00' },
  { label: 'Skip for now', value: 'skip' },
];

export default function OnboardingReminder() {
  const { reminderTime, setReminderTime, setCompleted } = useOnboardingStore();

  const handleFinish = () => {
    setCompleted(true);
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Set a nightly reminder.</Text>
        <Text style={styles.sub}>A short nudge to check your routines before bed.</Text>
      </View>

      <View style={styles.list}>
        {TIME_OPTIONS.map((opt) => {
          const selected = reminderTime === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.item, selected && styles.itemSelected]}
              onPress={() => setReminderTime(opt.value)}
            >
              <Text style={[styles.itemText, selected && styles.itemTextSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <Pressable style={styles.button} onPress={handleFinish}>
        <Text style={styles.buttonText}>Start tracking</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sub: {
    ...typography.body,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  itemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  itemText: {
    ...typography.body,
    color: colors.text,
  },
  itemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600',
  },
});
