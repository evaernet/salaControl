import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ROLES, ROLES_LISTA } from '@/constants/roles';
import { colors, radius } from '@/constants/theme';
import type { Rol } from '@/types/user';

interface RolePickerProps {
  value: Rol;
  onChange: (rol: Rol) => void;
  disabled?: boolean;
  error?: string;
}

export function RolePicker({ value, onChange, disabled = false, error }: RolePickerProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Rol</Text>
      <View style={[styles.options, disabled && styles.disabled]}>
        {ROLES_LISTA.map((rol) => {
          const elegido = rol === value;
          return (
            <Pressable
              key={rol}
              accessibilityRole="radio"
              accessibilityState={{ selected: elegido, disabled }}
              disabled={disabled}
              onPress={() => onChange(rol)}
              style={[styles.option, elegido && styles.optionSelected]}
            >
              <Text style={[styles.optionText, elegido && styles.optionTextSelected]}>{ROLES[rol].label}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
    gap: 6,
  },
  disabled: {
    opacity: 0.6,
  },
  option: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    backgroundColor: colors.surface,
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
  error: {
    fontSize: 13,
    color: colors.danger,
  },
});
