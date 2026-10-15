<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Se usa en las rutas como 'role:administrador' o 'role:medico,enfermero'.
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->rol->value, $roles)) {
            abort(403, 'No tenés permiso para realizar esta acción.');
        }

        return $next($request);
    }
}
