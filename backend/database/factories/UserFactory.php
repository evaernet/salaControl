<?php

namespace Database\Factories;

use App\Enums\Rol;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => fake()->firstName(),
            'apellido' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'rol' => Rol::Medico,
            'activo' => true,
        ];
    }

    public function administrador(): static
    {
        return $this->state(fn () => ['rol' => Rol::Administrador]);
    }

    public function medico(): static
    {
        return $this->state(fn () => ['rol' => Rol::Medico]);
    }

    public function enfermero(): static
    {
        return $this->state(fn () => ['rol' => Rol::Enfermero]);
    }

    public function inactivo(): static
    {
        return $this->state(fn () => ['activo' => false]);
    }
}
