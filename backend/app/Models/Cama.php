<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cama extends Model
{
    const ESTADOS = ['libre', 'limpieza', 'fuera_de_servicio'];

    protected $fillable = ['numero', 'estado'];

    protected $attributes = ['estado' => 'libre'];

    protected $casts = ['numero' => 'integer', 'sala_id' => 'integer'];

    public function sala()
    {
        return $this->belongsTo(Sala::class);
    }

    // El paciente internado ahora en esta cama (los dados de alta no cuentan).
    public function paciente()
    {
        return $this->hasOne(Paciente::class)->whereNull('fecha_alta');
    }

    public function estaOcupada(): bool
    {
        return $this->paciente()->exists();
    }

    // Se puede internar si está marcada como libre y no tiene paciente.
    public function estaDisponible(): bool
    {
        return $this->estado === 'libre' && ! $this->estaOcupada();
    }
}
