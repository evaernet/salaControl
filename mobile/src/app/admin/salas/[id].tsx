import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { parseApiError } from '@/api/errors';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { ESTADOS_CAMA, ESTADOS_LISTA } from '@/constants/camas';
import { colors, radius, shadow } from '@/constants/theme';
import { salaService } from '@/services/salaService';
import type { Cama, EstadoCama, Sala } from '@/types/sala';
import { confirmar } from '@/utils/confirm';

export default function SalaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [sala, setSala] = useState<Sala | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Mientras espera a la API no se puede tocar otra cosa (evita, por ejemplo, agregar dos camas con un doble toque).
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(() => {
    salaService
      .get(Number(id))
      .then(setSala)
      .catch((e) => setError(parseApiError(e).message));
  }, [id]);

  useEffect(cargar, [cargar]);

  // Todas las acciones hacen lo mismo: llamar a la API y recargar la sala.
  async function hacer(accion: () => Promise<unknown>) {
    if (ocupado) return;
    setError(null);
    setOcupado(true);
    try {
      await accion();
      cargar();
    } catch (e) {
      setError(parseApiError(e).message);
    } finally {
      setOcupado(false);
    }
  }

  async function quitarCama(cama: Cama) {
    if (await confirmar('Quitar cama', `¿Quitar la cama ${cama.numero}?`, 'Quitar')) {
      hacer(() => salaService.quitarCama(cama.id));
    }
  }

  async function eliminarSala() {
    if (!sala) return;
    const ok = await confirmar('Eliminar sala', `¿Eliminar la sala ${sala.nombre} y todas sus camas?`, 'Eliminar');
    if (!ok) return;

    try {
      await salaService.remove(sala.id);
      router.back();
    } catch (e) {
      setError(parseApiError(e).message);
    }
  }

  if (!sala) {
    return error ? (
      <Screen edges={['bottom']}>
        <ErrorBanner message={error} />
      </Screen>
    ) : (
      <LoadingScreen />
    );
  }

  const camas = sala.camas ?? [];

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: sala.nombre }} />
      <ErrorBanner message={error} />

      <Text style={styles.summary}>{camas.length === 1 ? '1 cama' : `${camas.length} camas`}</Text>

      {camas.map((cama) => (
        <View key={cama.id} style={styles.cama}>
          <View style={styles.camaHeader}>
            <Text style={styles.camaTitle}>Cama {cama.numero}</Text>
            <Pressable onPress={() => quitarCama(cama)} disabled={ocupado} hitSlop={10} accessibilityLabel={`Quitar cama ${cama.numero}`}>
              <Ionicons name="trash-outline" size={20} color={colors.muted} />
            </Pressable>
          </View>
          <View style={styles.estados}>
            {ESTADOS_LISTA.map((estado) => (
              <EstadoBoton
                key={estado}
                estado={estado}
                elegido={cama.estado === estado}
                disabled={ocupado}
                onPress={() => hacer(() => salaService.cambiarEstado(cama.id, estado))}
              />
            ))}
          </View>
        </View>
      ))}

      <Button
        title="Agregar cama"
        icon="add"
        loading={ocupado}
        onPress={() => hacer(() => salaService.agregarCama(sala.id))}
      />
      <Button title="Eliminar sala" variant="danger" icon="trash-outline" onPress={eliminarSala} />
    </Screen>
  );
}

interface EstadoBotonProps {
  estado: EstadoCama;
  elegido: boolean;
  disabled: boolean;
  onPress: () => void;
}

function EstadoBoton({ estado, elegido, disabled, onPress }: EstadoBotonProps) {
  const { label, color } = ESTADOS_CAMA[estado];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || elegido}
      accessibilityRole="radio"
      accessibilityState={{ selected: elegido }}
      style={[styles.estado, { borderColor: color }, elegido && { backgroundColor: color }]}
    >
      <Text style={[styles.estadoText, { color: elegido ? colors.white : color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  summary: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  cama: {
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius,
    padding: 14,
    ...shadow,
  },
  camaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  camaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  estados: {
    flexDirection: 'row',
    gap: 6,
  },
  estado: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
