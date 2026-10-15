import { StyleSheet, Text } from 'react-native';

import { ROLES } from '@/constants/roles';
import { colors } from '@/constants/theme';
import type { Rol } from '@/types/user';

// Etiquetas chicas: el rol y el aviso de usuario inactivo.

export function RoleBadge({ rol }: { rol: Rol }) {
  return <Text style={styles.tag}>{ROLES[rol].label}</Text>;
}

export function InactiveBadge() {
  return <Text style={[styles.tag, styles.inactive]}>Inactivo</Text>;
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: '700',
    color: colors.brandDark,
    backgroundColor: colors.brandSoft,
  },
  inactive: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
});
