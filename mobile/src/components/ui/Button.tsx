import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  icon?: ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ title, onPress, variant = 'primary', icon, loading = false, disabled = false }: ButtonProps) {
  const inactivo = disabled || loading;
  const color = variant === 'primary' ? colors.white : variant === 'danger' ? colors.danger : colors.brand;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [styles.base, styles[variant], (pressed || inactivo) && styles.dim]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={color} /> : null}
          <Text style={[styles.text, { color }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius,
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  outline: {
    backgroundColor: colors.surface,
    borderColor: colors.brand,
  },
  danger: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
  },
  dim: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});
