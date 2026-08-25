import { useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Badge, Button, Card, Title, uiStyles } from '../components/UI';
import { appointmentsApi } from '../api/services';
import { getApiError } from '../api/client';
import { dateTime, money } from '../utils/format';
import { colors, radius, spacing } from '../styles/theme';

export default function AppointmentDetailsScreen({ route, navigation }) {
  const [item, setItem] = useState(route.params.appointment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const cancelInFlight = useRef(false);
  const canCancel = String(item.status).toUpperCase() !== 'CANCELADO'
    && new Date(item.dataHora) > new Date();
  const statusTone = String(item.status).toUpperCase() === 'CANCELADO' ? 'danger' : (canCancel ? 'success' : 'muted');

  async function cancel() {
    if (cancelInFlight.current) return;

    cancelInFlight.current = true;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data } = await appointmentsApi.cancel(item.id);
      setItem(data);
      if (Platform.OS === 'web') {
        setMessage('Agendamento cancelado. O registro foi mantido no seu histórico.');
      } else {
        Alert.alert('Agendamento cancelado', 'O registro foi mantido no seu histórico.');
      }
    } catch (e) {
      setError(e.response?.status === 409
        ? 'Este agendamento não pode mais ser cancelado.'
        : getApiError(e, 'Não foi possível cancelar o agendamento.'));
    } finally {
      cancelInFlight.current = false;
      setLoading(false);
    }
  }

  const confirm = () => {
    if (cancelInFlight.current || loading) return;

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined'
        && window.confirm('Cancelar agendamento? O registro continuará no histórico.');
      if (confirmed) cancel();
      return;
    }

    Alert.alert(
      'Cancelar agendamento?',
      'O registro continuará no histórico.',
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Cancelar agendamento', style: 'destructive', onPress: cancel },
      ],
    );
  };

  return (
    <Screen>
      <Title eyebrow="Detalhes do atendimento" subtitle="Consulte as informações registradas no agendamento.">{item.salao?.nome}</Title>
      <Card>
        <View style={styles.header}><View style={styles.icon}><Ionicons name="calendar-outline" size={25} color={colors.primaryDark} /></View><View style={styles.headerText}><Text style={styles.service}>{item.servico?.nome}</Text><Text style={styles.date}>{dateTime(item.dataHora)}</Text></View><Badge tone={statusTone}>{item.status}</Badge></View>
        <View style={styles.divider} />
        <View style={styles.detailRow}><Ionicons name="person-outline" size={19} color={colors.secondary} /><Text style={styles.detail}>Profissional: <Text style={styles.strong}>{item.funcionario?.nome}</Text></Text></View>
        <View style={styles.detailRow}><Ionicons name="time-outline" size={19} color={colors.secondary} /><Text style={styles.detail}>Duração: <Text style={styles.strong}>{item.duracao} min</Text></Text></View>
        <View style={styles.detailRow}><Ionicons name="wallet-outline" size={19} color={colors.secondary} /><Text style={styles.detail}>Preço: <Text style={styles.strong}>{money(item.servico?.preco)}</Text></Text></View>
        {item.observacoes ? <View style={styles.notes}><Text style={styles.notesLabel}>Observações</Text><Text style={uiStyles.subtitle}>{item.observacoes}</Text></View> : null}
      </Card>
      {message ? <View style={styles.success}><Ionicons name="checkmark-circle-outline" size={20} color={colors.success} /><Text style={styles.successText}>{message}</Text></View> : null}
      {error ? <View style={styles.error}><Ionicons name="alert-circle-outline" size={20} color={colors.danger} /><Text style={uiStyles.error}>{error}</Text></View> : null}
      {canCancel ? (
        <Button
          title={loading ? 'Cancelando...' : 'Cancelar agendamento'}
          disabled={loading}
          onPress={confirm}
          secondary
          icon="close-circle-outline"
        />
      ) : null}
      <Button
        title="Voltar para agenda"
        icon="arrow-back-outline"
        onPress={() => navigation.navigate('Main', { screen: 'Agenda' })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 48, height: 48, borderRadius: 17, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  service: { color: colors.text, fontSize: 18, fontWeight: '900' },
  date: { color: colors.muted, marginTop: 3 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  detail: { flex: 1, color: colors.muted },
  strong: { color: colors.text, fontWeight: '800' },
  notes: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.sm, marginTop: spacing.xs },
  notesLabel: { color: colors.text, fontWeight: '800', marginBottom: spacing.xs },
  success: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.successSoft, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  successText: { flex: 1, color: colors.success },
  error: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
});
