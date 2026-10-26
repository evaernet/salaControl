import { useState } from 'react';

import { parseApiError } from '@/api/errors';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Opciones } from '@/components/ui/Opciones';
import { TextField } from '@/components/ui/TextField';
import { AISLAMIENTOS, AISLAMIENTOS_LISTA } from '@/constants/camas';
import type { DatosPaciente } from '@/services/pacienteService';
import type { Aislamiento, Paciente } from '@/types/paciente';

const PARENTESCOS = ['Madre', 'Padre', 'Abuela', 'Abuelo', 'Tía', 'Tío', 'Tutor/a', 'Otro'];

// Lo que se escribe en el formulario (todo texto, como lo tipea el usuario).
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

type Campos = typeof VACIO;
type Errores = Partial<Record<keyof Campos | 'aislamiento' | 'acompanante_parentesco', string>>;

// Mientras se escribe la fecha, pone las barras solas: "10032022" -> "10/03/2022".
function conBarras(texto: string): string {
  const numeros = texto.replace(/\D/g, '').slice(0, 8);
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

// "10/03/2022" -> "2022-03-10". null si está incompleta.
function fechaParaApi(texto: string): string | null {
  const partes = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return partes ? `${partes[3]}-${partes[2]}-${partes[1]}` : null;
}

// Datos de un paciente ya cargado, listos para el formulario de edición.
function desdePaciente(p: Paciente): Campos {
  const [anio, mes, dia] = p.fecha_nacimiento.split('-');
  return {
    nombre: p.nombre,
    apellido: p.apellido,
    fecha_nacimiento: `${dia}/${mes}/${anio}`,
    peso: p.peso ? String(p.peso).replace('.', ',') : '',
    diagnostico: p.diagnostico,
    diagnosticos_base: p.diagnosticos_base ?? '',
    alergias: p.alergias ?? '',
    obra_social: p.obra_social ?? '',
    acompanante: p.acompanante ?? '',
    acompanante_telefono: p.acompanante_telefono ?? '',
  };
}

interface PacienteFormProps {
  paciente?: Paciente;
  submitLabel: string;
  // Si la API falla tiene que lanzar el error: el formulario lo muestra.
  onSubmit: (datos: DatosPaciente) => Promise<void>;
}

// Formulario para internar y para editar un paciente.
export function PacienteForm({ paciente, submitLabel, onSubmit }: PacienteFormProps) {
  const [datos, setDatos] = useState<Campos>(paciente ? desdePaciente(paciente) : VACIO);
  const [aislamiento, setAislamiento] = useState<Aislamiento>(paciente?.aislamiento ?? 'contacto');
  const [parentesco, setParentesco] = useState<string | null>(paciente?.acompanante_parentesco ?? null);
  const [errores, setErrores] = useState<Errores>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function cambiar(campo: keyof Campos, valor: string) {
    setDatos({ ...datos, [campo]: valor });
    setErrores({ ...errores, [campo]: undefined });
  }

  async function guardar() {
    const fecha = fechaParaApi(datos.fecha_nacimiento);
    const faltan: Errores = {};
    if (!datos.nombre.trim()) faltan.nombre = 'Ingresá el nombre.';
    if (!datos.apellido.trim()) faltan.apellido = 'Ingresá el apellido.';
    if (!fecha) faltan.fecha_nacimiento = 'Completá la fecha: día, mes y año.';
    if (!datos.diagnostico.trim()) faltan.diagnostico = 'Ingresá el diagnóstico.';
    setErrores(faltan);
    if (!fecha || Object.keys(faltan).length > 0) {
      setMensaje('Revisá los datos marcados.');
      return;
    }

    setMensaje(null);
    setGuardando(true);
    try {
      await onSubmit({
        ...datos,
        fecha_nacimiento: fecha,
        peso: datos.peso ? Number(datos.peso.replace(',', '.')) : null,
        aislamiento,
        acompanante_parentesco: parentesco,
      });
    } catch (e) {
      const error = parseApiError(e);
      setErrores(error.fieldErrors);
      setMensaje(Object.keys(error.fieldErrors).length > 0 ? 'Revisá los datos marcados.' : error.message);
      setGuardando(false);
    }
  }

  return (
    <>
      <ErrorBanner message={mensaje} />

      <TextField label="Nombre" value={datos.nombre} onChangeText={(t) => cambiar('nombre', t)} error={errores.nombre} autoCapitalize="words" />
      <TextField label="Apellido" value={datos.apellido} onChangeText={(t) => cambiar('apellido', t)} error={errores.apellido} autoCapitalize="words" />
      <TextField
        label="Fecha de nacimiento"
        value={datos.fecha_nacimiento}
        onChangeText={(t) => cambiar('fecha_nacimiento', conBarras(t))}
        error={errores.fecha_nacimiento}
        placeholder="DD/MM/AAAA"
        keyboardType="number-pad"
        maxLength={10}
        hint="Escribí solo los números, las barras se ponen solas."
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

      <Opciones<string | null>
        label="Acompañante"
        opciones={PARENTESCOS.map((p) => ({ valor: p, texto: p }))}
        valor={parentesco}
        onChange={(p) => setParentesco(p === parentesco ? null : p)}
        error={errores.acompanante_parentesco}
      />
      <TextField
        label="Nombre del acompañante"
        value={datos.acompanante}
        onChangeText={(t) => cambiar('acompanante', t)}
        error={errores.acompanante}
        autoCapitalize="words"
      />
      <TextField
        label="Teléfono del acompañante"
        value={datos.acompanante_telefono}
        onChangeText={(t) => cambiar('acompanante_telefono', t)}
        error={errores.acompanante_telefono}
        keyboardType="phone-pad"
      />

      <Button title={submitLabel} icon="checkmark" onPress={guardar} loading={guardando} />
    </>
  );
}
