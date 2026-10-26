<?php

namespace App\Http\Controllers;

use App\Models\Cama;
use App\Models\Paciente;
use Illuminate\Http\Request;

abstract class Controller
{
    // Médico y enfermero solo pueden trabajar en su sala (ver User::puedeVerSala).
    protected function verificarAcceso(Request $request, Cama $cama): void
    {
        if (! $request->user()->puedeVerSala($cama->sala)) {
            abort(403, 'No tenés acceso a esta sala.');
        }
    }

    // Para todo lo que se hace con un paciente que sigue internado.
    protected function verificarInternado(Request $request, Paciente $paciente): void
    {
        if (! $paciente->estaInternado() || ! $paciente->cama) {
            abort(422, 'El paciente ya fue dado de alta.');
        }

        $this->verificarAcceso($request, $paciente->cama);
    }
}
