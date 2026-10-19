<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CamaController;
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

    // Lo que sigue es solo para el administrador. Médico y enfermero reciben 403.
    Route::middleware('role:administrador')->group(function () {
        Route::apiResource('users', UserController::class);

        Route::post('/salas', [SalaController::class, 'store']);
        Route::delete('/salas/{sala}', [SalaController::class, 'destroy']);

        Route::post('/salas/{sala}/camas', [CamaController::class, 'store']);
        Route::put('/camas/{cama}', [CamaController::class, 'update']);
        Route::delete('/camas/{cama}', [CamaController::class, 'destroy']);
    });
});
