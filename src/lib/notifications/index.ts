import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

const MESSAGES = [
  "Leave today's 1-minute record.",
  'Just one minute tonight.',
  'You can restart with one small check.',
];

/** Schedule a single daily reminder. Identifier is keyed by time so each is independent. */
export async function scheduleNightlyReminder(time: string): Promise<void> {
  if (time === 'skip') return;

  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  await Notifications.scheduleNotificationAsync({
    identifier: `nightly-reminder-${time}`,
    content: { title: 'Axis', body: message },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/** Replace all scheduled nightly reminders with the given time list. */
export async function scheduleAllReminders(times: string[]): Promise<void> {
  await cancelAllReminders();
  await Promise.all(times.map(scheduleNightlyReminder));
}

/** Cancel every nightly reminder (including the legacy single-reminder identifier). */
export async function cancelAllReminders(): Promise<void> {
  // Cancel legacy single identifier
  try {
    await Notifications.cancelScheduledNotificationAsync('nightly-reminder');
  } catch (_) {}

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith('nightly-reminder-'))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/** @deprecated Use scheduleAllReminders. Kept for onboarding compat. */
export async function cancelNightlyReminder(): Promise<void> {
  await cancelAllReminders();
}

export async function scheduleRecoveryReminder(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: 'recovery-reminder',
    content: {
      title: 'Axis',
      body: 'Missing days is okay. Try one small check.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 20,
      repeats: false,
    },
  });
}

export async function cancelRecoveryReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('recovery-reminder');
}
