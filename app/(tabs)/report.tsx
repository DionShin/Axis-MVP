import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useRoutineStore } from '../../src/store/routineStore';
import { generateInsight } from '../../src/utils/report';

type Period = 'weekly' | 'monthly';

function RateBar({ rate }: { rate: number }) {
  const c = useColors();
  return (
    <View style={{ height: 6, backgroundColor: c.border, borderRadius: 3, overflow: 'hidden', marginTop: spacing.xs }}>
      <View style={{ width: `${Math.round(rate * 100)}%`, height: '100%', backgroundColor: c.primary, borderRadius: 3 }} />
    </View>
  );
}

export default function ReportScreen() {
  const c = useColors();
  const styles = makeStyles(c);

  const [period, setPeriod] = useState<Period>('weekly');
  const { routines, checks } = useRoutineStore();
  const insight = generateInsight(routines, checks, period);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Report</Text>
        <View style={styles.toggle}>
          {(['weekly', 'monthly'] as Period[]).map((p) => (
            <Pressable
              key={p}
              style={[styles.toggleBtn, period === p && styles.toggleBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.toggleText, period === p && styles.toggleTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.row2}>
          <View style={[styles.card, styles.cardHalf]}>
            <Text style={styles.cardMeta}>Best this {period === 'weekly' ? 'week' : 'month'}</Text>
            {insight.bestRoutine ? (
              <>
                <Text style={styles.cardName} numberOfLines={2}>{insight.bestRoutine.name}</Text>
                <RateBar rate={insight.bestRate} />
                <Text style={styles.cardRate}>{Math.round(insight.bestRate * 100)}%</Text>
              </>
            ) : (
              <Text style={styles.cardEmpty}>—</Text>
            )}
          </View>

          <View style={[styles.card, styles.cardHalf]}>
            <Text style={styles.cardMeta}>Needs attention</Text>
            {insight.worstRoutine ? (
              <>
                <Text style={styles.cardName} numberOfLines={2}>{insight.worstRoutine.name}</Text>
                <RateBar rate={insight.worstRate} />
                <Text style={styles.cardRate}>{Math.round(insight.worstRate * 100)}%</Text>
              </>
            ) : (
              <Text style={styles.cardEmpty}>All good</Text>
            )}
          </View>
        </View>

        {insight.patterns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Patterns</Text>
            {insight.patterns.map((pattern, i) => (
              <View key={i} style={styles.patternCard}>
                <View style={styles.patternDot} />
                <Text style={styles.patternText}>{pattern}</Text>
              </View>
            ))}
          </View>
        )}

        {insight.nextAction && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Suggestion</Text>
            <View style={styles.suggestionCard}>
              <Text style={styles.suggestionText}>{insight.nextAction}</Text>
            </View>
          </View>
        )}

        {insight.patterns.length === 0 && !insight.nextAction && routines.filter(r => r.status === 'active').length > 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Keep checking in.</Text>
            <Text style={styles.emptyBody}>Patterns will appear here after a few days of tracking.</Text>
          </View>
        )}

        {routines.filter(r => r.status === 'active').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>All routines</Text>
            {routines.filter((r) => r.status === 'active').map((r) => (
              <Pressable
                key={r.id}
                style={styles.routineRow}
                onPress={() => router.push(`/routine/${r.id}`)}
              >
                <Text style={styles.routineRowName}>{r.name}</Text>
                <Text style={styles.routineRowChevron}>›</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md,
    },
    title: { ...typography.h2, color: c.text },
    toggle: {
      flexDirection: 'row', backgroundColor: c.surface,
      borderRadius: radius.sm, borderWidth: 1, borderColor: c.border, overflow: 'hidden',
    },
    toggleBtn: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
    toggleBtnActive: { backgroundColor: c.primary },
    toggleText: { ...typography.caption, color: c.textSecondary },
    toggleTextActive: { color: c.background, fontWeight: '600' },
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
    row2: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    card: {
      backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, padding: spacing.md,
    },
    cardHalf: { flex: 1 },
    cardMeta: { ...typography.small, color: c.textSecondary, marginBottom: spacing.sm },
    cardName: { ...typography.body, color: c.text, fontWeight: '600', marginBottom: spacing.xs },
    cardRate: { ...typography.caption, color: c.textSecondary, marginTop: spacing.xs },
    cardEmpty: { ...typography.h3, color: c.muted, marginTop: spacing.sm },
    section: { marginBottom: spacing.xl },
    sectionLabel: {
      ...typography.caption, color: c.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.md,
    },
    patternCard: {
      flexDirection: 'row', alignItems: 'flex-start',
      backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border, padding: spacing.md,
      marginBottom: spacing.sm, gap: spacing.sm,
    },
    patternDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.primary, marginTop: 7 },
    patternText: { ...typography.body, color: c.text, flex: 1, lineHeight: 22 },
    suggestionCard: { backgroundColor: c.primary, borderRadius: radius.md, padding: spacing.md },
    suggestionText: { ...typography.body, color: c.background, lineHeight: 22 },
    emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
    emptyTitle: { ...typography.h3, color: c.text, marginBottom: spacing.xs },
    emptyBody: { ...typography.body, color: c.textSecondary, textAlign: 'center', lineHeight: 22 },
    routineRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      paddingVertical: spacing.md, paddingHorizontal: spacing.md, marginBottom: spacing.sm,
    },
    routineRowName: { ...typography.body, color: c.text },
    routineRowChevron: { fontSize: 20, color: c.muted },
  });
}
