<?php

namespace App\Models;

use App\Enums\Rol;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

// Personal que usa la app. Los usuarios los crea el administrador, no hay registro.
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, SoftDeletes;

    protected $fillable = ['nombre', 'apellido', 'email', 'password', 'rol', 'activo'];

    protected $hidden = ['password', 'remember_token'];

    protected $attributes = ['activo' => true];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'rol' => Rol::class,
            'activo' => 'boolean',
        ];
    }

    public function esAdministrador(): bool
    {
        return $this->rol === Rol::Administrador;
    }

    // Borra todos los tokens: el usuario tiene que volver a iniciar sesión.
    public function cerrarSesiones(): void
    {
        $this->tokens()->delete();
    }
}
