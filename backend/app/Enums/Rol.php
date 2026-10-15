<?php

namespace App\Enums;

// El valor es el que se guarda en users.rol y el que viaja en la API.
enum Rol: string
{
    case Administrador = 'administrador';
    case Medico = 'medico';
    case Enfermero = 'enfermero';
}
