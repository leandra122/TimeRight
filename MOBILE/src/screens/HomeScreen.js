import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Button, SectionHeader, StateMessage, Title } from '../components/UI';
import SalonCard from '../components/SalonCard';
import { useAuth } from '../context/AuthContext';
import { useSalons } from '../hooks/useCatalog';
import { colors, radius, spacing } from '../styles/theme';

export default function HomeScreen({ navigation }) {
  const { session } = useAuth();
  const { salons, loading, error, reload } = useSalons();
  const firstName = session.user.nome?.trim().split(' ')[0] || 'cliente';
  const openSalon = (salonId) => navigation.getParent()?.navigate('SalonDetails', { salonId });

  return (
    <Screen>
      <Title eyebrow="Seu momento, no tempo certo" subtitle="Encontre um estabelecimento e escolha um horário disponível.">Olá, {firstName}</Title>
      <Pressable accessibilityRole="search" accessibilityLabel="Buscar salões" onPress={() => navigation.navigate('Buscar')} style={styles.search}>
        <Ionicons name="search-outline" size={22} color={colors.primaryDark} />
        <Text style={styles.searchText}>Busque por nome ou endereço</Text>
        <Ionicons name="arrow-forward" size={20} color={colors.muted} />
      </Pressable>
      <View style={styles.hero}>
        <View style={styles.heroIcon}><Ionicons name="calendar-outline" size={25} color={colors.primaryDark} /></View>
        <View style={styles.heroText}><Text style={styles.heroTitle}>Sua agenda em um só lugar</Text><Text style={styles.heroSubtitle}>Consulte próximos horários e seu histórico.</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir minha agenda" onPress={() => navigation.navigate('Agenda')} hitSlop={8}><Ionicons name="chevron-forward" size={24} color={colors.primaryDark} /></Pressable>
      </View>
      <SectionHeader title="Estabelecimentos" action="Ver todos" onAction={() => navigation.getParent()?.navigate('Salons')} />
      <StateMessage loading={loading} error={error} onRetry={reload} empty={!loading && !error && !salons.length ? 'Nenhum salão ativo disponível no momento.' : null} />
      {salons.slice(0, 4).map((salon) => <SalonCard key={salon.id} salon={salon} onPress={() => openSalon(salon.id)} />)}
      {!loading && !error && salons.length > 0 ? <Button title="Explorar todos os salões" icon="storefront-outline" secondary onPress={() => navigation.getParent()?.navigate('Salons')} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  searchText: { flex: 1, color: colors.muted, fontSize: 15 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  heroIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1 },
  heroTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  heroSubtitle: { color: colors.muted, marginTop: 3, lineHeight: 19 },
});
