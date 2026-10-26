import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InactiveBadge, RoleBadge } from '@/components/ui/Badge';
import { colors, radius, shadow } from '@/constants/theme';
import type { User } from '@/types/user';

export function UserListItem({ user, onPress }: { user: User; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.info, !user.activo && styles.inactive]}>
        <Text style={styles.name} numberOfLines={1}>
          {user.apellido}, {user.nombre}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {user.email}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {user.sala ? `Sala ${user.sala}` : 'Todas las salas'}
        </Text>
        <View style={styles.badges}>
          <RoleBadge rol={user.rol} />
          {!user.activo ? <InactiveBadge /> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.brand} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...shadow,
  },
  pressed: {
    backgroundColor: colors.brandSoft,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  inactive: {
    opacity: 0.6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontSize: 13,
    color: colors.muted,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
});
