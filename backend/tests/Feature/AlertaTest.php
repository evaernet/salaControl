<?php

namespace Tests\Feature;

use App\Models\Paciente;
use App\Models\Sala;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AlertaTest extends TestCase
{
    use RefreshDatabase;

    private Paciente $paciente;

    protected function setUp(): void
    {
        parent::setUp();

        $cama = Sala::create(['nombre' => 'Aislamiento'])->camas()->create(['numero' => 1]);
        $this->paciente = Paciente::create([
            'cama_id' => $cama->id,
            'nombre' => 'Tomás',
            'apellido' => 'Gómez',
            'fecha_nacimiento' => '2022-03-10',
            'diagnostico' => 'Neumonía',
            'aislamiento' => 'contacto',
            'fecha_ingreso' => now()->subHours(2),
        ]);
    }

    public function test_recien_ingresado_sin_alertas(): void
    {
        $this->assertSame([], $this->paciente->alertas);
    }

    public function test_fiebre_en_el_ultimo_control(): void
    {
        $this->control(38.5);

        $this->assertSame(['Fiebre: 38,5 °C'], $this->paciente->fresh()->alertas);
    }

    public function test_control_atrasado(): void
    {
        $this->paciente->update(['fecha_ingreso' => now()->subHours(10)]);
        $this->control(36.8, now()->subHours(7));

        $this->assertSame(['Control de temperatura pendiente'], $this->paciente->fresh()->alertas);
    }

    public function test_ultimo_dia_de_medicacion(): void
    {
        $this->paciente->medicaciones()->create([
            'nombre' => 'Amoxicilina', 'dosis' => '250 mg', 'via' => 'Oral',
            'cada_horas' => 8, 'dias' => 7, 'inicio' => now()->subDays(6)->subHour(),
        ]);

        $this->assertSame(['Último día de Amoxicilina'], $this->paciente->fresh()->alertas);
    }

    public function test_dado_de_alta_no_tiene_alertas(): void
    {
        $this->control(39);
        $this->paciente->update(['fecha_alta' => now()]);

        $this->assertSame([], $this->paciente->fresh()->alertas);
    }

    public function test_el_tablero_trae_las_alertas_y_el_ultimo_control(): void
    {
        $this->control(37, now()->subHour());
        $this->control(38.2);
        Sanctum::actingAs(User::factory()->enfermero()->create());

        $this->getJson('/api/salas')
            ->assertJsonPath('0.camas.0.paciente.alertas', ['Fiebre: 38,2 °C'])
            ->assertJsonPath('0.camas.0.paciente.ultimo_control.temperatura', 38.2);
    }

    private function control(float $temperatura, $fecha = null): void
    {
        $this->paciente->controles()->create(['temperatura' => $temperatura, 'fecha' => $fecha ?? now()]);
    }
}
