<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicacion extends Model
{
    const VIAS = ['Oral', 'Endovenosa', 'Intramuscular', 'Subcutánea', 'Inhalatoria', 'Tópica'];

    const FRECUENCIAS = [4, 6, 8, 12, 24];

    protected $table = 'medicaciones';

    protected $fillable = ['nombre', 'dosis', 'via', 'cada_horas', 'dias', 'inicio', 'suspendida'];

    protected $casts = [
        'cada_horas' => 'integer',
        'dias' => 'integer',
        'inicio' => 'datetime:Y-m-d H:i',
        'suspendida' => 'datetime:Y-m-d H:i',
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }

    // Cuándo termina el tratamiento (null = sin fecha de fin).
    public function fin()
    {
        return $this->dias ? $this->inicio->copy()->addDays($this->dias) : null;
    }

    public function estaActiva(): bool
    {
        return ! $this->suspendida && (! $this->fin() || $this->fin()->isFuture());
    }
}
