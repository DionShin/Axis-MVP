import { View, Text, StyleSheet } from 'react-native';

export default function OnboardingGoals() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding - Goals</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600' },
});
