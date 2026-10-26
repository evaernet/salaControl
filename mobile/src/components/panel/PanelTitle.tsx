import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';
import { ROLES } from '@/constants/roles';
import { colors } from '@/constants/theme';

// Va dentro de la franja azul de arriba (prop header de Screen):
// saludo, rol y sala del usuario, y el botón para salir arriba a la derecha.
export function PanelTitle() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [saliendo, setSaliendo] = useState(false);

  if (!user) return null;

  let lugar = user.sala ?? 'Todas las salas';
  if (user.rol === 'administrador') lugar = 'Administración';

  async function salir() {
    setSaliendo(true);
    await signOut();
  }

  return (
    <>
      <Pressable
        onPress={salir}
        disabled={saliendo}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        hitSlop={12}
        style={[styles.salir, { top: insets.top + 12 }]}
      >
        {saliendo ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Ionicons name="log-out-outline" size={26} color={colors.white} />
        )}
      </Pressable>

      <Text style={styles.app}>SalaControl</Text>
      <Text style={styles.title} accessibilityRole="header">
        Hola, {user.nombre}
      </Text>
      <Text style={styles.subtitle}>
        {ROLES[user.rol].label} · {lugar}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  salir: {
    position: 'absolute',
    right: 16,
  },
  app: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  title: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.white,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    textAlign: 'center',
    color: colors.brandSoft,
  },
});
