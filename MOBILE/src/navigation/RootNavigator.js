import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, shadows } from '../styles/theme';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SalonsScreen from '../screens/SalonsScreen';
import AgendaScreen from '../screens/AgendaScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SalonDetailsScreen from '../screens/SalonDetailsScreen';
import NewAppointmentScreen from '../screens/NewAppointmentScreen';
import AppointmentConfirmationScreen from '../screens/AppointmentConfirmationScreen';
import AppointmentDetailsScreen from '../screens/AppointmentDetailsScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const icons = { Home: 'home-outline', Buscar: 'search-outline', Agenda: 'calendar-outline', Perfil: 'person-outline' };

function MainTabs() {
  return <Tabs.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: colors.primaryDark,
    tabBarInactiveTintColor: colors.muted,
    tabBarHideOnKeyboard: true,
    tabBarLabelStyle: styles.tabLabel,
    tabBarStyle: styles.tabBar,
    tabBarItemStyle: styles.tabItem,
    tabBarIcon: ({ color, size, focused }) => <View style={focused && styles.activeIcon}><Ionicons name={focused ? icons[route.name].replace('-outline', '') : icons[route.name]} color={color} size={focused ? size + 1 : size} /></View>,
  })}>
    <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Início' }} />
    <Tabs.Screen name="Buscar" component={SearchScreen} />
    <Tabs.Screen name="Agenda" component={AgendaScreen} />
    <Tabs.Screen name="Perfil" component={ProfileScreen} />
  </Tabs.Navigator>;
}

export default function RootNavigator() {
  const { session, restoring } = useAuth();
  if (restoring) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}><ActivityIndicator color={colors.primary} /></View>;
  return <Stack.Navigator screenOptions={{ headerTintColor: colors.primaryDark, headerStyle: { backgroundColor: colors.background } }}>
    {session ? <>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Salons" component={SalonsScreen} options={{ title: 'Salões' }} />
      <Stack.Screen name="SalonDetails" component={SalonDetailsScreen} options={{ title: 'Detalhes do salão' }} />
      <Stack.Screen name="NewAppointment" component={NewAppointmentScreen} options={{ title: 'Novo agendamento' }} />
      <Stack.Screen name="AppointmentConfirmation" component={AppointmentConfirmationScreen} options={{ title: 'Agendamento confirmado', headerBackVisible: false }} />
      <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} options={{ title: 'Detalhes do agendamento' }} />
    </> : <>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar conta' }} />
    </>}
  </Stack.Navigator>;
}

const styles = StyleSheet.create({
  tabBar: { height: 72, paddingTop: 7, paddingBottom: 9, backgroundColor: colors.card, borderTopColor: colors.border, ...shadows.card },
  tabItem: { minHeight: 54 },
  tabLabel: { fontSize: 12, fontWeight: '700' },
  activeIcon: { minWidth: 40, height: 28, paddingHorizontal: 9, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
});
