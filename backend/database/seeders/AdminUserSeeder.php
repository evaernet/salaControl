<?php

namespace Database\Seeders;

use App\Enums\Rol;
use App\Models\User;
use Illuminate\Database\Seeder;

// Crea el primer administrador con los datos de ADMIN_EMAIL y ADMIN_PASSWORD del .env.
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = strtolower(env('ADMIN_EMAIL', 'admin@salacontrol.test'));

        User::firstOrCreate(['email' => $email], [
            'nombre' => 'Administrador',
            'apellido' => 'SalaControl',
            'password' => env('ADMIN_PASSWORD', 'Admin1234'),
            'rol' => Rol::Administrador,
        ]);

        $this->command?->info("Administrador listo: $email");
    }
}
