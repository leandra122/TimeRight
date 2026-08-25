import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { Button, StateMessage, Title } from '../components/UI';
import AppointmentCard from '../components/AppointmentCard';
import { appointmentsApi } from '../api/services';
import { getApiError } from '../api/client';
import { colors, radius, spacing } from '../styles/theme';

const tabs = ['Próximos', 'Concluídos', 'Cancelados'];

export default function AgendaScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState(tabs[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await appointmentsApi.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(getApiError(requestError, 'Não foi possível carregar sua agenda.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => navigation.addListener('focus', load), [navigation, load]);
  const shown = useMemo(() => {
    const now = new Date();
    return items.filter((appointment) => {
      const status = String(appointment.status).toUpperCase();
      if (tab === 'Cancelados') return status === 'CANCELADO';
      if (tab === 'Concluídos') return status !== 'CANCELADO' && new Date(appointment.dataHora) < now;
      return status !== 'CANCELADO' && new Date(appointment.dataHora) >= now;
    }).sort((first, second) => tab === 'Próximos'
      ? new Date(first.dataHora) - new Date(second.dataHora)
      : new Date(second.dataHora) - new Date(first.dataHora));
  }, [items, tab]);

  return (
    <Screen>
      <Title eyebrow="Seus horários" subtitle="Acompanhe próximos atendimentos e consulte seu histórico.">Minha agenda</Title>
      <View style={styles.tabs}>{tabs.map((name) => {
        const selected = tab === name;
        return <Pressable key={name} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => setTab(name)} style={[styles.tab, selected && styles.selectedTab]}><Text style={[styles.tabText, selected && styles.selectedTabText]}>{name}</Text></Pressable>;
      })}</View>
      <StateMessage loading={loading} error={error} onRetry={load} empty={!loading && !error && !shown.length ? `Nenhum agendamento em ${tab.toLowerCase()}.` : null} />
      {!loading && !error && !shown.length ? <Button title="Procurar serviços" icon="search-outline" secondary onPress={() => navigation.navigate('Buscar')} /> : null}
      {shown.map((appointment) => <AppointmentCard key={appointment.id} item={appointment} onPress={() => navigation.getParent()?.navigate('AppointmentDetails', { appointment })} />)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, padding: spacing.xxs, borderRadius: radius.md, marginBottom: spacing.lg },
  tab: { flex: 1, minHeight: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xs },
  selectedTab: { backgroundColor: colors.card },
  tabText: { color: colors.muted, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  selectedTabText: { color: colors.primaryDark, fontWeight: '900' },
});
