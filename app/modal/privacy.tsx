import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { spacing, typography, radius, AppColors } from '../../src/theme';
import { useColors } from '../../src/hooks/useColors';
import { useLanguageStore } from '../../src/store/languageStore';

// Replace with your hosted privacy policy URL before submitting to app stores
const PRIVACY_URL = 'https://dionshin.github.io/Axis-privacy/';

export default function PrivacyModal() {
  const c = useColors();
  const styles = makeStyles(c);
  const { language } = useLanguageStore();
  const isKo = language === 'ko';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isKo ? '개인정보처리방침' : 'Privacy Policy'}</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.updated}>
          {isKo ? '최종 업데이트: 2026년 4월' : 'Last updated: April 2026'}
        </Text>

        <Text style={styles.sectionTitle}>
          {isKo ? '수집하는 정보' : 'What we collect'}
        </Text>
        <Text style={styles.body}>
          {isKo
            ? 'Axis는 직접 입력한 정보만 수집합니다: 로그인에 사용되는 이메일 주소와 루틴 체크 기록. 이 데이터는 Supabase를 통해 안전하게 저장됩니다.'
            : 'Axis collects only the data you provide: your email address for authentication, and your routine check-in records. This data is stored securely via Supabase.'}
        </Text>

        <Text style={styles.sectionTitle}>
          {isKo ? '사용 목적' : 'How we use it'}
        </Text>
        <Text style={styles.body}>
          {isKo
            ? '수집된 데이터는 오직 Axis 앱 서비스 제공을 위해서만 사용됩니다 — 루틴을 기록하고 기록을 확인하는 용도로만 쓰입니다. 데이터를 판매하거나 광고 목적으로 사용하지 않습니다.'
            : 'Your data is used solely to provide the Axis app experience — tracking your routines and showing your history. We do not sell, share, or use your data for advertising.'}
        </Text>

        <Text style={styles.sectionTitle}>
          {isKo ? '알림' : 'Notifications'}
        </Text>
        <Text style={styles.body}>
          {isKo
            ? '리마인더를 활성화하면 기기 내에서 로컬 알림이 예약됩니다. 알림 관련 데이터는 외부 서버로 전송되지 않습니다.'
            : 'If you enable reminders, Axis schedules local notifications on your device. No notification data is sent to external servers.'}
        </Text>

        <Text style={styles.sectionTitle}>
          {isKo ? '계정 및 데이터 삭제' : 'Data deletion'}
        </Text>
        <Text style={styles.body}>
          {isKo
            ? '계정과 관련 데이터를 삭제하려면 문의해주세요. 로그아웃하면 이 기기에서 데이터가 제거됩니다.'
            : 'You can delete your account and all associated data by contacting us. Signing out removes your data from this device.'}
        </Text>

        <Text style={styles.sectionTitle}>
          {isKo ? '문의' : 'Contact'}
        </Text>
        <Text style={styles.body}>
          {isKo
            ? '개인정보 관련 문의는 앱 스토어 개발자 문의 기능을 이용해주세요.'
            : 'For privacy-related questions, please use the contact option on the App Store or Google Play.'}
        </Text>

        <Pressable style={styles.linkBtn} onPress={() => Linking.openURL(PRIVACY_URL)}>
          <Text style={styles.linkBtnText}>
            {isKo ? '전체 방침 온라인으로 보기 →' : 'View full policy online →'}
          </Text>
        </Pressable>
      </ScrollView>
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
    scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, paddingTop: spacing.lg },
    updated: { ...typography.caption, color: c.muted, marginBottom: spacing.lg },
    sectionTitle: { ...typography.body, color: c.text, fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.lg },
    body: { ...typography.body, color: c.textSecondary, lineHeight: 22 },
    linkBtn: {
      marginTop: spacing.xl, paddingVertical: spacing.md,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border, alignItems: 'center',
    },
    linkBtnText: { ...typography.body, color: c.primary },
  });
}
