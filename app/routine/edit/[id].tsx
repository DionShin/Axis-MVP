import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography, radius, AppColors } from '../../../src/theme';
import { useColors } from '../../../src/hooks/useColors';
import { useRoutineStore } from '../../../src/store/routineStore';
import { CategoryPicker } from '../../../src/components/CategoryPicker';

export default function RoutineEdit() {
  const c = useColors();
  const styles = makeStyles(c);
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
            placeholderTextColor={c.textSecondary}
          />

          <Text style={styles.label}>Category</Text>
          <CategoryPicker selected={category} onChange={setCategory} />
        </ScrollView>
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
    title: { ...typography.body, fontWeight: '600', color: c.text },
    cancel: { ...typography.body, color: c.textSecondary },
    save: { ...typography.body, color: c.primary, fontWeight: '600' },
    saveDisabled: { color: c.muted },
    scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
    label: {
      ...typography.caption, color: c.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginBottom: spacing.sm, marginTop: spacing.lg,
    },
    input: {
      borderWidth: 1, borderColor: c.border, borderRadius: radius.md,
      paddingVertical: spacing.md, paddingHorizontal: spacing.md,
      ...typography.body, color: c.text, backgroundColor: c.surface,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    notFound: { ...typography.body, color: c.textSecondary },
  });
}
