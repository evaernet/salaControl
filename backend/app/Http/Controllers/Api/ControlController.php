<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use Illuminate\Http\Request;

class ControlController extends Controller
{
    // Registra la temperatura del paciente con la hora actual.
    public function store(Request $request, Paciente $paciente)
    {
        $this->verificarInternado($request, $paciente);

        $datos = $request->validate([
            'temperatura' => ['required', 'numeric', 'between:30,45'],
            'observacion' => ['nullable', 'string', 'max:200'],
        ], [
            'temperatura.required' => 'Ingresá la temperatura.',
            'temperatura.numeric' => 'La temperatura tiene que ser un número.',
            'temperatura.between' => 'La temperatura tiene que estar entre 30 y 45 °C.',
            'observacion.max' => 'La observación es demasiado larga.',
        ]);

        $control = $paciente->controles()->create($datos + [
            'fecha' => now(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json($control->load('user:id,nombre,apellido'), 201);
    }
}
