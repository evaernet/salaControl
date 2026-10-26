<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paciente extends Model
{
    const AISLAMIENTOS = ['ninguno', 'contacto', 'gotitas', 'aereo'];

    protected $fillable = [
        'cama_id', 'nombre', 'apellido', 'fecha_nacimiento', 'peso', 'diagnostico', 'diagnosticos_base',
        'aislamiento', 'alergias', 'obra_social', 'acompanante_parentesco', 'acompanante', 'acompanante_telefono', 'fecha_ingreso', 'fecha_alta',
    ];

    protected $casts = [
        'cama_id' => 'integer',
        'fecha_nacimiento' => 'date:Y-m-d',
        'peso' => 'float',
        // Sin zona horaria: la app las muestra tal cual (hora de Argentina).
        'fecha_ingreso' => 'datetime:Y-m-d H:i',
        'fecha_alta' => 'datetime:Y-m-d H:i',
    ];

    public function cama()
    {
        return $this->belongsTo(Cama::class);
    }

    // Del más nuevo al más viejo.
    public function controles()
    {
        return $this->hasMany(Control::class)->orderByDesc('fecha');
    }

    public function ultimoControl()
    {
        return $this->hasOne(Control::class)->latestOfMany('fecha');
    }

    public function estaInternado(): bool
    {
        return $this->fecha_alta === null;
    }
}
