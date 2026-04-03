import { View, Text, StyleSheet, Pressable, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useThemeStore } from '../../src/store/themeStore';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { useAuthStore } from '../../src/store/authStore';
import { useRoutineStore } from '../../src/store/routineStore';
import { supabase } from '../../src/lib/supabase';
import { scheduleAllReminders, cancelAllReminders, requestNotificationPermission } from '../../src/lib/notifications';
import { TimePicker } from '../../src/components/TimePicker';

function format12h(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const period = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr} ${period}`;
}

function SettingRow({
  label, sublabel, right, onPress, danger, c,
}: {
  label: string; sublabel?: string; right?: React.ReactNode;
  onPress?: () => void; danger?: boolean; c: AppColors;
}) {
  return (
    <Pressable
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: c.border }}
      onPress={onPress}
    >
      <View style={{ flex: 1, marginRight: spacing.md }}>
        <Text style={[{ ...typography.body, color: c.text }, danger && { color: '#d00' }]}>{label}</Text>
        {sublabel && <Text style={{ ...typography.caption, color: c.textSecondary, marginTop: 2 }}>{sublabel}</Text>}
      </View>
      {right && <View>{right}</View>}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const c = useColors();
  const styles = makeStyles(c);
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { reminderTimes, addReminderTime, removeReminderTime, setReminderTimes } = useOnboardingStore();
  const { setUser } = useAuthStore();
  const { setRoutines, setTodayChecks } = useRoutineStore();

  const notifEnabled = reminderTimes.length > 0;
  const [pickerValue, setPickerValue] = useState('21:00');

  const handleToggleNotif = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Permission needed', 'Enable notifications in your device settings to use reminders.');
        return;
      }
      const times = ['21:00'];
      setReminderTimes(times);
      await scheduleAllReminders(times);
    } else {
      setReminderTimes([]);
      await cancelAllReminders();
    }
  };

  const handleAdd = async () => {
    if (reminderTimes.includes(pickerValue)) {
      Alert.alert('Already added', `${format12h(pickerValue)} is already in your reminder list.`);
      return;
    }
    addReminderTime(pickerValue);
    const next = [...reminderTimes, pickerValue].filter((t, i, arr) => arr.indexOf(t) === i).sort();
    await scheduleAllReminders(next);
  };

  const handleRemove = async (time: string) => {
    removeReminderTime(time);
    await scheduleAllReminders(reminderTimes.filter((t) => t !== time));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <SettingRow
            c={c}
            label="Nightly reminder"
            sublabel="A short nudge to check your routines"
            right={
              <Switch
                value={notifEnabled}
                onValueChange={handleToggleNotif}
                trackColor={{ false: c.border, true: c.primary }}
                thumbColor={c.background}
              />
            }
          />

          {notifEnabled && (
            <View style={styles.reminderSection}>
              <View style={styles.pickerWrapper}>
                <TimePicker value={pickerValue} onChange={setPickerValue} />
              </View>

              <Pressable style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.addButtonText}>+ Add reminder</Text>
              </Pressable>

              {reminderTimes.length > 0 && (
                <View style={styles.timeList}>
                  <Text style={styles.timeListLabel}>Scheduled</Text>
                  {reminderTimes.map((t) => (
                    <View key={t} style={styles.timeRow}>
                      <Text style={styles.timeRowText}>{format12h(t)}</Text>
                      <Pressable onPress={() => handleRemove(t)} hitSlop={8}>
                        <Text style={styles.removeText}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.card}>
          <SettingRow
            c={c}
            label="Dark mode"
            right={
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: c.border, true: c.primary }}
                thumbColor={c.background}
              />
            }
          />
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <SettingRow
            c={c}
            label="Sign out"
            danger
            onPress={() =>
              Alert.alert('Sign out', 'Sign out of your account?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign out',
                  style: 'destructive',
                  onPress: async () => {
                    await supabase.auth.signOut();
                    setUser(null);
                    setRoutines([]);
                    setTodayChecks([]);
                    router.replace('/auth');
                  },
                },
              ])
            }
          />
        </View>

        <Text style={styles.version}>Axis MVP · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md },
    title: { ...typography.h2, color: c.text },
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
    sectionLabel: {
      ...typography.caption, color: c.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginBottom: spacing.sm, marginTop: spacing.lg,
    },
    card: {
      backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, overflow: 'hidden',
    },
    reminderSection: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
    pickerWrapper: { alignItems: 'center', marginVertical: spacing.sm },
    addButton: {
      marginTop: spacing.sm, paddingVertical: spacing.sm,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.primary, alignItems: 'center',
    },
    addButtonText: { ...typography.body, color: c.primary, fontWeight: '600' },
    timeList: { marginTop: spacing.md, gap: spacing.xs },
    timeListLabel: { ...typography.caption, color: c.textSecondary, marginBottom: spacing.xs },
    timeRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: spacing.xs, paddingHorizontal: spacing.sm,
      backgroundColor: c.background, borderRadius: radius.sm,
      borderWidth: 1, borderColor: c.border,
    },
    timeRowText: { ...typography.body, color: c.text, fontWeight: '500' },
    removeText: { color: c.textSecondary, fontSize: 14, fontWeight: '600' },
    version: { ...typography.small, color: c.muted, textAlign: 'center', marginTop: spacing.xxl },
  });
}
