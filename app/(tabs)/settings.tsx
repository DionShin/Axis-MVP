import { View, Text, StyleSheet, Pressable, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import {
  scheduleNightlyReminder,
  cancelNightlyReminder,
  requestNotificationPermission,
} from '../../src/lib/notifications';

const TIME_OPTIONS = [
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
  { label: '10:00 PM', value: '22:00' },
  { label: '11:00 PM', value: '23:00' },
];

function SettingRow({
  label,
  sublabel,
  right,
  onPress,
  danger,
}: {
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
        {sublabel && <Text style={styles.rowSublabel}>{sublabel}</Text>}
      </View>
      {right && <View>{right}</View>}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { reminderTime, setReminderTime } = useOnboardingStore();
  const [notifEnabled, setNotifEnabled] = useState(reminderTime !== 'skip');

  const handleToggleNotif = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Permission needed', 'Enable notifications in your device settings to use reminders.');
        return;
      }
      setNotifEnabled(true);
      await scheduleNightlyReminder(reminderTime === 'skip' ? '21:00' : reminderTime);
      if (reminderTime === 'skip') setReminderTime('21:00');
    } else {
      setNotifEnabled(false);
      await cancelNightlyReminder();
    }
  };

  const handleTimeChange = async (time: string) => {
    setReminderTime(time);
    if (notifEnabled) {
      await scheduleNightlyReminder(time);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <SettingRow
            label="Nightly reminder"
            sublabel="A short nudge to check your routines"
            right={
              <Switch
                value={notifEnabled}
                onValueChange={handleToggleNotif}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            }
          />

          {notifEnabled && (
            <View style={styles.timeOptions}>
              <Text style={styles.timeLabel}>Reminder time</Text>
              <View style={styles.timeGrid}>
                {TIME_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[styles.timeChip, reminderTime === opt.value && styles.timeChipSelected]}
                    onPress={() => handleTimeChange(opt.value)}
                  >
                    <Text style={[styles.timeChipText, reminderTime === opt.value && styles.timeChipTextSelected]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Appearance — placeholder for dark mode */}
        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.card}>
          <SettingRow
            label="Dark mode"
            sublabel="Coming soon"
            right={<Switch value={false} disabled trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />}
          />
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <SettingRow
            label="Sign out"
            danger
            onPress={() =>
              Alert.alert('Sign out', 'Sign out of your account?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign out', style: 'destructive', onPress: () => {} },
              ])
            }
          />
        </View>

        <Text style={styles.version}>Axis MVP · v1.0.0</Text>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLeft: { flex: 1, marginRight: spacing.md },
  rowLabel: {
    ...typography.body,
    color: colors.text,
  },
  rowLabelDanger: {
    color: '#d00',
  },
  rowSublabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timeOptions: {
    padding: spacing.md,
  },
  timeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  timeChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  timeChipText: {
    ...typography.caption,
    color: colors.text,
  },
  timeChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  version: {
    ...typography.small,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
