import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography, radius, AppColors } from '../../../theme';
import { PathwayEvent, PathwayEventType } from './pathway.types';
import { useStrings } from '../../../hooks/useStrings';

const NODE_CONFIG: Record<PathwayEventType, { color: string; icon: string }> = {
  routine_added:        { color: '#6366f1', icon: '＋' },
  routine_stopped:      { color: '#9ca3af', icon: '■' },
  routine_restarted:    { color: '#3b82f6', icon: '↺' },
  continuity_milestone: { color: '#f59e0b', icon: '★' },
  inactivity_gap:       { color: '#f87171', icon: '···' },
  recovery_started:     { color: '#34d399', icon: '🌱' },
};

function PathwayNode({ event, isLast, c }: { event: PathwayEvent; isLast: boolean; c: AppColors }) {
  const { color, icon } = NODE_CONFIG[event.type];

  return (
    <View style={styles.nodeRow}>
      {/* Left: line + dot */}
      <View style={styles.lineCol}>
        <View style={[styles.dot, { backgroundColor: color }]}>
          <Text style={styles.dotIcon}>{icon}</Text>
        </View>
        {!isLast && <View style={[styles.line, { backgroundColor: c.border }]} />}
      </View>

      {/* Right: content */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.cardTitle, { color: c.text }]}>{event.title}</Text>
        {event.subtitle && (
          <Text style={[styles.cardSub, { color: c.textSecondary }]}>{event.subtitle}</Text>
        )}
      </View>
    </View>
  );
}

export function PathwayTimeline({ events, c }: { events: PathwayEvent[]; c: AppColors }) {
  const pw = useStrings().pathway;

  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyTitle, { color: c.text }]}>{pw.empty_title}</Text>
        <Text style={[styles.emptySub, { color: c.textSecondary }]}>{pw.empty_sub}</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={[styles.intro, { color: c.textSecondary }]}>{pw.intro}</Text>
      {events.map((event, index) => (
        <PathwayNode
          key={event.id}
          event={event}
          isLast={index === events.length - 1}
          c={c}
        />
      ))}
    </View>
  );
}

const DOT_SIZE = 28;
const LINE_WIDTH = 2;

const styles = StyleSheet.create({
  intro: {
    ...typography.caption,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  lineCol: {
    width: DOT_SIZE + spacing.md,
    alignItems: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dotIcon: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  line: {
    width: LINE_WIDTH,
    flex: 1,
    minHeight: spacing.xl,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginLeft: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '500',
  },
  cardSub: {
    ...typography.caption,
    marginTop: 3,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  emptySub: {
    ...typography.body,
    textAlign: 'center',
  },
});
