import Screen from '../components/Screen';
import { StateMessage, Title } from '../components/UI';
import SalonCard from '../components/SalonCard';
import { useSalons } from '../hooks/useCatalog';

export default function SalonsScreen({ navigation }) {
  const { salons, loading, error, reload } = useSalons();
  return (
    <Screen>
      <Title eyebrow="Catálogo completo" subtitle="Informações reais fornecidas pelos estabelecimentos.">Todos os salões</Title>
      <StateMessage loading={loading} error={error} onRetry={reload} empty={!loading && !error && !salons.length ? 'Nenhum salão ativo disponível.' : null} />
      {salons.map((salon) => <SalonCard key={salon.id} salon={salon} onPress={() => navigation.navigate('SalonDetails', { salonId: salon.id })} />)}
    </Screen>
  );
}
