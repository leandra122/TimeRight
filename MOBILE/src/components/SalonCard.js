import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, uiStyles } from './UI';
import { colors, spacing } from '../styles/theme';

export default function SalonCard({ salon, onPress }) {
  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Ionicons name="storefront-outline" size={23} color={colors.primaryDark} />
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{salon.nome}</Text>
          {salon.endereco ? <Text style={uiStyles.subtitle}>{salon.endereco}</Text> : null}
          {salon.telefone ? <Text style={uiStyles.subtitle}>{salon.telefone}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.muted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  name: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: 2 },
});
