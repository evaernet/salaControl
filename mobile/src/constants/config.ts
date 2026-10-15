import Constants from 'expo-constants';

// URL de la API. Si no está EXPO_PUBLIC_API_URL en el .env, se usa la IP de la compu
// que corre Expo con el puerto 8000. Así anda en el celular con Expo Go sin configurar
// nada, siempre que Laravel se levante con --host=0.0.0.0
function urlPorDefecto(): string {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:8000/api` : 'http://localhost:8000/api';
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL || urlPorDefecto();
