<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sala;
use Illuminate\Http\Request;

class SalaController extends Controller
{
    // Cada sala viene con sus camas, así el tablero se arma con un solo pedido.
    // Médico y enfermero con sala asignada reciben solo la suya.
    public function index(Request $request)
    {
        $salas = Sala::with(['camas' => fn ($query) => $query->orderBy('numero')])
            ->withCount('camas')
            ->orderBy('nombre')
            ->get();

        return $salas->filter(fn (Sala $sala) => $request->user()->puedeVerSala($sala))->values();
    }

    public function show(Request $request, Sala $sala)
    {
        if (! $request->user()->puedeVerSala($sala)) {
            abort(403, 'No tenés acceso a esta sala.');
        }

        return $sala->load(['camas' => fn ($query) => $query->orderBy('numero')]);
    }

    // Crea la sala y, si se indica, sus camas numeradas del 1 en adelante.
    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:80', 'unique:salas,nombre'],
            'camas' => ['nullable', 'integer', 'min:0', 'max:60'],
        ], [
            'nombre.required' => 'Ingresá el nombre de la sala.',
            'nombre.unique' => 'Ya existe una sala con ese nombre.',
            'nombre.max' => 'El nombre puede tener hasta 80 caracteres.',
            'camas.integer' => 'La cantidad de camas tiene que ser un número.',
            'camas.min' => 'La cantidad de camas no puede ser negativa.',
            'camas.max' => 'Se pueden crear hasta 60 camas de una vez.',
        ]);

        $sala = Sala::create(['nombre' => $datos['nombre']]);

        for ($numero = 1; $numero <= ($datos['camas'] ?? 0); $numero++) {
            $sala->camas()->create(['numero' => $numero]);
        }

        return response()->json($sala->load('camas'), 201);
    }

    // Borra la sala junto con sus camas.
    public function destroy(Sala $sala)
    {
        $sala->delete();

        return response()->noContent();
    }
}
