import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/authStore';
import { useRoutineStore } from '../src/store/routineStore';
import { fetchProfile } from '../src/lib/supabase/db';
import { toDateString } from '../src/lib/date';

export default function RootLayout() {
  const { setUser, setLoading } = useAuthStore();
  const { loadRoutines, loadTodayChecks } = useRoutineStore();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
        const today = toDateString(new Date());
        await Promise.all([
          loadRoutines(session.user.id),
          loadTodayChecks(session.user.id, today),
        ]);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
        const today = toDateString(new Date());
        await Promise.all([
          loadRoutines(session.user.id),
          loadTodayChecks(session.user.id, today),
        ]);
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
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal/add-routine" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal/recovery" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
