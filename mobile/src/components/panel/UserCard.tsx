import { StyleSheet, Text, View } from 'react-native';

import { RoleBadge } from '@/components/ui/Badge';
import { colors, radius, shadow } from '@/constants/theme';
import type { User } from '@/types/user';
import { iniciales, nombreCompleto } from '@/utils/format';

// Datos del usuario que inició sesión.
export function UserCard({ user }: { user: User }) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{iniciales(user)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {nombreCompleto(user)}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {user.email}
        </Text>
        {user.sala ? <Text style={styles.email}>Sala {user.sala}</Text> : null}
        <RoleBadge rol={user.rol} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius,
    padding: 16,
    ...shadow,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 3,
  },
});
