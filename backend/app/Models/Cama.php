<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cama extends Model
{
    const ESTADOS = ['libre', 'limpieza', 'fuera_de_servicio'];

    protected $fillable = ['numero', 'estado'];

    protected $attributes = ['estado' => 'libre'];

    protected $casts = ['numero' => 'integer', 'sala_id' => 'integer'];
}
