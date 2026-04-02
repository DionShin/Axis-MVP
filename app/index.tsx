import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { colors } from '../src/theme';

export default function Index() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  if (!user.onboarding_completed) {
    return <Redirect href="/onboarding/intro" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
