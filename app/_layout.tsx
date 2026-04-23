import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useThemeStore } from '../src/store/themeStore';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/authStore';
import { useRoutineStore } from '../src/store/routineStore';
import { fetchProfile } from '../src/lib/supabase/db';
import { toDateString } from '../src/lib/date';
import { daysSinceLastCheck } from '../src/utils/report';
import { scheduleRecoveryNotification } from '../src/lib/notifications/recovery';
import { RECOVERY_TRIGGER_DAYS } from '../src/constants';
import { useLanguageStore } from '../src/store/languageStore';
import { strings } from '../src/i18n/strings';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

function ninetyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return toDateString(d);
}

async function loadUserData(
  userId: string,
  loaders: {
    loadRoutines: (id: string) => Promise<void>;
    loadTodayChecks: (id: string, today: string) => Promise<void>;
    loadChecks: (id: string, start: string, end: string) => Promise<void>;
  }
) {
  const today = toDateString(new Date());
  await Promise.all([
    loaders.loadRoutines(userId),
    loaders.loadTodayChecks(userId, today),
    loaders.loadChecks(userId, ninetyDaysAgo(), today),
  ]);

  // Recovery notification: schedule if inactive ≥ RECOVERY_TRIGGER_DAYS
  const { checks } = useRoutineStore.getState();
  const days = daysSinceLastCheck(checks);
  const lang = useLanguageStore.getState().language;
  const recoveryBody = strings[lang].recovery_modal.entry_body.replace('\n', ' ');
  await scheduleRecoveryNotification(days, RECOVERY_TRIGGER_DAYS, recoveryBody);
}

export default function RootLayout() {
  const { setUser, setLoading } = useAuthStore();
  const { darkMode } = useThemeStore();
  const { loadRoutines, loadTodayChecks, loadChecks } = useRoutineStore();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
        await loadUserData(session.user.id, { loadRoutines, loadTodayChecks, loadChecks });
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
        await loadUserData(session.user.id, { loadRoutines, loadTodayChecks, loadChecks });
        if (event === 'SIGNED_IN') {
          const onboardingDone = profile?.onboarding_completed ?? false;
          router.replace(onboardingDone ? '/(tabs)/home' : '/onboarding/intro');
        }
      } else {
        setUser(null);
        if (event === 'SIGNED_OUT') {
          router.replace('/auth');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ErrorBoundary>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding/intro" />
        <Stack.Screen name="onboarding/goals" />
        <Stack.Screen name="onboarding/first-routines" />
        <Stack.Screen name="onboarding/reminder" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="routine/[id]" />
        <Stack.Screen name="routine/edit/[id]" />
        <Stack.Screen name="modal/add-routine" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal/recovery" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal/recovery-rebuild" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal/nudges" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal/share-pathway" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal/privacy" options={{ presentation: 'modal' }} />
      </Stack>
    </ErrorBoundary>
  );
}
