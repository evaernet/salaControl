<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Lo que comparten crear y editar usuario: los mensajes y el email en minúscula.
abstract class UserRequest extends FormRequest
{
    // El permiso ya lo controla el middleware role:administrador.
    public function authorize(): bool
    {
        return true;
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'Ingresá el nombre.',
            'nombre.max' => 'El nombre puede tener hasta 80 caracteres.',
            'apellido.required' => 'Ingresá el apellido.',
            'apellido.max' => 'El apellido puede tener hasta 80 caracteres.',
            'email.required' => 'Ingresá el email.',
            'email.email' => 'El email no es válido.',
            'email.max' => 'El email es demasiado largo.',
            'email.unique' => 'Ya existe un usuario con ese email.',
            'password.required' => 'Ingresá una contraseña.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'rol.required' => 'Elegí un rol.',
            'rol.enum' => 'El rol debe ser administrador, médico o enfermero.',
            'activo.boolean' => 'El estado debe ser activo o inactivo.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->email)) {
            $this->merge(['email' => strtolower($this->email)]);
        }
    }
}
