import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { useColors } from '../src/hooks/useColors';

export default function Index() {
  const { user, isLoading } = useAuthStore();
  const c = useColors();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background }}>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }

  if (!user) return <Redirect href="/auth" />;
  if (!user.onboarding_completed) return <Redirect href="/onboarding/intro" />;
  return <Redirect href="/(tabs)/home" />;
}
