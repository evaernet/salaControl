import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { parseApiError } from '@/api/errors';
import { PacienteForm } from '@/components/pacientes/PacienteForm';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { pacienteService } from '@/services/pacienteService';
import type { Paciente } from '@/types/paciente';

export default function EditarPacienteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pacienteService
      .get(Number(id))
      .then(setPaciente)
      .catch((e) => setError(parseApiError(e).message));
  }, [id]);

  if (!paciente) {
    return error ? (
      <Screen edges={['bottom']}>
        <ErrorBanner message={error} />
      </Screen>
    ) : (
      <LoadingScreen />
    );
  }

  return (
    <Screen edges={['bottom']}>
      <PacienteForm
        paciente={paciente}
        submitLabel="Guardar cambios"
        onSubmit={async (datos) => {
          await pacienteService.editar(paciente.id, datos);
          router.back();
        }}
      />
    </Screen>
  );
}
