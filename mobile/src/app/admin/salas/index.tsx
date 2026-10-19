import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { parseApiError } from '@/api/errors';
import { ActionCard } from '@/components/panel/ActionCard';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { colors, radius, shadow } from '@/constants/theme';
import { salaService } from '@/services/salaService';
import type { Sala } from '@/types/sala';

export default function SalasScreen() {
  const router = useRouter();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [nombre, setNombre] = useState('');
  const [camas, setCamas] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(() => {
    salaService
      .list()
      .then(setSalas)
      .catch((e) => setError(parseApiError(e).message));
  }, []);

  // Se recarga al entrar y al volver de una sala.
  useFocusEffect(cargar);

  async function crearSala() {
    if (!nombre.trim()) {
      setError('Ingresá el nombre de la sala.');
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      await salaService.create(nombre.trim(), Number(camas) || 0);
      setNombre('');
      setCamas('');
      cargar();
    } catch (e) {
      const apiError = parseApiError(e);
      setError(Object.values(apiError.fieldErrors)[0] ?? apiError.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Screen edges={['bottom']}>
      <View style={styles.card}>
        <Text style={styles.title}>Nueva sala</Text>
        <ErrorBanner message={error} />
        <TextField label="Nombre" value={nombre} onChangeText={setNombre} placeholder="Ej: Aislamiento" />
        <TextField
          label="Cantidad de camas"
          value={camas}
          onChangeText={setCamas}
          keyboardType="number-pad"
          placeholder="Ej: 10"
          hint="Después se pueden agregar o quitar."
        />
        <Button title="Crear sala" icon="add" onPress={crearSala} loading={guardando} />
      </View>

      {salas.length === 0 ? <Text style={styles.empty}>Todavía no hay salas.</Text> : null}

      {salas.map((sala) => (
        <ActionCard
          key={sala.id}
          icon="bed-outline"
          title={sala.nombre}
          description={sala.camas_count === 1 ? '1 cama' : `${sala.camas_count} camas`}
          onPress={() => router.push({ pathname: '/admin/salas/[id]', params: { id: sala.id } })}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius,
    padding: 16,
    marginBottom: 8,
    ...shadow,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
  },
});
