import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../styles/theme';

export function Title({ children, subtitle }) {
  return <View style={styles.titleWrap}><Text style={styles.title}>{children}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>;
}

export function Field({ label, ...props }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} style={styles.input} {...props} /></View>;
}

export function Button({ title, onPress, disabled, secondary = false }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, disabled && styles.disabled, pressed && !disabled && styles.pressed]}><Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text></Pressable>;
}

export function Card({ children, onPress }) {
  const Component = onPress ? Pressable : View;
  return <Component onPress={onPress} style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}>{children}</Component>;
}

export function StateMessage({ loading, error, empty, onRetry }) {
  if (loading) return <View style={styles.state}><ActivityIndicator color={colors.primary} /><Text style={styles.subtitle}>Carregando...</Text></View>;
  if (error) return <View style={styles.state}><Text style={styles.error}>{error}</Text>{onRetry ? <Button title="Tentar novamente" onPress={onRetry} secondary /> : null}</View>;
  if (empty) return <Text style={styles.empty}>{empty}</Text>;
  return null;
}

export const uiStyles = styles;
const styles = StyleSheet.create({
  titleWrap: { marginBottom: spacing.lg }, title: { fontSize: 28, fontWeight: '800', color: colors.text }, subtitle: { color: colors.muted, marginTop: spacing.xs, fontSize: 15, lineHeight: 21 },
  field: { marginBottom: spacing.md }, label: { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }, input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, minHeight: 50, paddingHorizontal: spacing.md, color: colors.text },
  button: { minHeight: 50, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, marginVertical: spacing.xs }, buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 }, secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }, secondaryText: { color: colors.primaryDark }, disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled }, pressed: { opacity: 0.75 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  state: { alignItems: 'center', gap: spacing.md, padding: spacing.xl }, error: { color: colors.danger, textAlign: 'center' }, empty: { color: colors.muted, textAlign: 'center', padding: spacing.xl },
});
