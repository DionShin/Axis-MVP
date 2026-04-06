import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useRoutineStore } from '../../src/store/routineStore';
import { useAuthStore } from '../../src/store/authStore';
import { DEFAULT_ROUTINES } from '../../src/constants';
import { CategoryPicker } from '../../src/components/CategoryPicker';

export default function AddRoutineModal() {
  const c = useColors();
  const styles = makeStyles(c);
  const { addRoutine } = useRoutineStore();
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('life_habits');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed || !user) return;
    addRoutine(user.id, trimmed, category);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>New routine</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.closeBtn}>✕</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Read 10 minutes"
            placeholderTextColor={c.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
          />

          <Text style={styles.label}>Suggestions</Text>
          <View style={styles.suggestions}>
            {DEFAULT_ROUTINES.map((r) => (
              <Pressable
                key={r.name}
                style={[styles.chip, name === r.name && styles.chipSelected]}
                onPress={() => setName(r.name)}
              >
                <Text style={[styles.chipText, name === r.name && styles.chipTextSelected]}>{r.name}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Category</Text>
          <CategoryPicker selected={category} onChange={setCategory} />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={[styles.button, !name.trim() && styles.buttonDisabled]} onPress={handleAdd}>
            <Text style={styles.buttonText}>Add routine</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md,
      borderBottomWidth: 1, borderBottomColor: c.border,
    },
    title: { ...typography.h3, color: c.text },
    closeBtn: { fontSize: 18, color: c.textSecondary, padding: spacing.xs },
    scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl },
    label: {
      ...typography.caption, color: c.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginBottom: spacing.sm, marginTop: spacing.md,
    },
    input: {
      borderWidth: 1, borderColor: c.border, borderRadius: radius.md,
      paddingVertical: spacing.md, paddingHorizontal: spacing.md,
      ...typography.body, color: c.text, backgroundColor: c.surface,
    },
    suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    chip: {
      paddingVertical: spacing.xs, paddingHorizontal: spacing.md,
      borderRadius: radius.xl, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface,
    },
    chipSelected: { borderColor: c.primary, backgroundColor: c.primary },
    chipText: { ...typography.caption, color: c.text },
    chipTextSelected: { color: c.background, fontWeight: '600' },
    footer: {
      paddingHorizontal: spacing.xl, paddingBottom: spacing.xl,
      paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: c.border,
    },
    button: { backgroundColor: c.primary, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
    buttonDisabled: { backgroundColor: c.muted },
    buttonText: { ...typography.body, color: c.background, fontWeight: '600' },
  });
}
