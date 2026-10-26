import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

export function Alertas({ alertas }: { alertas: string[] }) {
  if (alertas.length === 0) return null;

  return (
    <View style={styles.caja} accessibilityRole="alert">
      {alertas.map((alerta) => (
        <View key={alerta} style={styles.fila}>
          <Ionicons name="warning" size={18} color={colors.danger} />
          <Text style={styles.texto}>{alerta}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    gap: 6,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius,
    padding: 12,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  texto: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
});
