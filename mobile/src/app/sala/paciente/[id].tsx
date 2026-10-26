import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { parseApiError } from '@/api/errors';
import { useAuth } from '@/auth/AuthContext';
import { Alertas } from '@/components/pacientes/Alertas';
import { Temperatura } from '@/components/pacientes/Temperatura';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { AISLAMIENTOS } from '@/constants/camas';
import { colors, radius, shadow } from '@/constants/theme';
import { pacienteService } from '@/services/pacienteService';
import { salaService } from '@/services/salaService';
import type { Paciente } from '@/types/paciente';
import type { Cama } from '@/types/sala';
import { confirmar } from '@/utils/confirm';
import { diaDeInternacion, edad, fechaLegible } from '@/utils/fechas';

export default function PacienteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [camasLibres, setCamasLibres] = useState<Cama[]>([]);
  const [eligiendoCama, setEligiendoCama] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(() => {
    pacienteService
      .get(Number(id))
      .then(setPaciente)
      .catch((e) => setError(parseApiError(e).message));
  }, [id]);

  // Se recarga al volver de editar.
  useFocusEffect(cargar);

  if (!paciente) {
    return error ? (
      <Screen edges={['bottom']}>
        <ErrorBanner message={error} />
      </Screen>
    ) : (
      <LoadingScreen />
    );
  }

  const actual = paciente;
  const internado = !actual.fecha_alta && actual.cama;
  const esMedico = user?.rol === 'medico';
  const aislamiento = AISLAMIENTOS[actual.aislamiento];

  async function mostrarCamasLibres() {
    if (!actual.cama) return;
    try {
      const sala = await salaService.get(actual.cama.sala_id);
      setCamasLibres((sala.camas ?? []).filter((c) => !c.paciente && c.estado === 'libre'));
      setEligiendoCama(true);
    } catch (e) {
      setError(parseApiError(e).message);
    }
  }

  async function cambiarA(cama: Cama) {
    const ok = await confirmar('Cambiar de cama', `¿Pasar a ${actual.nombre} a la cama ${cama.numero}?`, 'Cambiar');
    if (!ok) return;

    setOcupado(true);
    try {
      setPaciente(await pacienteService.cambiarCama(actual.id, cama.id));
      setEligiendoCama(false);
      setError(null);
    } catch (e) {
      setError(parseApiError(e).message);
    } finally {
      setOcupado(false);
    }
  }

  async function darAlta() {
    const ok = await confirmar(
      'Dar el alta',
      `¿Dar el alta a ${actual.nombre} ${actual.apellido}? La cama queda en limpieza.`,
      'Dar el alta',
    );
    if (!ok) return;

    setOcupado(true);
    try {
      await pacienteService.alta(actual.id);
      router.back();
    } catch (e) {
      setError(parseApiError(e).message);
      setOcupado(false);
    }
  }

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: internado ? `Cama ${actual.cama?.numero}` : 'Paciente' }} />
      <ErrorBanner message={error} />

      <View style={styles.card}>
        <Text style={styles.nombre}>
          {actual.apellido}, {actual.nombre}
        </Text>
        <Text style={styles.subtitulo}>
          {edad(actual.fecha_nacimiento)}
          {actual.peso ? ` · ${String(actual.peso).replace('.', ',')} kg` : ''}
        </Text>
        <Text style={styles.subtitulo}>
          {internado
            ? `Cama ${actual.cama?.numero} · ${actual.cama?.sala?.nombre} · Día ${diaDeInternacion(actual.fecha_ingreso)} de internación`
            : `Dado de alta el ${fechaLegible(actual.fecha_alta ?? '')}`}
        </Text>
      </View>

      <Alertas alertas={actual.alertas} />

      {/* Lo que hay que saber antes de entrar a la habitación */}
      <View style={[styles.aviso, { backgroundColor: actual.alergias ? colors.dangerSoft : colors.surface }]}>
        <Text style={[styles.avisoTitulo, { color: actual.alergias ? colors.danger : colors.muted }]}>
          {actual.alergias ? `Alergias: ${actual.alergias}` : 'Sin alergias conocidas'}
        </Text>
      </View>
      {actual.aislamiento !== 'ninguno' ? (
        <View style={[styles.aviso, { borderLeftColor: aislamiento.color }]}>
          <Text style={[styles.avisoTitulo, { color: aislamiento.color }]}>Aislamiento de {aislamiento.label.toLowerCase()}</Text>
          <Text style={styles.avisoTexto}>{aislamiento.cuidados}</Text>
        </View>
      ) : null}

      <Temperatura
        pacienteId={actual.id}
        controles={actual.controles ?? []}
        puedeRegistrar={!!internado}
        onCambio={cargar}
      />

      <View style={styles.card}>
        <Dato titulo="Diagnóstico" valor={actual.diagnostico} />
        <Dato titulo="Diagnósticos de base" valor={actual.diagnosticos_base} />
        <Dato titulo="Fecha de nacimiento" valor={fechaLegible(actual.fecha_nacimiento)} />
        <Dato titulo="Obra social" valor={actual.obra_social} />
        <Dato
          titulo="Acompañante"
          valor={[actual.acompanante_parentesco, actual.acompanante, actual.acompanante_telefono].filter(Boolean).join(' · ') || null}
        />
        <Dato titulo="Ingreso" valor={fechaLegible(actual.fecha_ingreso)} />
      </View>

      {internado && esMedico ? (
        <>
          <Button
            title="Editar datos"
            variant="outline"
            icon="create-outline"
            onPress={() => router.push({ pathname: '/sala/editar', params: { id: actual.id } })}
          />
          {eligiendoCama ? (
            <View style={styles.card}>
              <Text style={styles.datoTitulo}>Elegí la cama nueva</Text>
              {camasLibres.length === 0 ? <Text style={styles.datoValor}>No hay camas libres en la sala.</Text> : null}
              <View style={styles.camas}>
                {camasLibres.map((cama) => (
                  <Pressable key={cama.id} onPress={() => cambiarA(cama)} disabled={ocupado} style={styles.camaLibre}>
                    <Text style={styles.camaLibreTexto}>Cama {cama.numero}</Text>
                  </Pressable>
                ))}
              </View>
              <Button title="Cancelar" variant="outline" onPress={() => setEligiendoCama(false)} />
            </View>
          ) : (
            <Button title="Cambiar de cama" variant="outline" icon="swap-horizontal" onPress={mostrarCamasLibres} />
          )}
          <Button title="Dar el alta" variant="danger" icon="exit-outline" onPress={darAlta} loading={ocupado} />
        </>
      ) : null}
    </Screen>
  );
}

// Un dato de la ficha. Si está vacío, muestra un guion.
function Dato({ titulo, valor }: { titulo: string; valor: string | null }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.datoTitulo}>{titulo}</Text>
      <Text style={styles.datoValor}>{valor || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius,
    padding: 16,
    ...shadow,
  },
  nombre: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitulo: {
    fontSize: 14,
    color: colors.textSoft,
  },
  aviso: {
    gap: 2,
    borderRadius: radius,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    backgroundColor: colors.surface,
    padding: 12,
  },
  avisoTitulo: {
    fontSize: 15,
    fontWeight: '700',
  },
  avisoTexto: {
    fontSize: 14,
    color: colors.textSoft,
  },
  dato: {
    gap: 2,
    paddingVertical: 4,
  },
  datoTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  datoValor: {
    fontSize: 15,
    color: colors.text,
  },
  camas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 6,
  },
  camaLibre: {
    borderWidth: 1.5,
    borderColor: colors.success,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  camaLibreTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
});
