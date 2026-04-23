import { View, Text, StyleSheet, Pressable, Switch, ScrollView, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useThemeStore } from '../../src/store/themeStore';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { useAuthStore } from '../../src/store/authStore';
import { useRoutineStore } from '../../src/store/routineStore';
import { supabase } from '../../src/lib/supabase';
import { scheduleAllReminders, cancelAllReminders, requestNotificationPermission } from '../../src/lib/notifications';
import { TimePicker } from '../../src/components/TimePicker';
import { useLanguageStore } from '../../src/store/languageStore';
import { useStrings } from '../../src/hooks/useStrings';
import { Language } from '../../src/i18n/strings';

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

  const { language, setLanguage } = useLanguageStore();
  const allStrings = useStrings();
  const s = allStrings.settings;

  const notifEnabled = reminderTimes.length > 0;
  const [pickerValue, setPickerValue] = useState('21:00');
  const [permissionGranted, setPermissionGranted] = useState(true);

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setPermissionGranted(status === 'granted');
    });
  }, []);

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
        <Text style={styles.title}>{s.title}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionLabel}>{s.section_notifications}</Text>
        <View style={styles.card}>
          <SettingRow
            c={c}
            label={s.nightly_reminder}
            sublabel={s.nightly_reminder_sub}
            right={
              <Switch
                value={notifEnabled}
                onValueChange={handleToggleNotif}
                trackColor={{ false: c.border, true: c.primary }}
                thumbColor={c.background}
              />
            }
          />

          {notifEnabled && !permissionGranted && (
            <Pressable
              style={styles.permissionBanner}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }}
            >
              <Text style={styles.permissionBannerText}>{s.permission_banner}</Text>
            </Pressable>
          )}

          {notifEnabled && (
            <View style={styles.reminderSection}>
              <View style={styles.pickerWrapper}>
                <TimePicker value={pickerValue} onChange={setPickerValue} />
              </View>

              <Pressable style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.addButtonText}>{s.add_reminder}</Text>
              </Pressable>

              {reminderTimes.length > 0 && (
                <View style={styles.timeList}>
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

        <Text style={styles.sectionLabel}>{s.section_nudges}</Text>
        <View style={styles.card}>
          <SettingRow
            c={c}
            label={s.nudges_row}
            sublabel={s.nudges_row_sub}
            right={<Text style={{ color: c.muted, fontSize: 18 }}>›</Text>}
            onPress={() => router.push('/modal/nudges')}
          />
        </View>

        <Text style={styles.sectionLabel}>{s.section_share}</Text>
        <View style={styles.card}>
          <SettingRow
            c={c}
            label={s.share_row}
            sublabel={s.share_row_sub}
            right={<Text style={{ color: c.muted, fontSize: 18 }}>›</Text>}
            onPress={() => router.push('/modal/share-pathway')}
          />
        </View>

        <Text style={styles.sectionLabel}>{s.section_appearance}</Text>
        <View style={styles.card}>
          <SettingRow
            c={c}
            label={s.dark_mode}
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

        <Text style={styles.sectionLabel}>{s.section_language}</Text>
        <View style={styles.card}>
          <View style={styles.languageRow}>
            {(['ko', 'en'] as Language[]).map((lang) => (
              <Pressable
                key={lang}
                style={[styles.langBtn, language === lang && styles.langBtnActive]}
                onPress={() => setLanguage(lang)}
              >
                <Text style={[styles.langBtnText, language === lang && styles.langBtnTextActive]}>
                  {lang === 'ko' ? '한국어' : 'English'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.sectionLabel}>{s.section_account}</Text>
        <View style={styles.card}>
          <SettingRow
            c={c}
            label={s.sign_out}
            danger
            onPress={() =>
              Alert.alert(s.sign_out_confirm_title, s.sign_out_confirm_msg, [
                { text: s.cancel, style: 'cancel' },
                {
                  text: s.sign_out_confirm_ok,
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

        <Text style={styles.sectionLabel}>{s.section_legal}</Text>
        <View style={styles.card}>
          <SettingRow
            c={c}
            label={allStrings.privacy.settings_row}
            sublabel={allStrings.privacy.settings_row_sub}
            right={<Text style={{ color: c.muted, fontSize: 18 }}>›</Text>}
            onPress={() => router.push('/modal/privacy')}
          />
        </View>

        <Text style={styles.version}>{s.version}</Text>
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
    permissionBanner: {
      marginHorizontal: spacing.md, marginTop: spacing.sm,
      backgroundColor: '#fef3c7', borderRadius: radius.sm,
      borderWidth: 1, borderColor: '#f59e0b', padding: spacing.sm,
    },
    permissionBannerText: { ...typography.caption, color: '#92400e' },
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
    languageRow: {
      flexDirection: 'row', padding: spacing.md, gap: spacing.sm,
    },
    langBtn: {
      flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm,
      borderWidth: 1, borderColor: c.border, alignItems: 'center',
      backgroundColor: c.surface,
    },
    langBtnActive: { borderColor: c.primary, backgroundColor: c.primary },
    langBtnText: { ...typography.body, color: c.textSecondary, fontWeight: '500' },
    langBtnTextActive: { color: c.background, fontWeight: '600' },
    version: { ...typography.small, color: c.muted, textAlign: 'center', marginTop: spacing.xxl },
  });
}
