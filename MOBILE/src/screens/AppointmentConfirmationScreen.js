import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Button, Card, Title, uiStyles } from '../components/UI';
import { dateTime, money } from '../utils/format';
import { colors, spacing } from '../styles/theme';

export default function AppointmentConfirmationScreen({ route, navigation }) {
  const { appointment } = route.params;
  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.successIcon}><Ionicons name="checkmark" size={38} color={colors.white} /></View>
      <Title subtitle="Seu horário foi registrado e já aparece na sua agenda.">Agendamento confirmado</Title>
      <Card>
        <Text style={styles.salon}>{appointment.salao?.nome}</Text>
        <Text style={styles.service}>{appointment.servico?.nome}</Text>
        <View style={styles.divider} />
        <Text style={styles.date}>{dateTime(appointment.dataHora)}</Text>
        <Text style={uiStyles.subtitle}>Profissional: {appointment.funcionario?.nome}</Text>
        {appointment.duracao ? <Text style={uiStyles.subtitle}>Duração: {appointment.duracao} min</Text> : null}
        {appointment.servico?.preco != null ? <Text style={styles.price}>{money(appointment.servico.preco)}</Text> : null}
      </Card>
      <Button title="Visualizar agendamento" icon="calendar-outline" onPress={() => navigation.replace('AppointmentDetails', { appointment })} />
      <Button title="Voltar ao início" icon="home-outline" secondary onPress={() => navigation.navigate('Main', { screen: 'Home' })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', flexGrow: 1, maxWidth: 560, alignSelf: 'center' },
  successIcon: { width: 72, height: 72, borderRadius: 26, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  salon: { color: colors.text, fontSize: 20, fontWeight: '900' },
  service: { color: colors.primaryDark, fontSize: 17, fontWeight: '800', marginTop: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  date: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: spacing.xs },
  price: { color: colors.primaryDark, fontWeight: '900', marginTop: spacing.sm },
});
