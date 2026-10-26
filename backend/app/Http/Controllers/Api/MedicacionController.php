<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicacion;
use App\Models\Paciente;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MedicacionController extends Controller
{
    // El médico indica un medicamento. Empieza ahora.
    public function store(Request $request, Paciente $paciente)
    {
        $this->verificarInternado($request, $paciente);

        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:120'],
            'dosis' => ['required', 'string', 'max:60'],
            'via' => ['required', Rule::in(Medicacion::VIAS)],
            'cada_horas' => ['required', 'integer', Rule::in(Medicacion::FRECUENCIAS)],
            'dias' => ['nullable', 'integer', 'min:1', 'max:60'],
        ], [
            'nombre.required' => 'Ingresá el medicamento.',
            'dosis.required' => 'Ingresá la dosis.',
            'via.required' => 'Elegí la vía.',
            'via.in' => 'La vía no es válida.',
            'cada_horas.required' => 'Elegí cada cuántas horas.',
            'cada_horas.in' => 'La frecuencia no es válida.',
            'dias.min' => 'Los días tienen que ser al menos 1.',
            'dias.max' => 'Se pueden indicar hasta 60 días.',
            'max' => 'El texto es demasiado largo.',
        ]);

        $medicacion = $paciente->medicaciones()->create($datos + ['inicio' => now()]);

        return response()->json($medicacion, 201);
    }

    // Suspende la indicación (queda en el historial).
    public function suspender(Request $request, Medicacion $medicacion)
    {
        $this->verificarInternado($request, $medicacion->paciente);

        $medicacion->update(['suspendida' => now()]);

        return $medicacion;
    }
}
