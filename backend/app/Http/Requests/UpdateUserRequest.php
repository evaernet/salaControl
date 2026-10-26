<?php

namespace App\Http\Requests;

use App\Enums\Rol;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateUserRequest extends UserRequest
{
    // Todos los campos son opcionales: se actualiza solo lo que llega.
    public function rules(): array
    {
        return [
            'nombre' => ['sometimes', 'required', 'string', 'max:80'],
            'apellido' => ['sometimes', 'required', 'string', 'max:80'],
            'email' => [
                'sometimes', 'required', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($this->route('user')),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'rol' => ['sometimes', 'required', Rule::enum(Rol::class)],
            'activo' => ['sometimes', 'boolean'],
            'sala_id' => ['nullable', 'integer', 'exists:salas,id'],
        ];
    }

    // El administrador no puede sacarse el rol ni desactivarse a sí mismo,
    // porque la app se quedaría sin nadie que maneje los usuarios.
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if (! $this->route('user')->is($this->user())) {
                    return;
                }

                if ($this->filled('rol') && $this->rol !== Rol::Administrador->value) {
                    $validator->errors()->add('rol', 'No podés quitarte el rol de administrador.');
                }

                if ($this->has('activo') && ! $this->boolean('activo')) {
                    $validator->errors()->add('activo', 'No podés desactivar tu propio usuario.');
                }
            },
        ];
    }
}
