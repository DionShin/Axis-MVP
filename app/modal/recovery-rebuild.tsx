import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useRoutineStore } from '../../src/store/routineStore';
import { useStrings } from '../../src/hooks/useStrings';
import { useAuthStore } from '../../src/store/authStore';
import { useRecoveryStore } from '../../src/store/recoveryStore';
import { getRebuildCandidates } from '../../src/utils/recovery';

export default function RecoveryRebuildModal() {
  const c = useColors();
  const styles = makeStyles(c);
  const s = useStrings().rebuild_modal;

  const { routines, checks, loadChecks } = useRoutineStore();
  const { user } = useAuthStore();
  const { reducedRoutineIds, addToReduced, exitReducedMode } = useRecoveryStore();

  useEffect(() => {
    if (!user) return;
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    loadChecks(user.id, start, end);
  }, [user?.id]);

  const candidates = getRebuildCandidates(routines, checks, reducedRoutineIds);

  const handleAdd = (id: string) => {
    addToReduced(id);
    router.back();
  };

  const handleExitReduced = () => {
    exitReducedMode();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeBtn}>✕</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={styles.h1}>{s.title}</Text>
        <Text style={styles.body}>{s.body}</Text>

        {candidates.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>{s.candidates_label}</Text>
            <View style={styles.list}>
              {candidates.map((r) => (
                <Pressable
                  key={r.id}
                  style={styles.candidateRow}
                  onPress={() => handleAdd(r.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.candidateName}>{r.name}</Text>
                    <Text style={styles.candidateSub}>{r.category.replace('_', ' ')}</Text>
                  </View>
                  <Text style={styles.addText}>{s.add_btn}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.allBack}>
            <Text style={styles.allBackText}>{s.all_active}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <Pressable style={styles.secondaryBtn} onPress={handleExitReduced}>
          <Text style={styles.secondaryBtnText}>{s.exit_btn}</Text>
        </Pressable>

        <Pressable style={styles.ghostBtn} onPress={() => router.back()}>
          <Text style={styles.ghostBtnText}>{s.stay_btn}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, alignItems: 'flex-end' },
    closeBtn: { fontSize: 18, color: c.textSecondary, padding: spacing.xs },
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

    emoji: { fontSize: 48, marginBottom: spacing.lg, marginTop: spacing.lg },
    h1: {
      ...typography.h2, color: c.text, lineHeight: 36, marginBottom: spacing.md,
    },
    body: {
      ...typography.body, color: c.textSecondary, lineHeight: 22, marginBottom: spacing.xl,
    },
    sectionLabel: {
      ...typography.caption, color: c.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginBottom: spacing.sm,
    },
    list: { gap: spacing.sm, marginBottom: spacing.xl },
    candidateRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    },
    candidateName: { ...typography.body, color: c.text, fontWeight: '500' },
    candidateSub: { ...typography.caption, color: c.textSecondary, marginTop: 2 },
    addText: { ...typography.body, color: c.primary, fontWeight: '600' },

    allBack: { alignItems: 'center', paddingVertical: spacing.xl },
    allBackText: { ...typography.body, color: c.textSecondary, textAlign: 'center' },

    divider: { height: 1, backgroundColor: c.border, marginVertical: spacing.lg },

    secondaryBtn: {
      borderRadius: radius.md, paddingVertical: spacing.md + 2,
      alignItems: 'center', borderWidth: 1, borderColor: c.border,
      marginBottom: spacing.sm,
    },
    secondaryBtnText: { ...typography.body, color: c.text },
    ghostBtn: { paddingVertical: spacing.md, alignItems: 'center' },
    ghostBtnText: { ...typography.body, color: c.textSecondary },
  });
}
