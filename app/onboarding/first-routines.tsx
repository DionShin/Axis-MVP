import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { DEFAULT_ROUTINES, MAX_ONBOARDING_ROUTINES } from '../../src/constants';

export default function OnboardingFirstRoutines() {
  const { selectedRoutineNames, toggleRoutine } = useOnboardingStore();
  const [customInput, setCustomInput] = useState('');
  const canContinue = selectedRoutineNames.length > 0;
  const atMax = selectedRoutineNames.length >= MAX_ONBOARDING_ROUTINES;

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
        <Text style={styles.sub}>Start with 1–3. You can always add more later.</Text>
      </View>

      <View style={styles.list}>
        {DEFAULT_ROUTINES.map((r) => {
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
          placeholderTextColor={colors.textSecondary}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sub: {
    ...typography.body,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  itemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  itemDisabled: {
    opacity: 0.4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  itemText: {
    ...typography.body,
    color: colors.text,
  },
  itemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  customRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: colors.muted,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  maxNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.muted,
  },
  buttonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600',
  },
});
