import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Button, Field, Title } from '../components/UI';
import { authApi } from '../api/services';
import { getApiError } from '../api/client';
import { colors, radius, spacing } from '../styles/theme';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ nome: '', email: '', password: '', confirm: '' });
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit() {
    if (!form.nome.trim() || !form.email.trim() || !form.password || !form.confirm) return setError('Preencha todos os campos.');
    if (form.password.length < 6) return setError('A senha deve ter no mínimo 6 caracteres.');
    if (form.password !== form.confirm) return setError('As senhas não coincidem.');
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authApi.register(form.nome.trim(), form.email.trim().toLowerCase(), form.password);
      const message = 'Cadastro realizado. Agora entre com seu e-mail e senha.';
      setSuccess(message);
      if (Platform.OS === 'web') return;
      Alert.alert('Conta criada', message, [{ text: 'Ir para login', onPress: () => navigation.goBack() }]);
    } catch (requestError) {
      setError(getApiError(requestError, 'Não foi possível criar sua conta.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen contentStyle={styles.content}>
      <Title eyebrow="Conta de cliente" subtitle="Use seus dados para agendar e acompanhar seus atendimentos.">Crie sua conta</Title>
      <Field label="Nome completo" value={form.nome} onChangeText={update('nome')} editable={!loading && !success} autoCapitalize="words" autoComplete="name" />
      <Field label="E-mail" value={form.email} onChangeText={update('email')} editable={!loading && !success} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <Field label="Senha" value={form.password} onChangeText={update('password')} editable={!loading && !success} secureTextEntry={!visible} autoCapitalize="none" autoComplete="new-password" />
      <Field label="Confirmar senha" value={form.confirm} onChangeText={update('confirm')} editable={!loading && !success} secureTextEntry={!visible} autoCapitalize="none" onSubmitEditing={submit} returnKeyType="done" />
      <Pressable disabled={loading || Boolean(success)} onPress={() => setVisible((value) => !value)} accessibilityRole="button" style={styles.visibility}>
        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.primaryDark} />
        <Text style={styles.link}>{visible ? 'Ocultar senhas' : 'Mostrar senhas'}</Text>
      </Pressable>
      {error ? <View style={styles.errorBox}><Ionicons name="alert-circle-outline" size={20} color={colors.danger} /><Text style={styles.error}>{error}</Text></View> : null}
      {success ? <View style={styles.successBox}><Ionicons name="checkmark-circle-outline" size={22} color={colors.success} /><Text style={styles.success}>{success}</Text></View> : null}
      {success ? <Button title="Ir para o login" icon="arrow-back-outline" onPress={() => navigation.goBack()} /> : <Button title={loading ? 'Criando conta...' : 'Criar conta'} icon="person-add-outline" onPress={submit} disabled={loading} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { maxWidth: 560, alignSelf: 'center' },
  visibility: { minHeight: 44, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs, marginTop: -spacing.sm, marginBottom: spacing.sm },
  link: { color: colors.primaryDark, fontWeight: '800' },
  errorBox: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  error: { flex: 1, color: colors.danger },
  successBox: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', backgroundColor: colors.successSoft, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  success: { flex: 1, color: colors.success, lineHeight: 21 },
});
