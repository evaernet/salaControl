import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

export interface Opcion<T> {
  valor: T;
  texto: string;
  color?: string;
}

interface OpcionesProps<T> {
  label: string;
  opciones: Opcion<T>[];
  valor: T;
  onChange: (valor: T) => void;
  disabled?: boolean;
  error?: string;
  hint?: string;
}

// Botones para elegir una opción entre pocas (rol, sala, aislamiento...).
export function Opciones<T>({ label, opciones, valor, onChange, disabled = false, error, hint }: OpcionesProps<T>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.opciones, disabled && styles.disabled]}>
        {opciones.map((opcion) => {
          const elegida = opcion.valor === valor;
          const color = opcion.color ?? colors.brand;
          return (
            <Pressable
              key={String(opcion.valor)}
              accessibilityRole="radio"
              accessibilityState={{ selected: elegida, disabled }}
              disabled={disabled}
              onPress={() => onChange(opcion.valor)}
              style={[styles.opcion, elegida && { borderColor: color, backgroundColor: color }]}
            >
              <Text style={[styles.texto, elegida && styles.textoElegido]}>{opcion.texto}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSoft,
  },
  opciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  disabled: {
    opacity: 0.6,
  },
  opcion: {
    flexGrow: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  texto: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSoft,
  },
  textoElegido: {
    color: colors.white,
  },
  error: {
    fontSize: 13,
    color: colors.danger,
  },
  hint: {
    fontSize: 13,
    color: colors.muted,
  },
});
