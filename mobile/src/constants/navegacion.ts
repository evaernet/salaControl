import { colors } from './theme';

// Barra de título azul de las pantallas internas (admin y sala).
export const opcionesEncabezado = {
  headerStyle: { backgroundColor: colors.brand },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '700' as const },
  headerTitleAlign: 'center' as const,
  headerBackTitle: 'Volver',
  contentStyle: { backgroundColor: colors.background },
};
