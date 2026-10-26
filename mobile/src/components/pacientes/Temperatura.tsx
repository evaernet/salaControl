import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { parseApiError } from '@/api/errors';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { TextField } from '@/components/ui/TextField';
import { colors, radius, shadow } from '@/constants/theme';
import { pacienteService } from '@/services/pacienteService';
import type { Control } from '@/types/paciente';
import { fechaLegible } from '@/utils/fechas';
import { grados } from '@/utils/numeros';

interface TemperaturaProps {
  pacienteId: number;
  controles: Control[];
  // Si es false solo se muestra el historial (por ejemplo, paciente de alta).
  puedeRegistrar: boolean;
  onCambio: () => void;
}

function colorDe(temperatura: number): string {
  if (temperatura >= 38) return colors.danger;
  if (temperatura < 36) return colors.gotitas;
  return colors.text;
}

export function Temperatura({ pacienteId, controles, puedeRegistrar, onCambio }: TemperaturaProps) {
  const [valor, setValor] = useState('');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function registrar() {
    const temperatura = Number(valor.replace(',', '.'));
    if (!valor || Number.isNaN(temperatura)) {
      setError('Ingresá la temperatura, por ejemplo 37,5.');
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      await pacienteService.registrarTemperatura(pacienteId, temperatura, observacion);
      setValor('');
      setObservacion('');
      onCambio();
    } catch (e) {
      const apiError = parseApiError(e);
      setError(Object.values(apiError.fieldErrors)[0] ?? apiError.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Temperatura</Text>

      {puedeRegistrar ? (
        <>
          <ErrorBanner message={error} />
          <View style={styles.fila}>
            <View style={styles.campo}>
              <TextField label="°C" value={valor} onChangeText={setValor} keyboardType="decimal-pad" placeholder="37,5" />
            </View>
            <View style={styles.boton}>
              <Button title="Registrar" onPress={registrar} loading={guardando} />
            </View>
          </View>
          <TextField label="Observación (opcional)" value={observacion} onChangeText={setObservacion} />
        </>
      ) : null}

      {controles.length === 0 ? <Text style={styles.vacio}>Todavía no hay controles.</Text> : null}
      {controles.map((control) => (
        <View key={control.id} style={styles.control}>
          <Text style={[styles.grados, { color: colorDe(control.temperatura) }]}>{grados(control.temperatura)}</Text>
          <View style={styles.detalle}>
            <Text style={styles.cuando}>
              {fechaLegible(control.fecha)}
              {control.user ? ` · ${control.user.nombre} ${control.user.apellido}` : ''}
            </Text>
            {control.observacion ? <Text style={styles.observacion}>{control.observacion}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius,
    padding: 16,
    ...shadow,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  campo: {
    flex: 1,
  },
  boton: {
    flex: 1,
  },
  vacio: {
    color: colors.muted,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
  },
  grados: {
    width: 76,
    fontSize: 18,
    fontWeight: '800',
  },
  detalle: {
    flex: 1,
  },
  cuando: {
    fontSize: 13,
    color: colors.muted,
  },
  observacion: {
    fontSize: 14,
    color: colors.textSoft,
  },
});
