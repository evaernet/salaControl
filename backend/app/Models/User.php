<?php

namespace App\Models;

use App\Enums\Rol;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

// Personal que usa la app. Los usuarios los crea el administrador, no hay registro.
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids;

    protected $fillable = ['nombre', 'apellido', 'email', 'password', 'rol', 'activo', 'sala_id'];

    protected $hidden = ['password', 'remember_token'];

    protected $attributes = ['activo' => true];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'rol' => Rol::class,
            'activo' => 'boolean',
            'sala_id' => 'integer',
        ];
    }

    public function sala()
    {
        return $this->belongsTo(Sala::class);
    }

    public function esAdministrador(): bool
    {
        return $this->rol === Rol::Administrador;
    }

    // El administrador y quien no tiene sala asignada ven todas; el resto, solo la suya.
    public function puedeVerSala(Sala $sala): bool
    {
        return $this->esAdministrador() || $this->sala_id === null || $this->sala_id === $sala->id;
    }

    // Borra todos los tokens: el usuario tiene que volver a iniciar sesión.
    public function cerrarSesiones(): void
    {
        $this->tokens()->delete();
    }
}
