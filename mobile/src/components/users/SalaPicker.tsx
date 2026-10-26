import { useEffect, useState } from 'react';

import { Opciones } from '@/components/ui/Opciones';
import { salaService } from '@/services/salaService';
import type { Sala } from '@/types/sala';

interface SalaPickerProps {
  value: number | null;
  onChange: (salaId: number | null) => void;
  error?: string;
}

// Elige la sala del usuario. "Todas" deja la sala vacía.
export function SalaPicker({ value, onChange, error }: SalaPickerProps) {
  const [salas, setSalas] = useState<Sala[]>([]);

  useEffect(() => {
    salaService
      .list()
      .then(setSalas)
      .catch(() => setSalas([]));
  }, []);

  return (
    <Opciones<number | null>
      label="Sala"
      opciones={[{ valor: null, texto: 'Todas' }, ...salas.map((s) => ({ valor: s.id, texto: s.nombre }))]}
      valor={value}
      onChange={onChange}
      error={error}
      hint='Con "Todas" puede ver todas las salas.'
    />
  );
}
