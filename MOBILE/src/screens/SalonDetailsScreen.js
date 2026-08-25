import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Badge, Button, Card, SectionHeader, StateMessage, Title, uiStyles } from '../components/UI';
import { catalogApi } from '../api/services';
import { getApiError } from '../api/client';
import { isActive, money } from '../utils/format';
import { colors, radius, spacing } from '../styles/theme';

export default function SalonDetailsScreen({ route, navigation }) {
  const { salonId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [service, setService] = useState(null);
  const [employee, setEmployee] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [salon, services, employees] = await Promise.all([
        catalogApi.salon(salonId),
        catalogApi.services(salonId),
        catalogApi.employees(salonId),
      ]);
      setData({
        salon: salon.data,
        services: (services.data || []).filter(isActive),
        employees: employees.data || [],
      });
    } catch (requestError) {
      setError(getApiError(requestError, 'Não foi possível carregar o salão.'));
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => { load(); }, [load]);
  if (loading || error || !data) return <Screen><StateMessage loading={loading} error={error} onRetry={load} /></Screen>;

  function selectService(nextService) {
    setService(nextService);
    setEmployee(null);
  }

  return (
    <Screen>
      <View style={styles.cover}><View style={styles.coverIcon}><Ionicons name="storefront-outline" size={34} color={colors.primaryDark} /></View></View>
      <Title eyebrow="Estabelecimento" subtitle={[data.salon.endereco, data.salon.telefone].filter(Boolean).join(' · ')}>{data.salon.nome}</Title>
      <SectionHeader title="1. Escolha o serviço" />
      <StateMessage empty={!data.services.length ? 'Nenhum serviço ativo disponível.' : null} />
      {data.services.map((item) => {
        const selected = service?.id === item.id;
        return <Card key={item.id} onPress={() => selectService(item)}><View style={styles.optionHeader}><View style={styles.optionContent}><Text style={[styles.optionTitle, selected && styles.selectedText]}>{item.nome}</Text>{item.descricao ? <Text style={uiStyles.subtitle}>{item.descricao}</Text> : null}</View>{selected ? <Ionicons name="checkmark-circle" size={24} color={colors.primaryDark} /> : <Ionicons name="ellipse-outline" size={24} color={colors.border} />}</View><View style={styles.meta}><Badge>{money(item.preco)}</Badge><Text style={styles.duration}>{item.duracao} min</Text></View></Card>;
      })}
      <SectionHeader title="2. Escolha o profissional" />
      {!service ? <View style={styles.guidance}><Ionicons name="information-circle-outline" size={20} color={colors.secondary} /><Text style={styles.guidanceText}>Escolha primeiro um serviço</Text></View> : <Text style={styles.helper}>Profissionais ativos deste estabelecimento.</Text>}
      {service ? <StateMessage empty={!data.employees.length ? 'Nenhum funcionário ativo disponível.' : null} /> : null}
      {service ? data.employees.map((item) => {
        const selected = employee?.id === item.id;
        return <Card key={item.id} onPress={() => setEmployee(item)}><View style={styles.optionHeader}><View style={styles.avatar}><Ionicons name="person-outline" size={20} color={colors.secondary} /></View><View style={styles.optionContent}><Text style={[styles.optionTitle, selected && styles.selectedText]}>{item.nome}</Text>{item.funcao ? <Text style={uiStyles.subtitle}>{item.funcao}</Text> : null}</View>{selected ? <Ionicons name="checkmark-circle" size={24} color={colors.primaryDark} /> : <Ionicons name="ellipse-outline" size={24} color={colors.border} />}</View></Card>;
      }) : null}
      <View style={styles.footer}><Button title="Continuar para data e horário" icon="arrow-forward-outline" disabled={!service || !employee} onPress={() => navigation.navigate('NewAppointment', { salon: data.salon, service, employee })} /></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: { height: 112, borderRadius: radius.lg, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  coverIcon: { width: 66, height: 66, borderRadius: 24, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  optionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  optionContent: { flex: 1 },
  optionTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  selectedText: { color: colors.primaryDark },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  duration: { color: colors.muted, fontWeight: '700' },
  avatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.secondarySoft, alignItems: 'center', justifyContent: 'center' },
  helper: { color: colors.muted, marginTop: -spacing.sm, marginBottom: spacing.md },
  guidance: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.secondarySoft, borderRadius: radius.md, padding: spacing.md, marginTop: -spacing.sm, marginBottom: spacing.md },
  guidanceText: { color: colors.secondary, fontWeight: '800' },
  footer: { marginTop: spacing.sm },
});
