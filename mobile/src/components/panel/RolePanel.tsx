import { TableroCamas } from '@/components/camas/TableroCamas';
import { Screen } from '@/components/ui/Screen';

import { PanelTitle } from './PanelTitle';

// Pantalla principal del médico y del enfermero: el tablero de camas de su sala.
export function RolePanel() {
  return (
    <Screen header={<PanelTitle />}>
      <TableroCamas />
    </Screen>
  );
}
