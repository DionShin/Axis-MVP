import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useRoutineStore } from '../../src/store/routineStore';
import { useStrings } from '../../src/hooks/useStrings';
import { useAuthStore } from '../../src/store/authStore';
import { useRecoveryStore } from '../../src/store/recoveryStore';
import { recommendReducedRoutines } from '../../src/utils/recovery';

export default function RecoveryModal() {
  const c = useColors();
  const styles = makeStyles(c);
  const s = useStrings().recovery_modal;

  const { routines, checks, loadChecks } = useRoutineStore();
  const { user } = useAuthStore();
  const { enterReducedMode } = useRecoveryStore();

  const [step, setStep] = useState<'entry' | 'select'>('entry');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const activeRoutines = routines.filter((r) => r.status === 'active');

  // Load 30-day history for smarter recommendations
  useEffect(() => {
    if (!user) return;
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    loadChecks(user.id, start, end);
  }, [user?.id]);

  const handleGoToSelect = () => {
    const recommended = recommendReducedRoutines(routines, checks);
    setSelectedIds(recommended.map((r) => r.id));
    setStep('select');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    if (selectedIds.length === 0) return;
    enterReducedMode(selectedIds);
    router.back();
  };

  // ─── Step: Select routines ───────────────────────────────────────────────
  if (step === 'select') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => setStep('entry')}>
            <Text style={styles.backBtn}>‹ Back</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.h2}>{s.select_title}</Text>
          <Text style={styles.sub}>{s.select_sub}</Text>

          <View style={styles.list}>
            {activeRoutines.map((r) => {
              const selected = selectedIds.includes(r.id);
              return (
                <Pressable
                  key={r.id}
                  style={[styles.routineRow, selected && styles.routineRowSelected]}
                  onPress={() => toggleSelect(r.id)}
                >
                  <View style={[styles.checkbox, selected && styles.checkboxActive]}>
                    {selected && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.routineName, selected && styles.routineNameSelected]}>
                    {r.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.primaryBtn, selectedIds.length === 0 && styles.btnDisabled]}
            onPress={handleStart}
          >
            <Text style={styles.primaryBtnText}>{s.select_btn}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Step: Entry ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeBtn}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.entryContent}>
        <Text style={styles.emoji}>🌱</Text>
        <Text style={styles.h1}>{s.entry_title}</Text>
        <Text style={styles.bodyText}>{s.entry_body}</Text>

        <View style={styles.actions}>
          <Pressable style={styles.primaryBtn} onPress={handleGoToSelect}>
            <Text style={styles.primaryBtnText}>{s.entry_btn_reduced}</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryBtn}
            onPress={() => { router.back(); }}
          >
            <Text style={styles.secondaryBtnText}>{s.entry_btn_full}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, alignItems: 'flex-end' },
    backBtn: { ...typography.body, color: c.primary },
    closeBtn: { fontSize: 18, color: c.textSecondary, padding: spacing.xs },
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

    // Entry
    entryContent: {
      flex: 1, paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxl, alignItems: 'center',
    },
    emoji: { fontSize: 48, marginBottom: spacing.lg },
    h1: {
      ...typography.h2, color: c.text, textAlign: 'center',
      lineHeight: 36, marginBottom: spacing.md,
    },
    bodyText: {
      ...typography.body, color: c.textSecondary,
      textAlign: 'center', lineHeight: 22, marginBottom: spacing.xxl,
    },
    actions: { width: '100%', gap: spacing.sm },

    // Select
    h2: { ...typography.h3, color: c.text, marginTop: spacing.lg, marginBottom: spacing.xs },
    sub: { ...typography.body, color: c.textSecondary, marginBottom: spacing.lg },
    list: { gap: spacing.sm, marginBottom: spacing.xl },
    routineRow: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.md,
      backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    },
    routineRowSelected: { borderColor: c.primary },
    checkbox: {
      width: 24, height: 24, borderRadius: 4,
      borderWidth: 1.5, borderColor: c.textSecondary,
      alignItems: 'center', justifyContent: 'center',
    },
    checkboxActive: { backgroundColor: c.primary, borderColor: c.primary },
    checkMark: { color: c.background, fontSize: 13, fontWeight: '700' },
    routineName: { ...typography.body, color: c.text, flex: 1 },
    routineNameSelected: { color: c.primary, fontWeight: '600' },

    // Buttons
    primaryBtn: {
      backgroundColor: c.primary, borderRadius: radius.md,
      paddingVertical: spacing.md + 2, alignItems: 'center',
    },
    btnDisabled: { backgroundColor: c.muted },
    primaryBtnText: { ...typography.body, color: c.background, fontWeight: '600' },
    secondaryBtn: {
      borderRadius: radius.md, paddingVertical: spacing.md + 2,
      alignItems: 'center', borderWidth: 1, borderColor: c.border,
    },
    secondaryBtnText: { ...typography.body, color: c.text },
    ghostBtn: { paddingVertical: spacing.md, alignItems: 'center' },
    ghostBtnText: { ...typography.body, color: c.textSecondary },
  });
}
