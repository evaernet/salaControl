import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { parseApiError } from '@/api/errors';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { UserListItem } from '@/components/users/UserListItem';
import { colors, spacing } from '@/constants/theme';
import { userService } from '@/services/userService';
import type { User } from '@/types/user';

export default function UsersListScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setUsers(await userService.list());
      setError(null);
    } catch (e) {
      setError(parseApiError(e).message);
      setUsers((actual) => actual ?? []);
    }
  }, []);

  // Se recarga al entrar y al volver de crear o editar.
  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar]),
  );

  async function refrescar() {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  }

  if (users === null) {
    return <LoadingScreen />;
  }

  const activos = users.filter((u) => u.activo).length;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refrescando}
        onRefresh={refrescar}
        ListHeaderComponent={
          <View style={styles.header}>
            <ErrorBanner message={error} />
            <Text style={styles.summary}>
              {users.length} {users.length === 1 ? 'usuario' : 'usuarios'} · {activos} {activos === 1 ? 'activo' : 'activos'}
            </Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Todavía no hay usuarios.</Text>}
        renderItem={({ item }) => (
          <UserListItem
            user={item}
            onPress={() => router.push({ pathname: '/admin/users/[id]', params: { id: item.id } })}
          />
        )}
      />
      <View style={styles.footer}>
        <Button
          title="Crear usuario"
          icon="person-add-outline"
          onPress={() => router.push('/admin/users/create')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summary: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  separator: {
    height: spacing.sm,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
});
