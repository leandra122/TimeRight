import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Screen from '../components/Screen';
import { Button, Field, Title, uiStyles } from '../components/UI';
import { appointmentsApi } from '../api/services';
import { getApiError } from '../api/client';
import { money } from '../utils/format';
import { colors } from '../styles/theme';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year
    && parsed.getMonth() === month - 1
    && parsed.getDate() === day;
}

function initialDate() {
  const value = new Date();
  value.setDate(value.getDate() + 1);
  value.setHours(12, 0, 0, 0);
  return value;
}

function displayDate(value) {
  if (!isValidDate(value)) return 'Data ainda não selecionada';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function availabilityContext(data, funcionarioId, servicoId) {
  return { data, funcionarioId, servicoId };
}

function isSameContext(first, second) {
  return first?.data === second?.data
    && first?.funcionarioId === second?.funcionarioId
    && first?.servicoId === second?.servicoId;
}

export default function NewAppointmentScreen({ route, navigation }) {
  const { salon, service, employee } = route.params;
  const firstDate = useRef(initialDate()).current;
  const [date, setDate] = useState(firstDate);
  const [selectedDate, setSelectedDate] = useState(() => toLocalDate(firstDate));
  const [pickerVisible, setPickerVisible] = useState(false);
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);
  const submitSequence = useRef(0);
  const mounted = useRef(true);
  const navigationStarted = useRef(false);
  const currentContext = useRef(availabilityContext(
    toLocalDate(firstDate), employee.id, service.id,
  ));

  const loadAvailability = useCallback(async (context) => {
    const requestId = ++requestSequence.current;
    const canApply = () => mounted.current
      && requestId === requestSequence.current
      && isSameContext(currentContext.current, context);

    if (canApply()) {
      setSelectedTime('');
      setSlots([]);
      setAvailabilityError('');
    }
    if (!isValidDate(context.data)) {
      if (canApply()) setAvailabilityLoading(false);
      return;
    }
    if (canApply()) setAvailabilityLoading(true);
    try {
      const response = await appointmentsApi.availability(
        context.funcionarioId, context.servicoId, context.data,
      );
      if (!canApply()) return;
      setSlots(Array.isArray(response.data?.horarios) ? response.data.horarios : []);
    } catch (requestError) {
      if (!canApply()) return;
      setAvailabilityError(getApiError(
        requestError, 'Não foi possível carregar os horários disponíveis.',
      ));
    } finally {
      if (canApply()) setAvailabilityLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestSequence.current += 1;
      submitSequence.current += 1;
    };
  }, []);

  useEffect(() => {
    const context = availabilityContext(selectedDate, employee.id, service.id);
    currentContext.current = context;
    requestSequence.current += 1;
    setSelectedTime('');
    setSlots([]);
    setAvailabilityError('');
    setAvailabilityLoading(false);
    setError('');
    loadAvailability(context);
  }, [employee.id, loadAvailability, selectedDate, service.id]);

  function changeDate(nextDate, nativeDate = null) {
    if (submitting) return;
    const context = availabilityContext(nextDate, employee.id, service.id);
    currentContext.current = context;
    requestSequence.current += 1;
    setSelectedTime('');
    setSlots([]);
    setAvailabilityError('');
    setAvailabilityLoading(false);
    setError('');
    if (nativeDate) setDate(nativeDate);
    setSelectedDate(nextDate);
  }

  function changeNativeDate(_, value) {
    if (submitting) return;
    setPickerVisible(Platform.OS === 'ios');
    if (!value) return;
    const normalized = new Date(value);
    normalized.setHours(12, 0, 0, 0);
    changeDate(toLocalDate(normalized), normalized);
  }

  function changeWebDate(event) {
    if (submitting) return;
    const value = event.target.value;
    changeDate(isValidDate(value) ? value : '');
  }

  async function submit() {
    if (submitting || !selectedTime || !isValidDate(selectedDate)) return;
    const submittedContext = availabilityContext(selectedDate, employee.id, service.id);
    const submittedTime = selectedTime;
    if (!isSameContext(currentContext.current, submittedContext)) return;
    const submitId = ++submitSequence.current;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await appointmentsApi.create({
        funcionarioId: submittedContext.funcionarioId,
        servicoId: submittedContext.servicoId,
        dataHora: `${submittedContext.data}T${submittedTime}`,
        observacoes: notes.trim() || null,
      });
      if (!mounted.current || submitId !== submitSequence.current
        || !isSameContext(currentContext.current, submittedContext)
        || navigationStarted.current) return;
      navigationStarted.current = true;
      navigation.replace('AppointmentConfirmation', { appointment: data });
    } catch (submitError) {
      const canApply = mounted.current
        && submitId === submitSequence.current
        && isSameContext(currentContext.current, submittedContext);
      if (!canApply) return;
      if (submitError.response?.status === 409) {
        setError('Esse horário ficou indisponível. Escolha outro horário.');
        setSelectedTime('');
        await loadAvailability(submittedContext);
      } else {
        setError(getApiError(submitError, 'Não foi possível criar o agendamento.'));
      }
    } finally {
      if (mounted.current && submitId === submitSequence.current) setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Title subtitle="Escolha um horário disponível do estabelecimento.">
        Revise seu agendamento
      </Title>
      <Text style={{ fontWeight: '800' }}>{salon.nome}</Text>
      <Text>{service.nome} • {money(service.preco)} • {service.duracao} min</Text>
      <Text>{employee.nome}</Text>
      <Text style={{ marginVertical: 16, fontSize: 18 }}>
        {displayDate(selectedDate)}
        {selectedTime ? ` às ${selectedTime.slice(0, 5)}` : ''}
      </Text>

      <Text style={uiStyles.label}>Data</Text>
      {Platform.OS === 'web' ? (
        <input
          aria-label="Data do agendamento"
          type="date"
          value={selectedDate}
          onChange={changeWebDate}
          disabled={submitting}
          style={{ ...uiStyles.input, width: '100%', boxSizing: 'border-box', marginBottom: 16 }}
        />
      ) : (
        <>
          <Button
            title="Escolher data"
            secondary
            disabled={submitting}
            onPress={() => { if (!submitting) setPickerVisible(true); }}
          />
          {pickerVisible ? (
            <DateTimePicker
              value={date}
              mode="date"
              minimumDate={new Date()}
              onChange={changeNativeDate}
              disabled={submitting}
            />
          ) : null}
        </>
      )}

      <Text style={[uiStyles.label, { marginTop: 16 }]}>Horários disponíveis</Text>
      {availabilityLoading ? (
        <View style={{ alignItems: 'center', padding: 20 }}>
          <ActivityIndicator color={colors.primary} />
          <Text>Carregando horários...</Text>
        </View>
      ) : null}
      {!availabilityLoading && availabilityError ? (
        <View>
          <Text style={uiStyles.error}>{availabilityError}</Text>
          <Button
            title="Tentar novamente"
            secondary
            disabled={submitting}
            onPress={() => loadAvailability(currentContext.current)}
          />
        </View>
      ) : null}
      {!availabilityLoading && !availabilityError && isValidDate(selectedDate)
        && slots.length === 0 ? (
          <Text style={{ color: colors.muted, textAlign: 'center', padding: 20 }}>
            Nenhum horário disponível para esta data
          </Text>
        ) : null}
      {!availabilityLoading && !availabilityError && slots.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {slots.map((slot) => {
            const selected = selectedTime === slot;
            return (
              <Pressable
                key={slot}
                accessibilityRole="button"
                accessibilityLabel={`Selecionar horário ${slot.slice(0, 5)}`}
                accessibilityState={{ selected }}
                disabled={submitting}
                onPress={() => {
                  if (submitting) return;
                  setSelectedTime(slot);
                  setError('');
                }}
                style={{
                  borderWidth: 1,
                  borderColor: colors.primary,
                  backgroundColor: selected ? colors.primary : colors.card,
                  borderRadius: 10,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: selected ? '#fff' : colors.primary, fontWeight: '800' }}>
                  {slot.slice(0, 5)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Field
        label="Observações (opcional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={255}
        editable={!submitting}
      />
      {error ? <Text style={uiStyles.error}>{error}</Text> : null}
      <Button
        title={submitting ? 'Confirmando...' : 'Confirmar agendamento'}
        disabled={submitting || availabilityLoading || !selectedTime}
        onPress={submit}
      />
    </Screen>
  );
}
