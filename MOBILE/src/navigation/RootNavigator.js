import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/theme';
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
const icons = { Home: 'home-outline', Buscar: 'search-outline', Salões: 'business-outline', Agenda: 'calendar-outline', Perfil: 'person-outline' };

function MainTabs() {
  return <Tabs.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.primaryDark, tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} color={color} size={size} /> })}>
    <Tabs.Screen name="Home" component={HomeScreen} />
    <Tabs.Screen name="Buscar" component={SearchScreen} />
    <Tabs.Screen name="Salões" component={SalonsScreen} />
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
