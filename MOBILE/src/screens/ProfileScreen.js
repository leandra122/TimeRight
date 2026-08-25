import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Button, Card, Title, uiStyles } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../styles/theme';

export default function ProfileScreen() {
  const { session, logout } = useAuth();

  function exit() {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined'
        && window.confirm('Sair da conta? Sua sessão será removida deste dispositivo.');
      if (confirmed) logout();
      return;
    }
    Alert.alert('Sair da conta?', 'Sua sessão será removida deste dispositivo.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <Screen>
      <Title eyebrow="Sua conta" subtitle="Os dados abaixo são os disponíveis na sua sessão.">Perfil</Title>
      <Card>
        <View style={styles.profileHeader}><View style={styles.avatar}><Ionicons name="person-outline" size={30} color={colors.primaryDark} /></View><View style={styles.profileText}><Text style={styles.name}>{session.user.nome}</Text><Text style={uiStyles.subtitle}>{session.user.email}</Text></View></View>
        <View style={styles.role}><Ionicons name="shield-checkmark-outline" size={19} color={colors.secondary} /><Text style={styles.roleText}>Conta de cliente</Text></View>
      </Card>
      <Card>
        <View style={styles.aboutHeader}><Ionicons name="time-outline" size={23} color={colors.primaryDark} /><Text style={styles.aboutTitle}>Sobre o TimeRight</Text></View>
        <Text style={uiStyles.subtitle}>Consulte estabelecimentos e gerencie seus próprios agendamentos com segurança.</Text>
        <Text style={styles.version}>Versão 1.0.0</Text>
      </Card>
      <Button title="Sair da conta" icon="log-out-outline" danger onPress={exit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 60, height: 60, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  profileText: { flex: 1 },
  name: { color: colors.text, fontSize: 20, fontWeight: '900' },
  role: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.secondarySoft, borderRadius: radius.md, padding: spacing.sm, marginTop: spacing.md },
  roleText: { color: colors.secondary, fontWeight: '800' },
  aboutHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  aboutTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  version: { color: colors.muted, fontSize: 12, marginTop: spacing.md },
});
