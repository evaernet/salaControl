<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cama;
use App\Models\Paciente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PacienteController extends Controller
{
    // Ficha del paciente con su cama y sala.
    public function show(Request $request, Paciente $paciente)
    {
        $paciente->load('cama.sala');

        if ($paciente->cama) {
            $this->verificarAcceso($request, $paciente->cama);
        }

        return $paciente;
    }

    // Interna un paciente en una cama libre.
    public function store(Request $request)
    {
        $datos = $request->validate([
            'cama_id' => ['required', 'integer', 'exists:camas,id'],
            'nombre' => ['required', 'string', 'max:80'],
            'apellido' => ['required', 'string', 'max:80'],
            'fecha_nacimiento' => ['required', 'date', 'before_or_equal:today'],
            'peso' => ['nullable', 'numeric', 'min:0.3', 'max:200'],
            'diagnostico' => ['required', 'string', 'max:200'],
            'diagnosticos_base' => ['nullable', 'string', 'max:500'],
            'aislamiento' => ['required', Rule::in(Paciente::AISLAMIENTOS)],
            'alergias' => ['nullable', 'string', 'max:200'],
            'obra_social' => ['nullable', 'string', 'max:80'],
            'acompanante' => ['nullable', 'string', 'max:120'],
            'acompanante_telefono' => ['nullable', 'string', 'max:40'],
        ], [
            'cama_id.required' => 'Elegí una cama.',
            'nombre.required' => 'Ingresá el nombre.',
            'apellido.required' => 'Ingresá el apellido.',
            'fecha_nacimiento.required' => 'Ingresá la fecha de nacimiento.',
            'fecha_nacimiento.date' => 'La fecha de nacimiento no es válida.',
            'fecha_nacimiento.before_or_equal' => 'La fecha de nacimiento no puede ser futura.',
            'peso.numeric' => 'El peso tiene que ser un número.',
            'peso.min' => 'El peso no es válido.',
            'peso.max' => 'El peso no es válido.',
            'diagnostico.required' => 'Ingresá el diagnóstico.',
            'aislamiento.required' => 'Elegí el tipo de aislamiento.',
            'aislamiento.in' => 'El tipo de aislamiento no es válido.',
            'max' => 'El texto es demasiado largo.',
        ]);

        $cama = Cama::findOrFail($datos['cama_id']);
        $this->verificarAcceso($request, $cama);

        if (! $cama->estaDisponible()) {
            abort(422, 'La cama no está libre.');
        }

        $paciente = Paciente::create($datos + ['fecha_ingreso' => now()]);

        return response()->json($paciente->load('cama.sala'), 201);
    }

    // Pasa al paciente a otra cama libre. La que deja queda en limpieza.
    public function cambiarCama(Request $request, Paciente $paciente)
    {
        $datos = $request->validate(
            ['cama_id' => ['required', 'integer', 'exists:camas,id']],
            ['cama_id.required' => 'Elegí la cama nueva.'],
        );

        $this->verificarInternado($paciente);
        $this->verificarAcceso($request, $paciente->cama);

        $nueva = Cama::findOrFail($datos['cama_id']);
        $this->verificarAcceso($request, $nueva);

        if (! $nueva->estaDisponible()) {
            abort(422, 'La cama elegida no está libre.');
        }

        DB::transaction(function () use ($paciente, $nueva) {
            $paciente->cama->update(['estado' => 'limpieza']);
            $paciente->update(['cama_id' => $nueva->id]);
        });

        return $paciente->fresh()->load('cama.sala');
    }

    // Da el alta. La cama queda en limpieza y el paciente pasa al historial.
    public function alta(Request $request, Paciente $paciente)
    {
        $this->verificarInternado($paciente);
        $this->verificarAcceso($request, $paciente->cama);

        DB::transaction(function () use ($paciente) {
            $paciente->update(['fecha_alta' => now()]);
            $paciente->cama->update(['estado' => 'limpieza']);
        });

        return $paciente->fresh()->load('cama.sala');
    }

    private function verificarAcceso(Request $request, Cama $cama): void
    {
        if (! $request->user()->puedeVerSala($cama->sala)) {
            abort(403, 'No tenés acceso a esta sala.');
        }
    }

    private function verificarInternado(Paciente $paciente): void
    {
        if (! $paciente->estaInternado() || ! $paciente->cama) {
            abort(422, 'El paciente ya fue dado de alta.');
        }
    }
}
