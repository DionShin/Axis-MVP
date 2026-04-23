import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useRoutineStore } from '../../src/store/routineStore';
import { useStrings } from '../../src/hooks/useStrings';
import { useAuthStore } from '../../src/store/authStore';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { DEFAULT_ROUTINES } from '../../src/constants';
import { CategoryPicker } from '../../src/components/CategoryPicker';
import { useLanguageStore } from '../../src/store/languageStore';
import { Language } from '../../src/i18n/strings';

function getSuggestions(
  currentCategory: string,
  goalCategory: string | null,
  existingNames: string[],
  language: Language
): string[] {
  const available = DEFAULT_ROUTINES.filter(
    (r) => !existingNames.includes(r.name) && !existingNames.includes(r.name_ko)
  );

  const currentMatch = available.filter((r) => r.category === currentCategory);
  const goalMatch    = available.filter((r) => r.category === goalCategory && r.category !== currentCategory);
  const rest         = available.filter((r) => r.category !== currentCategory && r.category !== goalCategory);

  return [...currentMatch, ...goalMatch, ...rest].map((r) =>
    language === 'ko' ? r.name_ko : r.name
  );
}

export default function AddRoutineModal() {
  const c = useColors();
  const styles = makeStyles(c);
  const s = useStrings().add_routine;
  const { addRoutine, routines } = useRoutineStore();
  const { user } = useAuthStore();
  const { goalCategory } = useOnboardingStore();
  const { language } = useLanguageStore();
  const existingNames = routines.map((r) => r.name);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('life_habits');

  const suggestions = getSuggestions(category, goalCategory, existingNames, language);

  const MAX_NAME_LENGTH = 50;

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed || !user) return;
    if (trimmed.length > MAX_NAME_LENGTH) return;
    addRoutine(user.id, trimmed, category);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{s.title}</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.closeBtn}>✕</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.label}>{s.label_name}</Text>
          <TextInput
            style={styles.input}
            placeholder={s.placeholder}
            placeholderTextColor={c.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
            maxLength={50}
          />

          <Text style={styles.label}>{s.label_suggestions}</Text>
          <View style={styles.suggestions}>
            {suggestions.map((s) => (
              <Pressable
                key={s}
                style={[styles.chip, name === s && styles.chipSelected]}
                onPress={() => setName(s)}
              >
                <Text style={[styles.chipText, name === s && styles.chipTextSelected]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>{s.label_category}</Text>
          <CategoryPicker selected={category} onChange={setCategory} />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={[styles.button, !name.trim() && styles.buttonDisabled]} onPress={handleAdd}>
            <Text style={styles.buttonText}>{s.btn_add}</Text>
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
