import * as Notifications from 'expo-notifications';

const IDENTIFIER = 'recovery-reminder';

export async function scheduleRecoveryNotification(daysSince: number, triggerDays: number, body?: string): Promise<void> {
  // Cancel if user is active again
  if (daysSince < triggerDays) {
    await Notifications.cancelScheduledNotificationAsync(IDENTIFIER).catch(() => {});
    return;
  }

  // Don't double-schedule
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  if (scheduled.some((n) => n.identifier === IDENTIFIER)) return;

  // Schedule for 8pm today; if past 8pm, schedule for tomorrow
  const trigger = new Date();
  trigger.setHours(20, 0, 0, 0);
  if (trigger <= new Date()) {
    trigger.setDate(trigger.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    identifier: IDENTIFIER,
    content: {
      title: 'Axis',
      body: body ?? '끊긴 것도 기록의 일부예요. 오늘 가볍게 다시 시작해볼까요?',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });
}
