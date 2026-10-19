<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cama;
use App\Models\Sala;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CamaController extends Controller
{
    // Agrega una cama con el número siguiente al último de la sala.
    public function store(Sala $sala)
    {
        $cama = $sala->camas()->create([
            'numero' => $sala->camas()->max('numero') + 1,
        ]);

        return response()->json($cama, 201);
    }

    // Solo se cambia el estado: libre, en limpieza o fuera de servicio.
    public function update(Request $request, Cama $cama)
    {
        $datos = $request->validate([
            'estado' => ['required', Rule::in(Cama::ESTADOS)],
        ], [
            'estado.required' => 'Elegí un estado.',
            'estado.in' => 'El estado debe ser libre, en limpieza o fuera de servicio.',
        ]);

        $cama->update($datos);

        return $cama;
    }

    public function destroy(Cama $cama)
    {
        $cama->delete();

        return response()->noContent();
    }
}
