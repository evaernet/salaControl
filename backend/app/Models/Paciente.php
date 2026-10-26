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

    // Las alertas viajan siempre con el paciente.
    protected $appends = ['alertas'];

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

    // Las más nuevas primero.
    public function medicaciones()
    {
        return $this->hasMany(Medicacion::class)->orderByDesc('inicio');
    }

    public function estaInternado(): bool
    {
        return $this->fecha_alta === null;
    }

    // Avisos para el personal, calculados con los datos del momento:
    // fiebre o temperatura baja en el último control, control atrasado
    // (más de 6 horas, son 4 por día) y medicación en su último día.
    public function getAlertasAttribute(): array
    {
        if (! $this->estaInternado()) {
            return [];
        }

        $alertas = [];
        $control = $this->ultimoControl;

        if ($control && $control->temperatura >= 38) {
            $alertas[] = 'Fiebre: '.$this->grados($control->temperatura);
        }

        if ($control && $control->temperatura < 36) {
            $alertas[] = 'Temperatura baja: '.$this->grados($control->temperatura);
        }

        $ultimo = $control?->fecha ?? $this->fecha_ingreso;
        if ($ultimo->lessThan(now()->subHours(6))) {
            $alertas[] = 'Control de temperatura pendiente';
        }

        foreach ($this->medicaciones as $medicacion) {
            if ($medicacion->estaActiva() && $medicacion->fin()?->lessThan(now()->addDay())) {
                $alertas[] = "Último día de {$medicacion->nombre}";
            }
        }

        return $alertas;
    }

    private function grados(float $temperatura): string
    {
        return number_format($temperatura, 1, ',', '').' °C';
    }
}
