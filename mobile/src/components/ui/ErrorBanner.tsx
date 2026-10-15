import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Ionicons name="alert-circle" size={20} color={colors.danger} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  text: {
    flex: 1,
    color: colors.danger,
    fontSize: 14,
    fontWeight: '500',
  },
});
