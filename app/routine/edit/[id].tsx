import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../../../src/theme';
import { useRoutineStore } from '../../../src/store/routineStore';

const CATEGORIES = ['exercise', 'study', 'productivity', 'life_habits', 'self_improvement'];
const CATEGORY_LABELS: Record<string, string> = {
  exercise: 'Exercise',
  study: 'Study',
  productivity: 'Productivity',
  life_habits: 'Life habits',
  self_improvement: 'Self-improvement',
};

export default function RoutineEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines, updateRoutine } = useRoutineStore();
  const routine = routines.find((r) => r.id === id);

  const [name, setName] = useState(routine?.name ?? '');
  const [category, setCategory] = useState(routine?.category ?? 'life_habits');

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>
        <View style={styles.center}>
          <Text style={styles.notFound}>Routine not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    updateRoutine(id, { name: trimmed, category });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>Edit routine</Text>
          <Pressable onPress={handleSave}>
            <Text style={[styles.save, !name.trim() && styles.saveDisabled]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryList}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.categoryItem, category === cat && styles.categoryItemSelected]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryText, category === cat && styles.categoryTextSelected]}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  cancel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  save: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  saveDisabled: {
    color: colors.muted,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  categoryList: {
    gap: spacing.sm,
  },
  categoryItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  categoryText: {
    ...typography.body,
    color: colors.text,
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
