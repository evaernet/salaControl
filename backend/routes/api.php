<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CamaController;
use App\Http\Controllers\Api\ControlController;
use App\Http\Controllers\Api\PacienteController;
use App\Http\Controllers\Api\SalaController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Hasta 10 intentos de login por minuto.
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Cualquier usuario puede ver las salas y sus camas.
    Route::get('/salas', [SalaController::class, 'index']);
    Route::get('/salas/{sala}', [SalaController::class, 'show']);
    Route::get('/pacientes/{paciente}', [PacienteController::class, 'show']);

    // Cualquier rol puede cambiar el estado de una cama de su sala.
    Route::put('/camas/{cama}', [CamaController::class, 'update']);

    // Controles: los registran médico y enfermero.
    Route::post('/pacientes/{paciente}/controles', [ControlController::class, 'store'])->middleware('role:medico,enfermero');

    // Internar, editar, cambiar de cama y dar el alta: solo el médico.
    Route::middleware('role:medico')->group(function () {
        Route::post('/pacientes', [PacienteController::class, 'store']);
        Route::put('/pacientes/{paciente}', [PacienteController::class, 'update']);
        Route::post('/pacientes/{paciente}/cambiar-cama', [PacienteController::class, 'cambiarCama']);
        Route::post('/pacientes/{paciente}/alta', [PacienteController::class, 'alta']);
    });

    // Lo que sigue es solo para el administrador. Médico y enfermero reciben 403.
    Route::middleware('role:administrador')->group(function () {
        Route::apiResource('users', UserController::class)->except('destroy');

        Route::post('/salas', [SalaController::class, 'store']);
        Route::delete('/salas/{sala}', [SalaController::class, 'destroy']);

        Route::post('/salas/{sala}/camas', [CamaController::class, 'store']);
        Route::delete('/camas/{cama}', [CamaController::class, 'destroy']);
    });
});
