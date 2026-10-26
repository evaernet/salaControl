import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { parseApiError } from '@/api/errors';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ESTADOS_CAMA, ESTADOS_LISTA } from '@/constants/camas';
import { colors, radius, shadow } from '@/constants/theme';
import { salaService } from '@/services/salaService';
import type { Cama, Sala } from '@/types/sala';

// Tablero de solo lectura: cada sala con sus camas y el estado de cada una.
export function TableroCamas() {
  const [salas, setSalas] = useState<Sala[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Se recarga cada vez que se vuelve a la pantalla.
  useFocusEffect(
    useCallback(() => {
      salaService
        .list()
        .then((datos) => {
          setSalas(datos);
          setError(null);
        })
        .catch((e) => setError(parseApiError(e).message));
    }, []),
  );

  if (error) return <ErrorBanner message={error} />;
  if (!salas) return null;

  if (salas.length === 0) {
    return <Text style={styles.empty}>Todavía no hay salas cargadas. Las crea el administrador.</Text>;
  }

  return (
    <>
      {salas.map((sala) => (
        <View key={sala.id} style={styles.sala}>
          <Text style={styles.salaNombre}>{sala.nombre}</Text>
          <Text style={styles.resumen}>{resumen(sala.camas ?? [])}</Text>
          <View style={styles.grilla}>
            {(sala.camas ?? []).map((cama) => (
              <CamaTile key={cama.id} cama={cama} />
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

function CamaTile({ cama }: { cama: Cama }) {
  const { label, color } = ESTADOS_CAMA[cama.estado];

  return (
    <View style={[styles.cama, { borderTopColor: color }]}>
      <Text style={styles.camaNumero}>{cama.numero}</Text>
      <Text style={[styles.camaEstado, { color }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

// "8 libres · 1 en limpieza" (solo los estados que aparecen).
function resumen(camas: Cama[]): string {
  if (camas.length === 0) return 'Sin camas';

  return ESTADOS_LISTA.map((estado) => {
    const cantidad = camas.filter((c) => c.estado === estado).length;
    return cantidad > 0 ? `${cantidad} ${ESTADOS_CAMA[estado].label.toLowerCase()}` : null;
  })
    .filter(Boolean)
    .join(' · ');
}

const styles = StyleSheet.create({
  sala: {
    gap: 8,
  },
  salaNombre: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  resumen: {
    fontSize: 13,
    color: colors.muted,
  },
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cama: {
    width: '30%',
    flexGrow: 1,
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderTopWidth: 4,
    padding: 8,
    ...shadow,
  },
  camaNumero: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  camaEstado: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginVertical: 12,
  },
});
