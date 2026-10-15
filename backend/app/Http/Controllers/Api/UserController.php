<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

// ABM de usuarios. Todas las rutas son solo para el administrador (ver routes/api.php).
class UserController extends Controller
{
    public function index()
    {
        $users = User::orderBy('apellido')->orderBy('nombre')->get();

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create($request->validated());

        return response()->json(new UserResource($user), 201);
    }

    public function show(User $user)
    {
        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $datos = $request->validated();

        // Si la contraseña viene vacía se deja la que ya tenía.
        if (empty($datos['password'])) {
            unset($datos['password']);
        }

        $user->update($datos);

        // Si a otro usuario lo desactivan o le cambian el rol o la contraseña,
        // se le cierran las sesiones para que vuelva a ingresar.
        $esOtroUsuario = ! $user->is($request->user());

        if ($esOtroUsuario && (! $user->activo || $user->wasChanged(['rol', 'password']))) {
            $user->cerrarSesiones();
        }

        return new UserResource($user);
    }

    // Baja lógica: no se borra de la base, solo deja de aparecer y no puede ingresar.
    public function destroy(Request $request, User $user)
    {
        if ($user->is($request->user())) {
            abort(422, 'No podés eliminar tu propio usuario.');
        }

        $user->cerrarSesiones();
        $user->delete();

        return response()->noContent();
    }
}
