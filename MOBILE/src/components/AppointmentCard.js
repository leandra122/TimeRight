import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Card, uiStyles } from './UI';
import { dateTime, money } from '../utils/format';
import { colors, spacing } from '../styles/theme';

function statusTone(status) {
  const normalized = String(status).toUpperCase();
  if (normalized === 'CANCELADO') return 'danger';
  if (normalized === 'CONCLUIDO') return 'muted';
  return 'success';
}

export default function AppointmentCard({ item, onPress }) {
  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="calendar-outline" size={21} color={colors.primaryDark} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.salon}>{item.salao?.nome}</Text>
          <Text style={styles.date}>{dateTime(item.dataHora)}</Text>
        </View>
        <Badge tone={statusTone(item.status)}>{item.status}</Badge>
      </View>
      <View style={styles.divider} />
      <Text style={styles.service}>{item.servico?.nome} · {item.duracao} min</Text>
      <Text style={uiStyles.subtitle}>Com {item.funcionario?.nome}</Text>
      <Text style={styles.price}>{money(item.servico?.preco)}</Text>
      {item.observacoes ? <Text style={uiStyles.subtitle} numberOfLines={2}>{item.observacoes}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  headerContent: { flex: 1 },
  salon: { color: colors.text, fontSize: 17, fontWeight: '900' },
  date: { color: colors.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  service: { color: colors.text, fontWeight: '700' },
  price: { color: colors.primaryDark, fontWeight: '800', marginTop: spacing.xs },
});
