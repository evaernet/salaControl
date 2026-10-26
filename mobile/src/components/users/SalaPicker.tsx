import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';
import { salaService } from '@/services/salaService';
import type { Sala } from '@/types/sala';

interface SalaPickerProps {
  value: number | null;
  onChange: (salaId: number | null) => void;
  error?: string;
}

// Elige la sala del usuario. "Todas" deja la sala vacía.
export function SalaPicker({ value, onChange, error }: SalaPickerProps) {
  const [salas, setSalas] = useState<Sala[]>([]);

  useEffect(() => {
    salaService
      .list()
      .then(setSalas)
      .catch(() => setSalas([]));
  }, []);

  const opciones = [{ id: null, nombre: 'Todas' }, ...salas.map((s) => ({ id: s.id as number | null, nombre: s.nombre }))];

  return (
    <View style={styles.field}>
      <Text style={styles.label}>Sala</Text>
      <View style={styles.options}>
        {opciones.map((opcion) => {
          const elegida = opcion.id === value;
          return (
            <Pressable
              key={opcion.id ?? 'todas'}
              accessibilityRole="radio"
              accessibilityState={{ selected: elegida }}
              onPress={() => onChange(opcion.id)}
              style={[styles.option, elegida && styles.optionSelected]}
            >
              <Text style={[styles.optionText, elegida && styles.optionTextSelected]}>{opcion.nombre}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={error ? styles.error : styles.hint}>
        {error ?? 'Con "Todas" puede ver todas las salas.'}
      </Text>
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
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  option: {
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  optionSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSoft,
  },
  optionTextSelected: {
    color: colors.white,
  },
  hint: {
    fontSize: 13,
    color: colors.muted,
  },
  error: {
    fontSize: 13,
    color: colors.danger,
  },
});
