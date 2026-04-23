import * as Notifications from 'expo-notifications';
import { NUDGE_LIBRARY } from '../../constants/nudges';

const PREFIX = 'nudge-';
const MAX_NOTIFICATIONS = 56; // stay safely under iOS 64 limit

export async function scheduleNudges(
  enabled: boolean,
  selectedIds: string[],
  customNudges: string[],
  intervalHours: number,
  activeStart: string,
  activeEnd: string,
  language: 'ko' | 'en' = 'ko',
): Promise<void> {
  await cancelNudges();

  if (!enabled) return;

  const allTexts = [
    ...NUDGE_LIBRARY.filter((n) => selectedIds.includes(n.id)).map((n) => language === 'en' ? n.text_en : n.text_ko),
    ...customNudges,
  ];
  if (allTexts.length === 0) return;

  const [startH] = activeStart.split(':').map(Number);
  const [endH]   = activeEnd.split(':').map(Number);
  const startMin = startH * 60;
  const endMin   = endH * 60;
  const intervalMin = intervalHours * 60;

  // Slots per day (how many nudges fit in the active window)
  const slotsPerDay = Math.max(1, Math.floor((endMin - startMin) / intervalMin));

  // Schedule enough days to reach MAX_NOTIFICATIONS
  const daysToSchedule = Math.min(7, Math.ceil(MAX_NOTIFICATIONS / slotsPerDay));

  const now = new Date();
  let count = 0;

  for (let day = 0; day < daysToSchedule && count < MAX_NOTIFICATIONS; day++) {
    let slot = startMin;
    while (slot + intervalMin <= endMin && count < MAX_NOTIFICATIONS) {
      // Add random jitter within ±25% of interval
      const jitter = Math.floor((Math.random() - 0.5) * intervalMin * 0.5);
      const actualMin = Math.max(startMin, Math.min(endMin - 1, slot + jitter));

      const triggerDate = new Date(now);
      triggerDate.setDate(now.getDate() + day);
      triggerDate.setHours(Math.floor(actualMin / 60), actualMin % 60, 0, 0);

      if (triggerDate > now) {
        const text = allTexts[Math.floor(Math.random() * allTexts.length)];
        await Notifications.scheduleNotificationAsync({
          identifier: `${PREFIX}${triggerDate.getTime()}`,
          content: { title: 'Axis', body: text },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        });
        count++;
      }

      slot += intervalMin;
    }
  }
}

export async function cancelNudges(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}
