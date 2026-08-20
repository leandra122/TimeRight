import { useRef, useState } from 'react';
import { Alert, Platform, Text } from 'react-native';
import Screen from '../components/Screen';
import { Button, Title, uiStyles } from '../components/UI';
import { appointmentsApi } from '../api/services';
import { getApiError } from '../api/client';
import { dateTime, money } from '../utils/format';

export default function AppointmentDetailsScreen({ route, navigation }) {
  const [item, setItem] = useState(route.params.appointment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const cancelInFlight = useRef(false);
  const canCancel = String(item.status).toUpperCase() !== 'CANCELADO'
    && new Date(item.dataHora) > new Date();

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
      <Title>{item.salao?.nome}</Title>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>{item.servico?.nome}</Text>
      <Text>Profissional: {item.funcionario?.nome}</Text>
      <Text>Data: {dateTime(item.dataHora)}</Text>
      <Text>Duração: {item.duracao} min</Text>
      <Text>Preço: {money(item.servico?.preco)}</Text>
      <Text>Status: {item.status}</Text>
      {item.observacoes ? <Text>Observações: {item.observacoes}</Text> : null}
      {message ? <Text style={uiStyles.subtitle}>{message}</Text> : null}
      {error ? <Text style={uiStyles.error}>{error}</Text> : null}
      {canCancel ? (
        <Button
          title={loading ? 'Cancelando...' : 'Cancelar agendamento'}
          disabled={loading}
          onPress={confirm}
          secondary
        />
      ) : null}
      <Button
        title="Voltar para agenda"
        onPress={() => navigation.navigate('Main', { screen: 'Agenda' })}
      />
    </Screen>
  );
}
