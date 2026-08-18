import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'timeright.session';

async function setValue(value) {
  if (Platform.OS === 'web') return AsyncStorage.setItem(SESSION_KEY, value);
  return SecureStore.setItemAsync(SESSION_KEY, value);
}

async function getValue() {
  if (Platform.OS === 'web') return AsyncStorage.getItem(SESSION_KEY);
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function saveSession(session) {
  await setValue(JSON.stringify(session));
}

export async function loadSession() {
  const raw = await getValue();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession() {
  if (Platform.OS === 'web') return AsyncStorage.removeItem(SESSION_KEY);
  return SecureStore.deleteItemAsync(SESSION_KEY);
}
