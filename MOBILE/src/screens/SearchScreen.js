import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { SectionHeader, StateMessage, Title } from '../components/UI';
import SalonCard from '../components/SalonCard';
import { useSalons } from '../hooks/useCatalog';
import { colors, radius, spacing } from '../styles/theme';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const { salons, loading, error, reload } = useSalons();
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
  const shown = useMemo(() => salons.filter((salon) => `${salon.nome} ${salon.endereco || ''}`.toLocaleLowerCase('pt-BR').includes(normalizedQuery)), [salons, normalizedQuery]);

  return (
    <Screen>
      <Title eyebrow="Catálogo" subtitle="Pesquise nos estabelecimentos ativos disponíveis no TimeRight.">Encontre seu salão</Title>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={22} color={colors.primaryDark} />
        <TextInput
          accessibilityLabel="Buscar salões"
          placeholder="Nome ou endereço"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="words"
          returnKeyType="search"
          style={styles.input}
        />
      </View>
      {!loading && !error ? <SectionHeader title={normalizedQuery ? `Resultados (${shown.length})` : `Todos (${shown.length})`} action="Lista completa" onAction={() => navigation.getParent()?.navigate('Salons')} /> : null}
      <StateMessage loading={loading} error={error} onRetry={reload} empty={!loading && !error && !shown.length ? 'Nenhum salão corresponde à sua busca.' : null} />
      {shown.map((salon) => <SalonCard key={salon.id} salon={salon} onPress={() => navigation.getParent()?.navigate('SalonDetails', { salonId: salon.id })} />)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, minHeight: 54, color: colors.text, fontSize: 15 },
});
