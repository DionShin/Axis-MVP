import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { useAuthStore } from '../../src/store/authStore';
import { useRoutineStore } from '../../src/store/routineStore';
import { requestNotificationPermission, scheduleAllReminders } from '../../src/lib/notifications';
import { upsertProfile, insertRoutine } from '../../src/lib/supabase/db';
import { DEFAULT_ROUTINES } from '../../src/constants';
import { TimePicker } from '../../src/components/TimePicker';

export default function OnboardingReminder() {
  const c = useColors();
  const styles = makeStyles(c);
  const { setReminderTimes, setCompleted, selectedRoutineNames, goalCategory } = useOnboardingStore();
  const { user, setUser } = useAuthStore();
  const { loadRoutines } = useRoutineStore();
  const [selectedTime, setSelectedTime] = useState('21:00');

  const handleFinish = async (skip = false) => {
    if (!skip) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setReminderTimes([selectedTime]);
        await scheduleAllReminders([selectedTime]);
      } else {
        setReminderTimes([]);
      }
    } else {
      setReminderTimes([]);
    }

    if (user) {
      const categoryMap = Object.fromEntries(DEFAULT_ROUTINES.map((r) => [r.name, r.category]));
      await Promise.all(
        selectedRoutineNames.map((name) =>
          insertRoutine(user.id, name, categoryMap[name] ?? goalCategory ?? 'life_habits')
        )
      );
      await loadRoutines(user.id);
      await upsertProfile({ id: user.id, onboarding_completed: true });
      setUser({ ...user, onboarding_completed: true });
    }

    setCompleted(true);
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Set a nightly reminder.</Text>
        <Text style={styles.sub}>Scroll to pick the time that works for you.</Text>
      </View>

      <View style={styles.pickerContainer}>
        <TimePicker value={selectedTime} onChange={setSelectedTime} />
      </View>

      <View style={{ flex: 1 }} />

      <Pressable style={styles.button} onPress={() => handleFinish(false)}>
        <Text style={styles.buttonText}>Start tracking</Text>
      </Pressable>

      <Pressable style={styles.skipButton} onPress={() => handleFinish(true)}>
        <Text style={styles.skipText}>Skip for now</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
    header: { marginTop: spacing.xl, marginBottom: spacing.lg },
    heading: { ...typography.h2, color: c.text, marginBottom: spacing.xs },
    sub: { ...typography.body, color: c.textSecondary },
    pickerContainer: {
      alignItems: 'center', marginTop: spacing.lg,
      paddingVertical: spacing.md, backgroundColor: c.surface,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
    },
    button: { backgroundColor: c.primary, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center', marginBottom: spacing.sm },
    buttonText: { ...typography.body, color: c.background, fontWeight: '600' },
    skipButton: { paddingVertical: spacing.sm, alignItems: 'center' },
    skipText: { ...typography.body, color: c.textSecondary },
  });
}
