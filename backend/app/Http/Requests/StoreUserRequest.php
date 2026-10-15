<?php

namespace App\Http\Requests;

use App\Enums\Rol;
use Illuminate\Validation\Rule;

class StoreUserRequest extends UserRequest
{
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:80'],
            'apellido' => ['required', 'string', 'max:80'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'rol' => ['required', Rule::enum(Rol::class)],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
