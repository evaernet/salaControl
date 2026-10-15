import { StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/theme';

// Va dentro de la franja azul de arriba (prop header de Screen).
export function PanelTitle({ title }: { title: string }) {
  return (
    <>
      <Text style={styles.app}>SalaControl</Text>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.subtitle}>Sala de Aislamiento · Hospital Pediátrico</Text>
    </>
  );
}

const styles = StyleSheet.create({
  app: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  title: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.white,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    textAlign: 'center',
    color: colors.brandSoft,
  },
});
