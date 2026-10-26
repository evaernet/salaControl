<?php

namespace Tests\Feature;

use App\Models\Paciente;
use App\Models\Sala;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ControlTest extends TestCase
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
            'fecha_ingreso' => now(),
        ]);
    }

    public function test_enfermero_registra_la_temperatura(): void
    {
        $enfermero = User::factory()->enfermero()->create(['nombre' => 'Ana']);
        Sanctum::actingAs($enfermero);

        $this->postJson("/api/pacientes/{$this->paciente->id}/controles", ['temperatura' => 38.4, 'observacion' => 'Con escalofríos'])
            ->assertCreated()
            ->assertJsonPath('temperatura', 38.4)
            ->assertJsonPath('user.nombre', 'Ana');

        $this->getJson("/api/pacientes/{$this->paciente->id}")
            ->assertJsonCount(1, 'controles')
            ->assertJsonPath('controles.0.observacion', 'Con escalofríos');
    }

    public function test_temperatura_fuera_de_rango(): void
    {
        Sanctum::actingAs(User::factory()->medico()->create());

        $this->postJson("/api/pacientes/{$this->paciente->id}/controles", ['temperatura' => 50])
            ->assertUnprocessable()
            ->assertJsonPath('errors.temperatura.0', 'La temperatura tiene que estar entre 30 y 45 °C.');
    }

    public function test_no_se_registran_controles_a_un_paciente_de_alta_ni_lo_hace_el_admin(): void
    {
        Sanctum::actingAs(User::factory()->administrador()->create());
        $this->postJson("/api/pacientes/{$this->paciente->id}/controles", ['temperatura' => 37])->assertForbidden();

        $this->paciente->update(['fecha_alta' => now()]);
        Sanctum::actingAs(User::factory()->enfermero()->create());
        $this->postJson("/api/pacientes/{$this->paciente->id}/controles", ['temperatura' => 37])->assertUnprocessable();
    }
}
