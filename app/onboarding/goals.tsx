import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { GoalCategory, MainDifficulty } from '../../src/types';

const GOAL_OPTIONS: { label: string; value: GoalCategory }[] = [
  { label: 'Exercise', value: 'exercise' },
  { label: 'Study', value: 'study' },
  { label: 'Productivity', value: 'productivity' },
  { label: 'Life habits', value: 'life_habits' },
  { label: 'Self-improvement', value: 'self_improvement' },
];

const DIFFICULTY_OPTIONS: { label: string; value: MainDifficulty }[] = [
  { label: 'Getting started', value: 'starting' },
  { label: 'Staying consistent', value: 'consistency' },
  { label: 'Restarting after failure', value: 'restarting' },
];

export default function OnboardingGoals() {
  const c = useColors();
  const styles = makeStyles(c);
  const { goalCategory, mainDifficulty, setGoalCategory, setMainDifficulty } = useOnboardingStore();
  const canContinue = goalCategory !== null && mainDifficulty !== null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>What's your main focus?</Text>
        <View style={styles.optionsGroup}>
          {GOAL_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.option, goalCategory === opt.value && styles.optionSelected]}
              onPress={() => setGoalCategory(opt.value)}
            >
              <Text style={[styles.optionText, goalCategory === opt.value && styles.optionTextSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.heading, { marginTop: spacing.xl }]}>What's hardest for you?</Text>
        <View style={styles.optionsGroup}>
          {DIFFICULTY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.option, mainDifficulty === opt.value && styles.optionSelected]}
              onPress={() => setMainDifficulty(opt.value)}
            >
              <Text style={[styles.optionText, mainDifficulty === opt.value && styles.optionTextSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        onPress={() => canContinue && router.push('/onboarding/first-routines')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
    scroll: { paddingTop: spacing.xl, paddingBottom: spacing.lg },
    heading: { ...typography.h2, color: c.text, marginBottom: spacing.md },
    optionsGroup: { gap: spacing.sm },
    option: {
      paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface,
    },
    optionSelected: { borderColor: c.primary, backgroundColor: c.primary },
    optionText: { ...typography.body, color: c.text },
    optionTextSelected: { color: c.background, fontWeight: '600' },
    button: { backgroundColor: c.primary, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.md },
    buttonDisabled: { backgroundColor: c.muted },
    buttonText: { ...typography.body, color: c.background, fontWeight: '600' },
  });
}
