import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { UserForm, type UserFormValues } from '@/components/users/UserForm';
import { userService } from '@/services/userService';

export default function CreateUserScreen() {
  const router = useRouter();

  async function handleSubmit(values: UserFormValues) {
    await userService.create({
      nombre: values.nombre,
      apellido: values.apellido,
      email: values.email,
      password: values.password,
      rol: values.rol,
    });
    router.dismissTo('/admin/users');
  }

  return (
    <Screen edges={['bottom']}>
      <UserForm mode="create" submitLabel="Crear usuario" onSubmit={handleSubmit} />
    </Screen>
  );
}
