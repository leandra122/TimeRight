import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Screen from '../components/Screen';
import { Button, Field, Title, uiStyles } from '../components/UI';
import { appointmentsApi } from '../api/services';
import { getApiError } from '../api/client';
import { dateTime, money, toApiDateTime } from '../utils/format';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year
    && parsed.getMonth() === month - 1
    && parsed.getDate() === day;
}

function formatWebDateTime(dateValue, timeValue) {
  if (!isValidDate(dateValue) || !TIME_PATTERN.test(timeValue)) return '';
  const [year, month, day] = dateValue.split('-');
  return `${day}/${month}/${year} ${timeValue}`;
}

export default function NewAppointmentScreen({ route, navigation }) {
  const { salon, service, employee } = route.params;
  const [date, setDate] = useState(() => {
    const initial = new Date();
    initial.setDate(initial.getDate() + 1);
    initial.setHours(10, 0, 0, 0);
    return initial;
  });
  const [webDate, setWebDate] = useState('');
  const [webTime, setWebTime] = useState('');
  const [picker, setPicker] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const webSelectionValid = isValidDate(webDate) && TIME_PATTERN.test(webTime);
  const webValidationMessage = Platform.OS === 'web' && !webSelectionValid
    ? 'Selecione uma data e um horário válidos para continuar.'
    : '';

  const change = (_, value) => {
    if (Platform.OS !== 'ios') setPicker(null);
    if (!value) return;

    const next = new Date(date);
    if (picker === 'date') {
      next.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());
    } else {
      next.setHours(value.getHours(), value.getMinutes(), 0, 0);
    }
    setDate(next);
  };

  const changeWebDate = (event) => {
    const value = event.target.value;
    setWebDate(DATE_PATTERN.test(value) && isValidDate(value) ? value : '');
    setError('');
  };

  const changeWebTime = (event) => {
    const value = event.target.value;
    setWebTime(TIME_PATTERN.test(value) ? value : '');
    setError('');
  };

  async function submit() {
    if (loading) return;
    if (Platform.OS === 'web' && !webSelectionValid) {
      setError('Selecione uma data e um horário válidos antes de confirmar.');
      return;
    }

    const selectedDateTime = Platform.OS === 'web'
      ? `${webDate}T${webTime}:00`
      : toApiDateTime(date);

    setLoading(true);
    setError('');
    try {
      const { data } = await appointmentsApi.create({
        funcionarioId: employee.id,
        servicoId: service.id,
        dataHora: selectedDateTime,
        observacoes: notes.trim() || null,
      });
      navigation.replace('AppointmentConfirmation', { appointment: data });
    } catch (e) {
      setError(e.response?.status === 409
        ? 'Esse horário ficou indisponível. Escolha outro horário.'
        : getApiError(e, 'Não foi possível criar o agendamento.'));
    } finally {
      setLoading(false);
    }
  }

  const summaryDateTime = Platform.OS === 'web'
    ? formatWebDateTime(webDate, webTime)
    : dateTime(date);

  return (
    <Screen>
      <Title subtitle="O horário será validado pelas regras do estabelecimento.">
        Revise seu agendamento
      </Title>
      <Text style={{ fontWeight: '800' }}>{salon.nome}</Text>
      <Text>{service.nome} • {money(service.preco)} • {service.duracao} min</Text>
      <Text>{employee.nome}</Text>
      <Text style={{ marginVertical: 16, fontSize: 18 }}>
        {summaryDateTime || 'Data e horário ainda não selecionados'}
      </Text>

      {Platform.OS === 'web' ? (
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={uiStyles.label}>Data</Text>
            <input
              aria-label="Data do agendamento"
              type="date"
              value={webDate}
              onChange={changeWebDate}
              style={{ ...uiStyles.input, width: '100%', boxSizing: 'border-box' }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={uiStyles.label}>Hora</Text>
            <input
              aria-label="Hora do agendamento"
              type="time"
              value={webTime}
              onChange={changeWebTime}
              step="60"
              style={{ ...uiStyles.input, width: '100%', boxSizing: 'border-box' }}
            />
          </View>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button title="Escolher data" secondary onPress={() => setPicker('date')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Escolher hora" secondary onPress={() => setPicker('time')} />
            </View>
          </View>
          {picker ? (
            <DateTimePicker
              value={date}
              mode={picker}
              minimumDate={picker === 'date' ? new Date() : undefined}
              is24Hour
              onChange={change}
            />
          ) : null}
        </>
      )}

      {webValidationMessage ? <Text style={uiStyles.error}>{webValidationMessage}</Text> : null}
      <Field
        label="Observações (opcional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={255}
      />
      {error ? <Text style={uiStyles.error}>{error}</Text> : null}
      <Button
        title={loading ? 'Confirmando...' : 'Confirmar agendamento'}
        disabled={loading || (Platform.OS === 'web' && !webSelectionValid)}
        onPress={submit}
      />
    </Screen>
  );
}
