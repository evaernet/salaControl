import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { parseApiError } from '@/api/errors';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { colors, radius, shadow } from '@/constants/theme';
import { salaService } from '@/services/salaService';
import type { Cama, Sala } from '@/types/sala';

import { CamaCard } from './CamaCard';

// Tablero de la sala: un resumen arriba y una tarjeta por cama.
export function TableroCamas() {
  const [salas, setSalas] = useState<Sala[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(() => {
    salaService
      .list()
      .then((datos) => {
        setSalas(datos);
        setError(null);
      })
      .catch((e) => setError(parseApiError(e).message));
  }, []);

  // Se recarga cada vez que se vuelve a la pantalla (por ejemplo, después de internar).
  useFocusEffect(cargar);

  if (error) return <ErrorBanner message={error} />;
  if (!salas) return null;

  if (salas.length === 0) {
    return <Text style={styles.empty}>Todavía no hay salas cargadas. Las crea el administrador.</Text>;
  }

  return (
    <>
      {salas.map((sala) => {
        const camas = ordenar(sala.camas ?? []);
        return (
          <View key={sala.id} style={styles.sala}>
            {salas.length > 1 ? <Text style={styles.salaNombre}>{sala.nombre}</Text> : null}
            <Resumen camas={camas} />
            {camas.map((cama) => (
              <CamaCard key={cama.id} cama={cama} sala={sala.nombre} onCambio={cargar} />
            ))}
          </View>
        );
      })}
    </>
  );
}

// Primero las ocupadas, después las que hay que liberar y al final las libres.
function ordenar(camas: Cama[]): Cama[] {
  const orden = (c: Cama) => (c.paciente ? 0 : c.estado === 'libre' ? 2 : 1);
  return [...camas].sort((a, b) => orden(a) - orden(b) || a.numero - b.numero);
}

function Resumen({ camas }: { camas: Cama[] }) {
  const ocupadas = camas.filter((c) => c.paciente).length;
  const libres = camas.filter((c) => !c.paciente && c.estado === 'libre').length;
  const otras = camas.length - ocupadas - libres;

  return (
    <View style={styles.resumen}>
      <Numero valor={ocupadas} texto="Ocupadas" color={colors.brand} />
      <Numero valor={libres} texto="Libres" color={colors.success} />
      <Numero valor={otras} texto="Sin usar" color={colors.accent} />
    </View>
  );
}

function Numero({ valor, texto, color }: { valor: number; texto: string; color: string }) {
  return (
    <View style={styles.numero}>
      <Text style={[styles.numeroValor, { color }]}>{valor}</Text>
      <Text style={styles.numeroTexto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sala: {
    gap: 10,
  },
  salaNombre: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  resumen: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  numero: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius,
    paddingVertical: 10,
    ...shadow,
  },
  numeroValor: {
    fontSize: 26,
    fontWeight: '800',
  },
  numeroTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginVertical: 12,
  },
});
