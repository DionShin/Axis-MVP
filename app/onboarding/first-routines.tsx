import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { DEFAULT_ROUTINES, MAX_ONBOARDING_ROUTINES } from '../../src/constants';

function getSortedRoutines(goalCategory: string | null) {
  if (!goalCategory) return DEFAULT_ROUTINES;
  return [
    ...DEFAULT_ROUTINES.filter((r) => r.category === goalCategory),
    ...DEFAULT_ROUTINES.filter((r) => r.category !== goalCategory),
  ];
}

function getSubtitle(mainDifficulty: string | null): string {
  if (mainDifficulty === 'starting') return 'Start simple — pick 1 or 2 you can do daily.';
  if (mainDifficulty === 'restarting') return 'Pick the easiest ones first. Small wins matter.';
  return 'Start with 1–3. You can always add more later.';
}

export default function OnboardingFirstRoutines() {
  const c = useColors();
  const styles = makeStyles(c);
  const { selectedRoutineNames, toggleRoutine, goalCategory, mainDifficulty } = useOnboardingStore();
  const [customInput, setCustomInput] = useState('');
  const canContinue = selectedRoutineNames.length > 0;
  const atMax = selectedRoutineNames.length >= MAX_ONBOARDING_ROUTINES;

  const sortedRoutines = getSortedRoutines(goalCategory);

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || atMax) return;
    toggleRoutine(trimmed);
    setCustomInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Pick your first routines.</Text>
        <Text style={styles.sub}>{getSubtitle(mainDifficulty)}</Text>
      </View>

      <View style={styles.list}>
        {sortedRoutines.map((r) => {
          const selected = selectedRoutineNames.includes(r.name);
          const disabled = atMax && !selected;
          return (
            <Pressable
              key={r.name}
              style={[styles.item, selected && styles.itemSelected, disabled && styles.itemDisabled]}
              onPress={() => !disabled && toggleRoutine(r.name)}
            >
              <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.itemText, selected && styles.itemTextSelected]}>{r.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.customRow}>
        <TextInput
          style={styles.input}
          placeholder="Add your own routine..."
          placeholderTextColor={c.textSecondary}
          value={customInput}
          onChangeText={setCustomInput}
          onSubmitEditing={handleAddCustom}
          returnKeyType="done"
          editable={!atMax}
        />
        <Pressable
          style={[styles.addBtn, (!customInput.trim() || atMax) && styles.addBtnDisabled]}
          onPress={handleAddCustom}
        >
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      {atMax && (
        <Text style={styles.maxNote}>3 routines max for now. You can add more after onboarding.</Text>
      )}

      <View style={{ flex: 1 }} />

      <Pressable
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        onPress={() => canContinue && router.push('/onboarding/reminder')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
    header: { marginTop: spacing.xl, marginBottom: spacing.lg },
    heading: { ...typography.h2, color: c.text, marginBottom: spacing.xs },
    sub: { ...typography.body, color: c.textSecondary },
    list: { gap: spacing.sm },
    item: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: spacing.md, paddingHorizontal: spacing.md,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
      backgroundColor: c.surface, gap: spacing.md,
    },
    itemSelected: { borderColor: c.primary, backgroundColor: c.primary },
    itemDisabled: { opacity: 0.4 },
    checkbox: {
      width: 22, height: 22, borderRadius: 11,
      borderWidth: 1.5, borderColor: c.textSecondary,
      alignItems: 'center', justifyContent: 'center',
    },
    checkboxSelected: { borderColor: c.background, backgroundColor: 'rgba(255,255,255,0.2)' },
    checkmark: { color: c.background, fontSize: 12, fontWeight: '700' },
    itemText: { ...typography.body, color: c.text },
    itemTextSelected: { color: c.background, fontWeight: '600' },
    customRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
    input: {
      flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: radius.md,
      paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
      ...typography.body, color: c.text, backgroundColor: c.surface,
    },
    addBtn: { backgroundColor: c.primary, paddingHorizontal: spacing.lg, borderRadius: radius.md, justifyContent: 'center' },
    addBtnDisabled: { backgroundColor: c.muted },
    addBtnText: { color: c.background, fontWeight: '600' },
    maxNote: { ...typography.caption, color: c.textSecondary, marginTop: spacing.sm },
    button: { backgroundColor: c.primary, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
    buttonDisabled: { backgroundColor: c.muted },
    buttonText: { ...typography.body, color: c.background, fontWeight: '600' },
  });
}
