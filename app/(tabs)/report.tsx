import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useRoutineStore } from '../../src/store/routineStore';
import { generateInsight } from '../../src/utils/report';

type Period = 'weekly' | 'monthly';

function RateBar({ rate }: { rate: number }) {
  return (
    <View style={barStyles.container}>
      <View style={[barStyles.fill, { width: `${Math.round(rate * 100)}%` }]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});

export default function ReportScreen() {
  const [period, setPeriod] = useState<Period>('weekly');
  const { routines, todayChecks } = useRoutineStore();
  const insight = generateInsight(routines, todayChecks, period);

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

        {/* Best / Worst */}
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

        {/* Patterns */}
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

        {/* Next action */}
        {insight.nextAction && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Suggestion</Text>
            <View style={styles.suggestionCard}>
              <Text style={styles.suggestionText}>{insight.nextAction}</Text>
            </View>
          </View>
        )}

        {/* Empty state */}
        {insight.patterns.length === 0 && !insight.nextAction && routines.filter(r => r.status === 'active').length > 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Keep checking in.</Text>
            <Text style={styles.emptyBody}>
              Patterns will appear here after a few days of tracking.
            </Text>
          </View>
        )}

        {/* All routines quick view */}
        {routines.filter(r => r.status === 'active').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>All routines</Text>
            {routines
              .filter((r) => r.status === 'active')
              .map((r) => (
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  row2: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardHalf: {
    flex: 1,
  },
  cardMeta: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  cardRate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cardEmpty: {
    ...typography.h3,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  patternCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  patternDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 7,
  },
  patternText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  suggestionCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  suggestionText: {
    ...typography.body,
    color: '#fff',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  routineRowName: {
    ...typography.body,
    color: colors.text,
  },
  routineRowChevron: {
    fontSize: 20,
    color: colors.muted,
  },
});
