import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../styles/theme';

export default function Screen({ children, scroll = true, contentStyle, topInset }) {
  const navigatorType = useNavigationState((state) => state.type);
  const includeTopInset = topInset ?? navigatorType === 'tab';
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </ScrollView>
  ) : <View style={styles.center}><View style={[styles.content, styles.flex, contentStyle]}>{children}</View></View>;
  return (
    <SafeAreaView
      style={styles.safe}
      edges={includeTopInset ? ['top', 'bottom', 'left', 'right'] : ['bottom', 'left', 'right']}
    >
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center' },
  content: { width: '100%', maxWidth: 720, paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
});
