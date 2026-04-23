import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Switch, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useNudgeStore } from '../../src/store/nudgeStore';
import { NUDGE_LIBRARY, NUDGE_CATEGORY_LABELS, NUDGE_CATEGORY_LABELS_KO } from '../../src/constants/nudges';
import { scheduleNudges, cancelNudges } from '../../src/lib/notifications/nudges';
import { requestNotificationPermission } from '../../src/lib/notifications';
import { useStrings } from '../../src/hooks/useStrings';
import { useLanguageStore } from '../../src/store/languageStore';

const START_OPTIONS = ['06:00', '07:00', '08:00', '09:00', '10:00'];
const END_OPTIONS   = ['19:00', '20:00', '21:00', '22:00', '23:00'];
const INTERVAL_OPTIONS = [1, 2, 3];

function hourLabel(time: string): string {
  const h = parseInt(time.split(':')[0], 10);
  const period = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${period}`;
}

export default function NudgesModal() {
  const c = useColors();
  const styles = makeStyles(c);
  const s = useStrings().nudges_modal;
  const { language } = useLanguageStore();
  const catLabels = language === 'en' ? NUDGE_CATEGORY_LABELS : NUDGE_CATEGORY_LABELS_KO;

  const {
    enabled, intervalHours, activeStart, activeEnd,
    selectedIds, customNudges,
    setEnabled, setIntervalHours, setActiveStart, setActiveEnd,
    toggleNudge, addCustomNudge, removeCustomNudge,
  } = useNudgeStore();

  const [draft, setDraft] = useState('');

  const reschedule = async (overrides?: Partial<{
    en: boolean; interval: number; start: string; end: string;
    ids: string[]; custom: string[];
  }>) => {
    const en       = overrides?.en       ?? enabled;
    const interval = overrides?.interval ?? intervalHours;
    const start    = overrides?.start    ?? activeStart;
    const end      = overrides?.end      ?? activeEnd;
    const ids      = overrides?.ids      ?? selectedIds;
    const custom   = overrides?.custom   ?? customNudges;
    await scheduleNudges(en, ids, custom, interval, start, end, language);
  };

  const handleToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(s.permission_title, s.permission_msg);
        return;
      }
    }
    setEnabled(value);
    await reschedule({ en: value });
  };

  const handleInterval = async (h: number) => {
    setIntervalHours(h);
    await reschedule({ interval: h });
  };

  const handleStart = async (t: string) => {
    setActiveStart(t);
    await reschedule({ start: t });
  };

  const handleEnd = async (t: string) => {
    setActiveEnd(t);
    await reschedule({ end: t });
  };

  const handleToggleNudge = async (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((s) => s !== id)
      : [...selectedIds, id];
    toggleNudge(id);
    await reschedule({ ids: next });
  };

  const handleAddCustom = async () => {
    const text = draft.trim();
    if (!text) return;
    if (customNudges.includes(text)) {
      Alert.alert(s.custom_exists, s.custom_exists_msg);
      return;
    }
    const next = [...customNudges, text];
    addCustomNudge(text);
    setDraft('');
    await reschedule({ custom: next });
  };

  const handleRemoveCustom = async (text: string) => {
    const next = customNudges.filter((n) => n !== text);
    removeCustomNudge(text);
    await reschedule({ custom: next });
  };

  // Group preset nudges by category
  const categories = Object.keys(NUDGE_CATEGORY_LABELS);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{s.title}</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.closeBtn}>✕</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Enable toggle */}
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{s.enable_label}</Text>
                <Text style={styles.rowSub}>{s.enable_sub}</Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={handleToggle}
                trackColor={{ false: c.border, true: c.primary }}
                thumbColor={c.background}
              />
            </View>
          </View>

          {enabled && (
            <>
              {/* Frequency */}
              <Text style={styles.sectionLabel}>{s.section_frequency}</Text>
              <View style={styles.card}>
                <View style={styles.chipRow}>
                  {INTERVAL_OPTIONS.map((h) => (
                    <Pressable
                      key={h}
                      style={[styles.chip, intervalHours === h && styles.chipActive]}
                      onPress={() => handleInterval(h)}
                    >
                      <Text style={[styles.chipText, intervalHours === h && styles.chipTextActive]}>
                        {s.every_h(h)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Active Hours */}
              <Text style={styles.sectionLabel}>{s.section_hours}</Text>
              <View style={styles.card}>
                <Text style={styles.hoursLabel}>{s.hours_start}</Text>
                <View style={styles.chipRow}>
                  {START_OPTIONS.map((t) => (
                    <Pressable
                      key={t}
                      style={[styles.chip, activeStart === t && styles.chipActive]}
                      onPress={() => handleStart(t)}
                    >
                      <Text style={[styles.chipText, activeStart === t && styles.chipTextActive]}>
                        {hourLabel(t)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={[styles.hoursLabel, { marginTop: spacing.md }]}>{s.hours_end}</Text>
                <View style={styles.chipRow}>
                  {END_OPTIONS.map((t) => (
                    <Pressable
                      key={t}
                      style={[styles.chip, activeEnd === t && styles.chipActive]}
                      onPress={() => handleEnd(t)}
                    >
                      <Text style={[styles.chipText, activeEnd === t && styles.chipTextActive]}>
                        {hourLabel(t)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Nudge Library */}
              <Text style={styles.sectionLabel}>{s.section_library}</Text>
              {categories.map((cat) => {
                const items = NUDGE_LIBRARY.filter((n) => n.category === cat);
                return (
                  <View key={cat} style={[styles.card, { marginBottom: spacing.sm }]}>
                    <Text style={styles.catLabel}>{catLabels[cat]}</Text>
                    {items.map((nudge) => {
                      const checked = selectedIds.includes(nudge.id);
                      const nudgeText = language === 'en' ? nudge.text_en : nudge.text_ko;
                      return (
                        <Pressable
                          key={nudge.id}
                          style={styles.nudgeRow}
                          onPress={() => handleToggleNudge(nudge.id)}
                        >
                          <View style={[styles.checkbox, checked && styles.checkboxActive]}>
                            {checked && <Text style={styles.checkMark}>✓</Text>}
                          </View>
                          <Text style={styles.nudgeText}>{nudgeText}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })}

              {/* Custom Nudges */}
              <Text style={styles.sectionLabel}>{s.section_custom}</Text>
              <View style={styles.card}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder={s.custom_placeholder}
                    placeholderTextColor={c.textSecondary}
                    value={draft}
                    onChangeText={setDraft}
                    returnKeyType="done"
                    onSubmitEditing={handleAddCustom}
                  />
                  <Pressable
                    style={[styles.addBtn, !draft.trim() && styles.addBtnDisabled]}
                    onPress={handleAddCustom}
                  >
                    <Text style={styles.addBtnText}>{s.custom_add}</Text>
                  </Pressable>
                </View>

                {customNudges.length > 0 && (
                  <View style={{ marginTop: spacing.sm }}>
                    {customNudges.map((text) => (
                      <View key={text} style={styles.customRow}>
                        <Text style={styles.customText} numberOfLines={2}>{text}</Text>
                        <Pressable onPress={() => handleRemoveCustom(text)} hitSlop={8}>
                          <Text style={styles.removeText}>✕</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}

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
    title: { ...typography.h3, color: c.text },
    closeBtn: { fontSize: 18, color: c.textSecondary, padding: spacing.xs },
    scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },

    sectionLabel: {
      ...typography.caption, color: c.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginBottom: spacing.sm, marginTop: spacing.lg,
    },
    card: {
      backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.border,
      paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    rowLabel: { ...typography.body, color: c.text },
    rowSub: { ...typography.caption, color: c.textSecondary, marginTop: 2 },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    chip: {
      paddingVertical: spacing.xs, paddingHorizontal: spacing.md,
      borderRadius: radius.xl, borderWidth: 1, borderColor: c.border,
    },
    chipActive: { borderColor: c.primary, backgroundColor: c.primary },
    chipText: { ...typography.caption, color: c.text },
    chipTextActive: { color: c.background, fontWeight: '600' },

    hoursLabel: { ...typography.caption, color: c.textSecondary, marginBottom: spacing.sm },

    catLabel: {
      ...typography.caption, color: c.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.6,
      marginBottom: spacing.sm,
    },
    nudgeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.sm },
    checkbox: {
      width: 22, height: 22, borderRadius: 4,
      borderWidth: 1.5, borderColor: c.textSecondary,
      alignItems: 'center', justifyContent: 'center',
    },
    checkboxActive: { backgroundColor: c.primary, borderColor: c.primary },
    checkMark: { color: c.background, fontSize: 12, fontWeight: '700' },
    nudgeText: { ...typography.body, color: c.text, flex: 1 },

    inputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
    input: {
      flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: radius.md,
      paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
      ...typography.body, color: c.text, backgroundColor: c.background,
    },
    addBtn: {
      paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
      borderRadius: radius.md, backgroundColor: c.primary,
    },
    addBtnDisabled: { backgroundColor: c.muted },
    addBtnText: { ...typography.body, color: c.background, fontWeight: '600' },

    customRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: spacing.sm, paddingHorizontal: spacing.sm,
      borderTopWidth: 1, borderTopColor: c.border, gap: spacing.sm,
    },
    customText: { ...typography.body, color: c.text, flex: 1 },
    removeText: { color: c.textSecondary, fontSize: 14 },
  });
}
