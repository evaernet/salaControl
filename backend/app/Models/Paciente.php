<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paciente extends Model
{
    const AISLAMIENTOS = ['ninguno', 'contacto', 'gotitas', 'aereo'];

    protected $fillable = [
        'cama_id', 'nombre', 'apellido', 'fecha_nacimiento', 'peso', 'diagnostico', 'diagnosticos_base',
        'aislamiento', 'alergias', 'obra_social', 'acompanante', 'acompanante_telefono', 'fecha_ingreso', 'fecha_alta',
    ];

    protected $casts = [
        'cama_id' => 'integer',
        'fecha_nacimiento' => 'date:Y-m-d',
        'peso' => 'float',
        'fecha_ingreso' => 'datetime',
        'fecha_alta' => 'datetime',
    ];

    public function cama()
    {
        return $this->belongsTo(Cama::class);
    }

    public function estaInternado(): bool
    {
        return $this->fecha_alta === null;
    }
}
