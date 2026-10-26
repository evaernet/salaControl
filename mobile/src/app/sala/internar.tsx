import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { PacienteForm } from '@/components/pacientes/PacienteForm';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/theme';
import { pacienteService } from '@/services/pacienteService';

export default function InternarScreen() {
  const { cama, numero, sala } = useLocalSearchParams<{ cama: string; numero: string; sala: string }>();
  const router = useRouter();

  return (
    <Screen edges={['bottom']}>
      <Text style={styles.cama}>
        Cama {numero}
        {sala ? ` · ${sala}` : ''}
      </Text>
      <PacienteForm
        submitLabel="Internar"
        onSubmit={async (datos) => {
          await pacienteService.internar(Number(cama), datos);
          router.back();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cama: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand,
  },
});
