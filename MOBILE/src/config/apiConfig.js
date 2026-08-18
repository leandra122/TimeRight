const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const fallbackUrl = 'http://localhost:8080';

export const API_URL = (configuredUrl || fallbackUrl).replace(/\/+$/, '');
export const API_CONFIGURATION_WARNING = configuredUrl
  ? null
  : 'API não configurada. Usando localhost, adequado apenas para web ou emulador com encaminhamento.';

export function validateApiUrl() {
  try {
    const url = new URL(API_URL);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}
