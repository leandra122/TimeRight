import { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';
import Screen from '../components/Screen'; import { Button, Card, StateMessage, Title, uiStyles } from '../components/UI';
import { catalogApi } from '../api/services'; import { getApiError } from '../api/client'; import { isActive, money } from '../utils/format';

export default function SalonDetailsScreen({ route, navigation }) {
  const { salonId } = route.params; const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [service, setService] = useState(null); const [employee, setEmployee] = useState(null);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const [salon, services, employees] = await Promise.all([catalogApi.salon(salonId), catalogApi.services(salonId), catalogApi.employees(salonId)]); setData({ salon: salon.data, services: (services.data || []).filter(isActive), employees: employees.data || [] }); } catch (e) { setError(getApiError(e, 'Não foi possível carregar o salão.')); } finally { setLoading(false); } }, [salonId]);
  useEffect(() => { load(); }, [load]);
  if (loading || error || !data) return <Screen><StateMessage loading={loading} error={error} onRetry={load} /></Screen>;
  return <Screen><Title subtitle={[data.salon.endereco, data.salon.telefone].filter(Boolean).join(' • ')}>{data.salon.nome}</Title>
    <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 12 }}>Escolha um serviço</Text><StateMessage empty={!data.services.length ? 'Nenhum serviço ativo disponível.' : null} />
    {data.services.map((s) => <Card key={s.id} onPress={() => setService(s)}><Text style={{ fontWeight: '800', color: service?.id === s.id ? '#B83F58' : '#321D27' }}>{s.nome}</Text>{s.descricao ? <Text style={uiStyles.subtitle}>{s.descricao}</Text> : null}<Text>{money(s.preco)} • {s.duracao} min</Text></Card>)}
    <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 12 }}>Escolha um funcionário</Text><Text style={uiStyles.subtitle}>Neste MVP, qualquer funcionário ativo do salão pode atender qualquer serviço ativo.</Text><StateMessage empty={!data.employees.length ? 'Nenhum funcionário ativo disponível.' : null} />
    {data.employees.map((f) => <Card key={f.id} onPress={() => setEmployee(f)}><Text style={{ fontWeight: '800', color: employee?.id === f.id ? '#B83F58' : '#321D27' }}>{f.nome}</Text>{f.funcao ? <Text>{f.funcao}</Text> : null}</Card>)}
    <Button title="Continuar para data e horário" disabled={!service || !employee} onPress={() => navigation.navigate('NewAppointment', { salon: data.salon, service, employee })} />
  </Screen>;
}
