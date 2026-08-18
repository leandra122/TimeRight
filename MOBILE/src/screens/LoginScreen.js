import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { Button, Field, Title } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../api/client';
import { API_CONFIGURATION_WARNING } from '../config/apiConfig';
import { colors, spacing } from '../styles/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  async function submit() {
    if (!email.trim() || !password) return setError('Informe e-mail e senha.');
    setLoading(true); setError('');
    try { await login(email, password); } catch (e) { setError(e.response ? getApiError(e, 'E-mail ou senha inválidos.') : e.message); } finally { setLoading(false); }
  }
  return <Screen contentStyle={styles.content}>
    <View><Text style={styles.brand}>TimeRight</Text><Title subtitle="Entre para agendar seus cuidados.">Bem-vinda(o)</Title></View>
    {API_CONFIGURATION_WARNING ? <Text style={styles.warning}>{API_CONFIGURATION_WARNING}</Text> : null}
    <Field label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
    <Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry={!visible} autoCapitalize="none" />
    <Pressable onPress={() => setVisible((v) => !v)} accessibilityRole="button"><Text style={styles.link}>{visible ? 'Ocultar senha' : 'Mostrar senha'}</Text></Pressable>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <Button title={loading ? 'Entrando...' : 'Entrar'} onPress={submit} disabled={loading} />
    <Button title="Criar conta" onPress={() => navigation.navigate('Register')} disabled={loading} secondary />
  </Screen>;
}
const styles = StyleSheet.create({ content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg }, brand: { color: colors.primaryDark, fontSize: 20, fontWeight: '900', marginBottom: spacing.lg }, link: { color: colors.primaryDark, fontWeight: '700', marginBottom: spacing.md }, error: { color: colors.danger, marginVertical: spacing.sm }, warning: { color: colors.muted, marginBottom: spacing.md } });
