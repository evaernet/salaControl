<?php

use Illuminate\Support\Facades\Route;

// La app usa solo la API (/api). Esto sirve para ver en el navegador que el servidor anda.
Route::get('/', fn () => ['app' => 'SalaControl API', 'estado' => 'ok']);
