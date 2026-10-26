import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { AISLAMIENTOS, ESTADOS_CAMA } from '@/constants/camas';
import { colors, radius, shadow } from '@/constants/theme';
import { salaService } from '@/services/salaService';
import type { Cama } from '@/types/sala';
import { diaDeInternacion, edad } from '@/utils/fechas';

interface CamaCardProps {
  cama: Cama;
  sala: string;
  // Se llama después de cambiar algo, para recargar el tablero.
  onCambio: () => void;
}

export function CamaCard({ cama, sala, onCambio }: CamaCardProps) {
  const router = useRouter();
  const paciente = cama.paciente;

  if (!paciente) {
    return <CamaSinPaciente cama={cama} sala={sala} onCambio={onCambio} />;
  }

  const aislamiento = AISLAMIENTOS[paciente.aislamiento];

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/sala/paciente/[id]', params: { id: paciente.id } })}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.numero, { backgroundColor: colors.brand }]}>
        <Text style={[styles.numeroTexto, { color: colors.white }]}>{cama.numero}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={1}>
          {paciente.apellido}, {paciente.nombre}
          <Text style={styles.edad}> · {edad(paciente.fecha_nacimiento)}</Text>
        </Text>
        <Text style={styles.diagnostico} numberOfLines={1}>
          {paciente.diagnostico}
        </Text>
        <View style={styles.etiquetas}>
          {paciente.aislamiento !== 'ninguno' ? <Etiqueta texto={aislamiento.label} color={aislamiento.color} /> : null}
          {paciente.alergias ? <Etiqueta texto="Alergias" color={colors.danger} /> : null}
          <Text style={styles.dia}>Día {diaDeInternacion(paciente.fecha_ingreso)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.brand} />
    </Pressable>
  );
}

// Cama libre, en limpieza o fuera de servicio.
function CamaSinPaciente({ cama, sala, onCambio }: CamaCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const { label, color } = ESTADOS_CAMA[cama.estado];

  async function marcarLibre() {
    setGuardando(true);
    try {
      await salaService.cambiarEstado(cama.id, 'libre');
      onCambio();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <View style={[styles.card, styles.cardVacia]}>
      <View style={[styles.numero, { borderColor: color, borderWidth: 2 }]}>
        <Text style={[styles.numeroTexto, { color }]}>{cama.numero}</Text>
      </View>
      <Text style={[styles.estado, { color }]}>{label}</Text>
      {cama.estado !== 'libre' ? (
        <Pressable onPress={marcarLibre} disabled={guardando} style={styles.accion} hitSlop={6}>
          <Text style={styles.accionTexto}>{guardando ? 'Guardando…' : 'Marcar libre'}</Text>
        </Pressable>
      ) : null}
      {cama.estado === 'libre' && user?.rol === 'medico' ? (
        <Pressable
          onPress={() => router.push({ pathname: '/sala/internar', params: { cama: cama.id, numero: cama.numero, sala } })}
          style={[styles.accion, styles.accionPrincipal]}
          hitSlop={6}
        >
          <Text style={[styles.accionTexto, styles.accionPrincipalTexto]}>+ Internar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Etiqueta({ texto, color }: { texto: string; color: string }) {
  return (
    <View style={[styles.etiqueta, { borderColor: color }]}>
      <View style={[styles.punto, { backgroundColor: color }]} />
      <Text style={[styles.etiquetaTexto, { color }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius,
    padding: 12,
    ...shadow,
  },
  pressed: {
    backgroundColor: colors.brandSoft,
  },
  cardVacia: {
    paddingVertical: 10,
  },
  numero: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTexto: {
    fontSize: 20,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  edad: {
    fontWeight: '400',
    color: colors.muted,
  },
  diagnostico: {
    fontSize: 14,
    color: colors.textSoft,
  },
  etiquetas: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  etiqueta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  punto: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  etiquetaTexto: {
    fontSize: 12,
    fontWeight: '700',
  },
  dia: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  estado: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  accion: {
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  accionPrincipal: {
    backgroundColor: colors.brand,
  },
  accionPrincipalTexto: {
    color: colors.white,
  },
  accionTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand,
  },
});
