import { useState } from 'react';
import { Alert, Text } from 'react-native';
import Screen from '../components/Screen';
import { Button, Field, Title, uiStyles } from '../components/UI';
import { authApi } from '../api/services';
import { getApiError } from '../api/client';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ nome: '', email: '', password: '', confirm: '' }); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  async function submit() {
    if (!form.nome.trim() || !form.email.trim() || !form.password) return setError('Preencha todos os campos.');
    if (form.password.length < 6) return setError('A senha deve ter no mínimo 6 caracteres.');
    if (form.password !== form.confirm) return setError('As senhas não coincidem.');
    setLoading(true); setError('');
    try { await authApi.register(form.nome.trim(), form.email.trim().toLowerCase(), form.password); Alert.alert('Conta criada', 'Cadastro realizado. Entre com seu e-mail e senha.', [{ text: 'Ir para login', onPress: () => navigation.goBack() }]); }
    catch (e) { setError(getApiError(e, 'Não foi possível criar sua conta.')); } finally { setLoading(false); }
  }
  return <Screen><Title subtitle="O aplicativo é exclusivo para clientes.">Criar conta</Title>
    <Field label="Nome completo" value={form.nome} onChangeText={update('nome')} autoCapitalize="words" autoComplete="name" />
    <Field label="E-mail" value={form.email} onChangeText={update('email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
    <Field label="Senha" value={form.password} onChangeText={update('password')} secureTextEntry autoCapitalize="none" />
    <Field label="Confirmar senha" value={form.confirm} onChangeText={update('confirm')} secureTextEntry autoCapitalize="none" />
    {error ? <Text style={uiStyles.error}>{error}</Text> : null}<Button title={loading ? 'Criando...' : 'Criar conta'} onPress={submit} disabled={loading} />
  </Screen>;
}
