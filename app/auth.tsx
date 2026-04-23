import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { spacing, typography, radius, AppColors } from '../src/theme';
import { useColors } from '../src/hooks/useColors';
import { useStrings } from '../src/hooks/useStrings';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const c = useColors();
  const styles = makeStyles(c);
  const s = useStrings().auth;

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_PASSWORD_LENGTH = 8;

  const handleSubmit = async () => {
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError(s.err_empty);
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError(s.err_email);
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(s.err_password);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email: trimmedEmail, password });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (signInError) throw signInError;
      }
    } catch {
      // Intentionally vague — don't leak whether email exists
      setError(mode === 'signup' ? s.err_signup : s.err_signin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>Axis</Text>
          <Text style={styles.subtitle}>
            {mode === 'signin' ? s.signin_subtitle : s.signup_subtitle}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>{s.email_label}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="you@example.com"
              placeholderTextColor={c.muted}
              maxLength={254}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{s.password_label}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder={s.password_placeholder}
              placeholderTextColor={c.muted}
              maxLength={128}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{mode === 'signin' ? s.signin_btn : s.signup_btn}</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {mode === 'signin' ? s.switch_to_signup : s.switch_to_signin}
          </Text>
          <Pressable onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}>
            <Text style={styles.footerLink}>{mode === 'signin' ? s.switch_signup_link : s.switch_signin_link}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    inner: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, justifyContent: 'center' },
    header: { marginBottom: spacing.xxl },
    wordmark: { fontSize: 36, fontWeight: '700', color: c.text, letterSpacing: -1, marginBottom: spacing.sm },
    subtitle: { ...typography.body, color: c.textSecondary },
    form: { gap: spacing.md },
    field: { gap: spacing.xs },
    label: { ...typography.caption, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      ...typography.body,
      color: c.text,
    },
    error: { ...typography.caption, color: '#e53e3e', marginTop: spacing.xs },
    button: { backgroundColor: c.primary, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.sm },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { ...typography.body, color: c.background, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
    footerText: { ...typography.body, color: c.textSecondary },
    footerLink: { ...typography.body, color: c.primary, fontWeight: '600' },
  });
}
