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

export async function scheduleNightlyReminder(time: string): Promise<void> {
  // Cancel existing reminders first
  await cancelNightlyReminder();

  if (time === 'skip') return;

  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const messages = [
    'Leave today\'s 1-minute record.',
    'Just one minute tonight.',
    'You can restart with one small check.',
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];

  await Notifications.scheduleNotificationAsync({
    identifier: 'nightly-reminder',
    content: {
      title: 'Axis',
      body: message,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelNightlyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('nightly-reminder');
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
      seconds: 60 * 60 * 20, // 20 hours later
      repeats: false,
    },
  });
}

export async function cancelRecoveryReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('recovery-reminder');
}
