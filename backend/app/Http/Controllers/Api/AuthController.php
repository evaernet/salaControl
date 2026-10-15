<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Email o contraseña incorrectos.',
            ]);
        }

        if (! $user->activo) {
            return response()->json([
                'message' => 'Tu usuario está desactivado. Consultá con el administrador.',
            ], 403);
        }

        $token = $user->createToken($request->device_name ?? 'app-movil');

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => new UserResource($user),
        ]);
    }

    // La app lo llama al abrirse para recuperar la sesión guardada.
    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    // Cierra la sesión solo en este dispositivo.
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada.']);
    }
}
