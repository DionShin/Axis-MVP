import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ShareData, ShareTemplate } from '../share.types';
import { useStrings } from '../../../hooks/useStrings';

const CARD_WIDTH = Dimensions.get('window').width - 48;
const CARD_HEIGHT = Math.round(CARD_WIDTH * (16 / 9));

// Fixed card colors — not theme-dependent (share cards are always light)
const CARD_COLORS = {
  monthly:   { bg: '#F7F6F2', accent: '#1a1a1a', sub: '#888880' },
  recovery:  { bg: '#F7F4F0', accent: '#2d2520', sub: '#8A7F78' },
  milestone: { bg: '#F2F4F7', accent: '#1a2030', sub: '#788090' },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function RateBar({ rate, color }: { rate: number; color: string }) {
  return (
    <View style={bar.track}>
      <View style={[bar.fill, { width: `${Math.round(rate * 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

const bar = StyleSheet.create({
  track: { height: 3, backgroundColor: '#E0E0DA', borderRadius: 2, overflow: 'hidden', marginTop: 6 },
  fill: { height: '100%', borderRadius: 2 },
});

// ─── Template 1: Monthly Summary ─────────────────────────────────────────────

function MonthlyCard({ data }: { data: ShareData }) {
  const sc = useStrings().share_card;
  const { bg, accent, sub } = CARD_COLORS.monthly;
  const rate = Math.round(data.monthCompletionRate * 100);
  const tagline = data.monthCompletionRate >= 0.7
    ? sc.monthly_tagline_high
    : data.continuedRoutineCount > 0
    ? sc.monthly_tagline_mid
    : sc.monthly_tagline_low;

  return (
    <View style={[s.card, { backgroundColor: bg, width: CARD_WIDTH, height: CARD_HEIGHT }]}>
      <View style={s.inner}>
        {/* Eyebrow */}
        <Text style={[s.eyebrow, { color: sub }]}>{data.currentMonthLabel}</Text>

        {/* Headline */}
        <Text style={[s.headline, { color: accent }]}>{sc.monthly_headline}</Text>

        {/* Divider */}
        <View style={[s.divider, { backgroundColor: accent, opacity: 0.12 }]} />

        {/* Stats */}
        <View style={s.statsBlock}>
          <View style={s.statRow}>
            <Text style={[s.statLabel, { color: sub }]}>{sc.monthly_stat_rate}</Text>
            <Text style={[s.statValue, { color: accent }]}>{rate}%</Text>
          </View>
          <RateBar rate={data.monthCompletionRate} color={accent} />

          {data.topRoutineName && (
            <View style={[s.statRow, { marginTop: 20 }]}>
              <Text style={[s.statLabel, { color: sub }]}>{sc.monthly_stat_top}</Text>
              <Text style={[s.statValue, { color: accent }]} numberOfLines={1}>
                {data.topRoutineName}
              </Text>
            </View>
          )}

          <View style={[s.statRow, { marginTop: 16 }]}>
            <Text style={[s.statLabel, { color: sub }]}>{sc.monthly_stat_continued}</Text>
            <Text style={[s.statValue, { color: accent }]}>{data.continuedRoutineCount}{sc.monthly_count_suffix}</Text>
          </View>

          {data.restartCount > 0 && (
            <View style={[s.statRow, { marginTop: 16 }]}>
              <Text style={[s.statLabel, { color: sub }]}>{sc.monthly_stat_restarts}</Text>
              <Text style={[s.statValue, { color: accent }]}>{data.restartCount}{sc.monthly_count_suffix}</Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }} />

        {/* Tagline */}
        <Text style={[s.tagline, { color: sub }]}>{tagline}</Text>

        {/* Branding */}
        <View style={s.footer}>
          <View style={[s.footerDot, { backgroundColor: accent }]} />
          <Text style={[s.footerText, { color: sub }]}>Axis</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Template 2: Recovery Comeback ───────────────────────────────────────────

function RecoveryCard({ data }: { data: ShareData }) {
  const sc = useStrings().share_card;
  const { bg, accent, sub } = CARD_COLORS.recovery;

  return (
    <View style={[s.card, { backgroundColor: bg, width: CARD_WIDTH, height: CARD_HEIGHT }]}>
      <View style={s.inner}>
        {/* Eyebrow */}
        <Text style={[s.eyebrow, { color: sub }]}>{sc.recovery_eyebrow}</Text>

        {/* Headline */}
        <Text style={[s.headline, { color: accent }]}>{sc.recovery_headline}</Text>

        <View style={[s.divider, { backgroundColor: accent, opacity: 0.12 }]} />

        {/* Gap block */}
        {data.hasComeback ? (
          <View style={s.recoveryBlock}>
            <View style={s.gapDisplay}>
              <Text style={[s.gapNumber, { color: accent }]}>{data.inactivityGapDays}</Text>
              <Text style={[s.gapUnit, { color: sub }]}>{sc.recovery_gap_unit}</Text>
            </View>
            <Text style={[s.recoveryDate, { color: sub }]}>
              {sc.recovery_since_pre}{data.comebackDateLabel}{sc.recovery_since_suf}
            </Text>
          </View>
        ) : (
          <View style={s.recoveryBlock}>
            <Text style={[s.recoveryNone, { color: sub }]}>{sc.recovery_none}</Text>
          </View>
        )}

        {data.activeRoutineCount > 0 && (
          <View style={[s.statRow, { marginTop: 28 }]}>
            <Text style={[s.statLabel, { color: sub }]}>{sc.recovery_stat_active}</Text>
            <Text style={[s.statValue, { color: accent }]}>{data.activeRoutineCount}{sc.monthly_count_suffix}</Text>
          </View>
        )}

        <View style={{ flex: 1 }} />

        <Text style={[s.tagline, { color: sub }]}>{sc.recovery_tagline}</Text>

        <View style={s.footer}>
          <View style={[s.footerDot, { backgroundColor: accent }]} />
          <Text style={[s.footerText, { color: sub }]}>Axis</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Template 3: Milestone ────────────────────────────────────────────────────

function MilestoneCard({ data }: { data: ShareData }) {
  const sc = useStrings().share_card;
  const { bg, accent, sub } = CARD_COLORS.milestone;
  const tagline = data.milestoneDays >= 30
    ? sc.milestone_tagline_30
    : data.milestoneDays >= 14
    ? sc.milestone_tagline_14
    : sc.milestone_tagline_7;

  const routineName = data.milestoneRoutineName ?? sc.milestone_fallback_name;

  return (
    <View style={[s.card, { backgroundColor: bg, width: CARD_WIDTH, height: CARD_HEIGHT }]}>
      <View style={s.inner}>
        {/* Eyebrow */}
        <Text style={[s.eyebrow, { color: sub }]}>{sc.milestone_eyebrow}</Text>

        {/* Routine name */}
        <Text style={[s.headline, { color: accent }]} numberOfLines={2}>
          {routineName}
        </Text>

        <View style={[s.divider, { backgroundColor: accent, opacity: 0.12 }]} />

        {/* Big number */}
        <View style={s.milestoneBlock}>
          <Text style={[s.milestoneNumber, { color: accent }]}>
            {data.milestoneDays}
          </Text>
          <Text style={[s.milestoneSub, { color: sub }]}>{sc.milestone_streak_suffix}</Text>
        </View>

        <Text style={[s.milestoneCaption, { color: sub }]}>{sc.milestone_caption}</Text>

        <View style={{ flex: 1 }} />

        <Text style={[s.tagline, { color: sub }]}>{tagline}</Text>

        <View style={s.footer}>
          <View style={[s.footerDot, { backgroundColor: accent }]} />
          <Text style={[s.footerText, { color: sub }]}>Axis</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────

interface ShareCardProps {
  template: ShareTemplate;
  data: ShareData;
}

export function ShareCard({ template, data }: ShareCardProps) {
  if (template === 'monthly')   return <MonthlyCard data={data} />;
  if (template === 'recovery')  return <RecoveryCard data={data} />;
  return <MilestoneCard data={data} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  inner: {
    flex: 1,
    padding: 36,
    paddingBottom: 32,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  divider: {
    height: 1,
    marginVertical: 28,
  },

  statsBlock: {},
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // Recovery
  recoveryBlock: { marginTop: 4 },
  gapDisplay: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 10 },
  gapNumber: { fontSize: 52, fontWeight: '700', letterSpacing: -2 },
  gapUnit: { fontSize: 18, fontWeight: '400', letterSpacing: -0.2 },
  recoveryDate: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  recoveryNone: { fontSize: 16, fontWeight: '400', lineHeight: 22 },

  // Milestone
  milestoneBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  milestoneNumber: {
    fontSize: 72,
    fontWeight: '700',
    letterSpacing: -3,
    lineHeight: 80,
  },
  milestoneSub: {
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: -0.4,
  },
  milestoneCaption: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 10,
    letterSpacing: 0.2,
  },

  tagline: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.1,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
