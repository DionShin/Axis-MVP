import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';

const SLIDES = [
  { title: 'One minute\neach night.', body: 'Check your routines without complicated logging.\nSimple. Fast. Done.' },
  { title: 'See how\nyou have lived.', body: 'View the history of routines you kept, dropped,\nand restarted over time.' },
  { title: 'Failure is\njust data.', body: 'No streak guilt. No pressure.\nEvery restart is a new data point.' },
];

export default function OnboardingIntro() {
  const c = useColors();
  const styles = makeStyles(c);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>
      <Pressable style={styles.button} onPress={() => isLast ? router.push('/onboarding/goals') : setIndex(index + 1)}>
        <Text style={styles.buttonText}>{isLast ? 'Get started' : 'Next'}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
    dotsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.muted },
    dotActive: { backgroundColor: c.primary, width: 20 },
    content: { flex: 1, justifyContent: 'center' },
    title: { ...typography.h1, color: c.text, lineHeight: 38, marginBottom: spacing.lg },
    body: { ...typography.body, color: c.textSecondary, lineHeight: 24 },
    button: { backgroundColor: c.primary, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
    buttonText: { ...typography.body, color: c.background, fontWeight: '600' },
  });
}
