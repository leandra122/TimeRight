import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '../styles/theme';

export function Title({ children, subtitle, eyebrow }) {
  return <View style={styles.titleWrap}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}<Text style={styles.title}>{children}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>;
}

export function Field({ label, ...props }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} style={styles.input} {...props} /></View>;
}

export function Button({ title, onPress, disabled, secondary = false, danger = false, icon }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: Boolean(disabled) }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, danger && styles.dangerButton, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>{icon ? <Ionicons name={icon} size={19} color={secondary ? colors.primaryDark : colors.white} /> : null}<Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text></Pressable>;
}

export function Card({ children, onPress }) {
  const Component = onPress ? Pressable : View;
  const cardStyle = onPress ? ({ pressed }) => [styles.card, pressed && styles.pressed] : styles.card;
  return <Component accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={cardStyle}>{children}</Component>;
}

export function StateMessage({ loading, error, empty, onRetry }) {
  if (loading) return <View style={styles.state}><ActivityIndicator color={colors.primary} /><Text style={styles.subtitle}>Carregando...</Text></View>;
  if (error) return <View style={styles.state}><Text style={styles.error}>{error}</Text>{onRetry ? <Button title="Tentar novamente" onPress={onRetry} secondary /> : null}</View>;
  if (empty) return <View style={styles.emptyWrap}><Ionicons name="sparkles-outline" size={28} color={colors.secondary} /><Text style={styles.empty}>{empty}</Text></View>;
  return null;
}

export function SectionHeader({ title, action, onAction }) {
  return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{action ? <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}</View>;
}

export function Badge({ children, tone = 'primary' }) {
  return <View style={[styles.badge, tone === 'success' && styles.badgeSuccess, tone === 'muted' && styles.badgeMuted, tone === 'danger' && styles.badgeDanger]}><Text style={[styles.badgeText, tone === 'success' && styles.badgeSuccessText, tone === 'muted' && styles.badgeMutedText, tone === 'danger' && styles.badgeDangerText]}>{children}</Text></View>;
}

const styles = StyleSheet.create({
  titleWrap: { marginBottom: spacing.lg }, eyebrow: { color: colors.primaryDark, fontSize: typography.caption, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: spacing.xs }, title: { fontSize: typography.title, lineHeight: 36, fontWeight: '900', color: colors.text, letterSpacing: -0.5 }, subtitle: { color: colors.muted, marginTop: spacing.xs, fontSize: typography.small, lineHeight: 21 },
  field: { marginBottom: spacing.md }, label: { color: colors.text, fontWeight: '700', marginBottom: spacing.xs, fontSize: typography.small }, input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, minHeight: 52, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.text, fontSize: typography.body },
  button: { minHeight: 52, borderRadius: radius.md, backgroundColor: colors.primaryDark, flexDirection: 'row', gap: spacing.xs, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, marginVertical: spacing.xs }, buttonText: { color: colors.white, fontWeight: '800', fontSize: typography.body }, secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }, secondaryText: { color: colors.primaryDark }, dangerButton: { backgroundColor: colors.danger }, disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled, opacity: 0.75 }, pressed: { opacity: 0.76, transform: [{ scale: 0.995 }] },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  state: { alignItems: 'center', gap: spacing.md, padding: spacing.xl }, error: { color: colors.danger, textAlign: 'center', lineHeight: 21 }, emptyWrap: { alignItems: 'center', gap: spacing.sm, backgroundColor: colors.secondarySoft, borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.md }, empty: { color: colors.muted, textAlign: 'center', lineHeight: 21 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, marginBottom: spacing.md }, sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '900' }, sectionAction: { color: colors.primaryDark, fontWeight: '800', paddingVertical: spacing.xs },
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.primarySoft }, badgeText: { color: colors.primaryDark, fontSize: typography.caption, fontWeight: '800', textTransform: 'uppercase' }, badgeSuccess: { backgroundColor: colors.successSoft }, badgeSuccessText: { color: colors.success }, badgeMuted: { backgroundColor: colors.surfaceMuted }, badgeMutedText: { color: colors.muted }, badgeDanger: { backgroundColor: colors.dangerSoft }, badgeDangerText: { color: colors.danger },
});

export const uiStyles = styles;
