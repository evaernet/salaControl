import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { parseApiError } from '@/api/errors';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Opciones } from '@/components/ui/Opciones';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { AISLAMIENTOS, AISLAMIENTOS_LISTA } from '@/constants/camas';
import { colors } from '@/constants/theme';
import { pacienteService } from '@/services/pacienteService';
import type { Aislamiento } from '@/types/paciente';

const VACIO = {
  nombre: '',
  apellido: '',
  fecha_nacimiento: '',
  peso: '',
  diagnostico: '',
  diagnosticos_base: '',
  alergias: '',
  obra_social: '',
  acompanante: '',
  acompanante_telefono: '',
};

type Campo = keyof typeof VACIO | 'aislamiento';

// "10/3/2022" -> "2022-03-10". Devuelve null si no tiene ese formato.
function fechaParaApi(texto: string): string | null {
  const partes = texto.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!partes) return null;
  const [, dia, mes, anio] = partes;
  return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

export default function InternarScreen() {
  const { cama, numero, sala } = useLocalSearchParams<{ cama: string; numero: string; sala: string }>();
  const router = useRouter();
  const [datos, setDatos] = useState(VACIO);
  const [aislamiento, setAislamiento] = useState<Aislamiento>('contacto');
  const [errores, setErrores] = useState<Partial<Record<Campo, string>>>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function cambiar(campo: keyof typeof VACIO, valor: string) {
    setDatos({ ...datos, [campo]: valor });
    setErrores({ ...errores, [campo]: undefined });
  }

  async function internar() {
    const fecha = fechaParaApi(datos.fecha_nacimiento);
    const faltan: typeof errores = {};
    if (!datos.nombre.trim()) faltan.nombre = 'Ingresá el nombre.';
    if (!datos.apellido.trim()) faltan.apellido = 'Ingresá el apellido.';
    if (!fecha) faltan.fecha_nacimiento = 'Usá el formato DD/MM/AAAA.';
    if (!datos.diagnostico.trim()) faltan.diagnostico = 'Ingresá el diagnóstico.';
    setErrores(faltan);
    if (Object.keys(faltan).length > 0 || !fecha) {
      setMensaje('Revisá los datos marcados.');
      return;
    }

    setMensaje(null);
    setGuardando(true);
    try {
      await pacienteService.internar({
        ...datos,
        cama_id: Number(cama),
        fecha_nacimiento: fecha,
        peso: datos.peso ? Number(datos.peso.replace(',', '.')) : null,
        aislamiento,
      });
      router.back();
    } catch (e) {
      const error = parseApiError(e);
      setErrores(error.fieldErrors);
      setMensaje(Object.keys(error.fieldErrors).length > 0 ? 'Revisá los datos marcados.' : error.message);
      setGuardando(false);
    }
  }

  return (
    <Screen edges={['bottom']}>
      <Text style={styles.cama}>
        Cama {numero}
        {sala ? ` · ${sala}` : ''}
      </Text>
      <ErrorBanner message={mensaje} />

      <TextField label="Nombre" value={datos.nombre} onChangeText={(t) => cambiar('nombre', t)} error={errores.nombre} autoCapitalize="words" />
      <TextField label="Apellido" value={datos.apellido} onChangeText={(t) => cambiar('apellido', t)} error={errores.apellido} autoCapitalize="words" />
      <TextField
        label="Fecha de nacimiento"
        value={datos.fecha_nacimiento}
        onChangeText={(t) => cambiar('fecha_nacimiento', t)}
        error={errores.fecha_nacimiento}
        placeholder="DD/MM/AAAA"
        keyboardType="numbers-and-punctuation"
      />
      <TextField
        label="Peso (kg)"
        value={datos.peso}
        onChangeText={(t) => cambiar('peso', t)}
        error={errores.peso}
        keyboardType="decimal-pad"
        placeholder="Ej: 16,5"
      />
      <TextField label="Diagnóstico" value={datos.diagnostico} onChangeText={(t) => cambiar('diagnostico', t)} error={errores.diagnostico} />

      <Opciones
        label="Aislamiento"
        opciones={AISLAMIENTOS_LISTA.map((a) => ({ valor: a, texto: AISLAMIENTOS[a].label, color: AISLAMIENTOS[a].color }))}
        valor={aislamiento}
        onChange={setAislamiento}
        error={errores.aislamiento}
        hint={AISLAMIENTOS[aislamiento].cuidados}
      />

      <TextField
        label="Alergias"
        value={datos.alergias}
        onChangeText={(t) => cambiar('alergias', t)}
        error={errores.alergias}
        hint="Dejalo vacío si no tiene alergias conocidas."
      />
      <TextField
        label="Diagnósticos de base"
        value={datos.diagnosticos_base}
        onChangeText={(t) => cambiar('diagnosticos_base', t)}
        error={errores.diagnosticos_base}
        multiline
      />
      <TextField label="Obra social" value={datos.obra_social} onChangeText={(t) => cambiar('obra_social', t)} error={errores.obra_social} />
      <TextField label="Acompañante" value={datos.acompanante} onChangeText={(t) => cambiar('acompanante', t)} error={errores.acompanante} autoCapitalize="words" />
      <TextField
        label="Teléfono del acompañante"
        value={datos.acompanante_telefono}
        onChangeText={(t) => cambiar('acompanante_telefono', t)}
        error={errores.acompanante_telefono}
        keyboardType="phone-pad"
      />

      <Button title="Internar" icon="bed-outline" onPress={internar} loading={guardando} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cama: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand,
  },
});
