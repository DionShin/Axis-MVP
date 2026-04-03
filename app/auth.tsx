import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { spacing, typography, radius, AppColors } from '../src/theme';
import { useColors } from '../src/hooks/useColors';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const c = useColors();
  const styles = makeStyles(c);

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
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
            {mode === 'signin' ? 'Sign in to continue.' : 'Create your account.'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="you@example.com"
              placeholderTextColor={c.muted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              placeholderTextColor={c.muted}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{mode === 'signin' ? 'Sign in' : 'Sign up'}</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          </Text>
          <Pressable onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}>
            <Text style={styles.footerLink}>{mode === 'signin' ? 'Sign up' : 'Sign in'}</Text>
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
