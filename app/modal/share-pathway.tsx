import { View, Text, StyleSheet, Pressable, ScrollView, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useRoutineStore } from '../../src/store/routineStore';
import { useStrings } from '../../src/hooks/useStrings';
import { useLanguageStore } from '../../src/store/languageStore';
import { ShareTemplate } from '../../src/features/share/share.types';
import { generateShareData, buildShareText } from '../../src/features/share/share.utils';
import { ShareCard } from '../../src/features/share/components/ShareCard';

export default function SharePathwayModal() {
  const c = useColors();
  const styles = makeStyles(c);
  const s = useStrings().share_modal;
  const { routines, checks } = useRoutineStore();
  const { language } = useLanguageStore();

  const TEMPLATES: { id: ShareTemplate; label: string; desc: string }[] = [
    { id: 'monthly',   label: s.template_monthly_label,   desc: s.template_monthly_desc },
    { id: 'recovery',  label: s.template_recovery_label,  desc: s.template_recovery_desc },
    { id: 'milestone', label: s.template_milestone_label, desc: s.template_milestone_desc },
  ];

  const [selected, setSelected] = useState<ShareTemplate>('monthly');

  const data = generateShareData(routines, checks, language);

  const handleShare = async () => {
    const message = buildShareText(selected, data, language);
    try {
      await Share.share({ message });
    } catch {
      Alert.alert(s.share_fail_title, s.share_fail_msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{s.title}</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Template selector */}
        <View style={styles.templateRow}>
          {TEMPLATES.map((t) => (
            <Pressable
              key={t.id}
              style={[styles.templateChip, selected === t.id && styles.templateChipActive]}
              onPress={() => setSelected(t.id)}
            >
              <Text style={[styles.templateChipText, selected === t.id && styles.templateChipTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Template description */}
        <Text style={styles.templateDesc}>
          {TEMPLATES.find((t) => t.id === selected)?.desc}
        </Text>

        {/* Card preview */}
        <View style={styles.cardWrapper}>
          <ShareCard template={selected} data={data} />
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>{s.share_btn}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
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
    close: { fontSize: 18, color: c.textSecondary, fontWeight: '400' },

    scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },

    templateRow: {
      flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm,
    },
    templateChip: {
      flex: 1, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs,
      borderRadius: radius.sm, borderWidth: 1, borderColor: c.border,
      alignItems: 'center', backgroundColor: c.surface,
    },
    templateChipActive: { borderColor: c.primary, backgroundColor: c.primary },
    templateChipText: { ...typography.caption, color: c.textSecondary, textAlign: 'center' },
    templateChipTextActive: { color: c.background, fontWeight: '600' },

    templateDesc: {
      ...typography.caption, color: c.textSecondary,
      marginBottom: spacing.lg, textAlign: 'center',
    },

    cardWrapper: {
      alignItems: 'center',
      borderRadius: 20,
      overflow: 'hidden',
    },

    actions: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    shareButton: {
      backgroundColor: c.primary,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      alignItems: 'center',
    },
    shareButtonText: { ...typography.body, color: c.background, fontWeight: '600' },
  });
}
