import { Tabs } from 'expo-router';
import { useColors } from '../../src/hooks/useColors';
import { useStrings } from '../../src/hooks/useStrings';

export default function TabLayout() {
  const c = useColors();
  const s = useStrings();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.background,
          borderTopColor: c.border,
        },
        tabBarActiveTintColor: c.text,
        tabBarInactiveTintColor: c.textSecondary,
      }}
    >
      <Tabs.Screen name="home"     options={{ title: s.home.title }} />
      <Tabs.Screen name="history"  options={{ title: s.history.title }} />
      <Tabs.Screen name="report"   options={{ title: s.report.title }} />
      <Tabs.Screen name="settings" options={{ title: s.settings.title }} />
    </Tabs>
  );
}
