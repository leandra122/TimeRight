import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Button, Field, Title } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../api/client';
import { API_CONFIGURATION_WARNING } from '../config/apiConfig';
import { colors, radius, spacing } from '../styles/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!email.trim() || !password) return setError('Informe seu e-mail e sua senha para continuar.');
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (requestError) {
      setError(requestError.response
        ? getApiError(requestError, 'E-mail ou senha inválidos.')
        : requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen topInset contentStyle={styles.content}>
      <View style={styles.brandMark}><Ionicons name="time-outline" size={30} color={colors.white} /></View>
      <Text style={styles.brand}>TimeRight</Text>
      <Title subtitle="Acesse sua conta para encontrar serviços e cuidar da sua agenda.">Que bom ter você aqui</Title>
      {API_CONFIGURATION_WARNING ? <Text style={styles.warning}>{API_CONFIGURATION_WARNING}</Text> : null}
      <Field label="E-mail" value={email} onChangeText={setEmail} editable={!loading} keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="next" />
      <Field label="Senha" value={password} onChangeText={setPassword} editable={!loading} secureTextEntry={!visible} autoCapitalize="none" autoComplete="password" onSubmitEditing={submit} returnKeyType="done" />
      <Pressable disabled={loading} onPress={() => setVisible((value) => !value)} accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'} style={styles.visibility}>
        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.primaryDark} />
        <Text style={styles.link}>{visible ? 'Ocultar senha' : 'Mostrar senha'}</Text>
      </Pressable>
      {error ? <View style={styles.errorBox}><Ionicons name="alert-circle-outline" size={20} color={colors.danger} /><Text style={styles.error}>{error}</Text></View> : null}
      <Button title={loading ? 'Entrando...' : 'Entrar'} icon="log-in-outline" onPress={submit} disabled={loading} />
      <View style={styles.accountRow}><Text style={styles.accountText}>Ainda não tem uma conta?</Text><Pressable disabled={loading} onPress={() => navigation.navigate('Register')} accessibilityRole="link" hitSlop={8}><Text style={styles.createLink}>Criar conta</Text></Pressable></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, maxWidth: 520, alignSelf: 'center' },
  brandMark: { width: 58, height: 58, borderRadius: 20, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  brand: { color: colors.primaryDark, fontSize: 21, fontWeight: '900', letterSpacing: 0.4, marginBottom: spacing.xl },
  visibility: { minHeight: 44, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs, marginTop: -spacing.sm, marginBottom: spacing.sm },
  link: { color: colors.primaryDark, fontWeight: '800' },
  errorBox: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  error: { flex: 1, color: colors.danger, lineHeight: 20 },
  warning: { color: colors.warning, backgroundColor: colors.secondarySoft, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
  accountRow: { minHeight: 52, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  accountText: { color: colors.muted },
  createLink: { color: colors.primaryDark, fontWeight: '900', paddingVertical: spacing.sm },
});
