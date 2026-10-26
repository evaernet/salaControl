import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { parseApiError } from '@/api/errors';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Opciones } from '@/components/ui/Opciones';
import { TextField } from '@/components/ui/TextField';
import { colors, radius, shadow } from '@/constants/theme';
import { pacienteService } from '@/services/pacienteService';
import type { Medicacion } from '@/types/paciente';
import { confirmar } from '@/utils/confirm';
import { diaDeTratamiento, estaActiva, proximasDosis } from '@/utils/medicacion';

const VIAS = ['Oral', 'Endovenosa', 'Intramuscular', 'Subcutánea', 'Inhalatoria', 'Tópica'];
const FRECUENCIAS = [4, 6, 8, 12, 24];

interface MedicacionListaProps {
  pacienteId: number;
  medicaciones: Medicacion[];
  // Solo el médico indica y suspende.
  esMedico: boolean;
  internado: boolean;
  onCambio: () => void;
}

export function MedicacionLista({ pacienteId, medicaciones, esMedico, internado, onCambio }: MedicacionListaProps) {
  const [indicando, setIndicando] = useState(false);
  const activas = medicaciones.filter(estaActiva);
  const anteriores = medicaciones.filter((m) => !estaActiva(m));

  async function suspender(medicacion: Medicacion) {
    const ok = await confirmar('Suspender', `¿Suspender ${medicacion.nombre}?`, 'Suspender');
    if (!ok) return;
    await pacienteService.suspenderMedicacion(medicacion.id);
    onCambio();
  }

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Medicación</Text>

      {activas.length === 0 ? <Text style={styles.vacio}>Sin medicación indicada.</Text> : null}
      {activas.map((m) => {
        const proximas = proximasDosis(m);
        return (
          <View key={m.id} style={styles.item}>
            <View style={styles.itemTexto}>
              <Text style={styles.nombre}>
                {m.nombre} {m.dosis}
              </Text>
              <Text style={styles.detalle}>
                {m.via} · cada {m.cada_horas} h · {diaDeTratamiento(m)}
              </Text>
              {proximas.length > 0 ? <Text style={styles.proximas}>Próximas dosis: {proximas.join(', ')}</Text> : null}
            </View>
            {esMedico && internado ? (
              <Pressable onPress={() => suspender(m)} hitSlop={8}>
                <Text style={styles.suspender}>Suspender</Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}

      {anteriores.length > 0 ? (
        <Text style={styles.anteriores}>
          Terminadas o suspendidas: {anteriores.map((m) => m.nombre).join(', ')}
        </Text>
      ) : null}

      {esMedico && internado ? (
        indicando ? (
          <FormularioMedicacion
            pacienteId={pacienteId}
            onListo={() => {
              setIndicando(false);
              onCambio();
            }}
            onCancelar={() => setIndicando(false)}
          />
        ) : (
          <Button title="Indicar medicación" variant="outline" icon="add" onPress={() => setIndicando(true)} />
        )
      ) : null}
    </View>
  );
}

function FormularioMedicacion({
  pacienteId,
  onListo,
  onCancelar,
}: {
  pacienteId: number;
  onListo: () => void;
  onCancelar: () => void;
}) {
  const [nombre, setNombre] = useState('');
  const [dosis, setDosis] = useState('');
  const [via, setVia] = useState('Oral');
  const [cadaHoras, setCadaHoras] = useState(8);
  const [dias, setDias] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function indicar() {
    if (!nombre.trim() || !dosis.trim()) {
      setError('Completá el medicamento y la dosis.');
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      await pacienteService.indicarMedicacion(pacienteId, {
        nombre: nombre.trim(),
        dosis: dosis.trim(),
        via,
        cada_horas: cadaHoras,
        dias: dias ? Number(dias) : null,
      });
      onListo();
    } catch (e) {
      const apiError = parseApiError(e);
      setError(Object.values(apiError.fieldErrors)[0] ?? apiError.message);
      setGuardando(false);
    }
  }

  return (
    <View style={styles.formulario}>
      <ErrorBanner message={error} />
      <TextField label="Medicamento" value={nombre} onChangeText={setNombre} placeholder="Ej: Amoxicilina" />
      <TextField label="Dosis" value={dosis} onChangeText={setDosis} placeholder="Ej: 250 mg" />
      <Opciones label="Vía" opciones={VIAS.map((v) => ({ valor: v, texto: v }))} valor={via} onChange={setVia} />
      <Opciones
        label="Cada"
        opciones={FRECUENCIAS.map((h) => ({ valor: h, texto: `${h} h` }))}
        valor={cadaHoras}
        onChange={setCadaHoras}
      />
      <TextField
        label="Días de tratamiento"
        value={dias}
        onChangeText={setDias}
        keyboardType="number-pad"
        placeholder="Ej: 7"
        hint="Dejalo vacío si no tiene fecha de fin. La primera dosis es ahora."
      />
      <Button title="Indicar" icon="checkmark" onPress={indicar} loading={guardando} />
      <Button title="Cancelar" variant="outline" onPress={onCancelar} />
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
  vacio: {
    color: colors.muted,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
  },
  itemTexto: {
    flex: 1,
    gap: 2,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  detalle: {
    fontSize: 14,
    color: colors.textSoft,
  },
  proximas: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brand,
  },
  suspender: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  anteriores: {
    fontSize: 13,
    color: colors.muted,
  },
  formulario: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 12,
  },
});
