<?php

namespace Tests\Feature;

use App\Models\Paciente;
use App\Models\Sala;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MedicacionTest extends TestCase
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

    public function test_medico_indica_y_suspende_una_medicacion(): void
    {
        Sanctum::actingAs(User::factory()->medico()->create());

        $id = $this->postJson("/api/pacientes/{$this->paciente->id}/medicaciones", $this->datos())
            ->assertCreated()
            ->assertJsonPath('nombre', 'Ceftriaxona')
            ->assertJsonPath('cada_horas', 12)
            ->assertJsonPath('inicio', now()->format('Y-m-d H:i'))
            ->json('id');

        $this->getJson("/api/pacientes/{$this->paciente->id}")->assertJsonCount(1, 'medicaciones');

        $this->postJson("/api/medicaciones/{$id}/suspender")
            ->assertOk()
            ->assertJsonPath('suspendida', now()->format('Y-m-d H:i'));
    }

    public function test_validaciones_de_la_medicacion(): void
    {
        Sanctum::actingAs(User::factory()->medico()->create());

        $this->postJson("/api/pacientes/{$this->paciente->id}/medicaciones", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nombre', 'dosis', 'via', 'cada_horas']);

        $this->postJson("/api/pacientes/{$this->paciente->id}/medicaciones", $this->datos(['cada_horas' => 5]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('cada_horas');
    }

    public function test_el_enfermero_no_indica_medicacion(): void
    {
        Sanctum::actingAs(User::factory()->enfermero()->create());

        $this->postJson("/api/pacientes/{$this->paciente->id}/medicaciones", $this->datos())->assertForbidden();
    }

    public function test_sabe_si_esta_activa(): void
    {
        $medicacion = $this->paciente->medicaciones()->create($this->datos(['inicio' => now()->subDays(8)]));
        $this->assertFalse($medicacion->estaActiva());

        $medicacion->update(['inicio' => now()->subDays(2)]);
        $this->assertTrue($medicacion->fresh()->estaActiva());
    }

    private function datos(array $cambios = []): array
    {
        return array_merge([
            'nombre' => 'Ceftriaxona',
            'dosis' => '1 g',
            'via' => 'Endovenosa',
            'cada_horas' => 12,
            'dias' => 7,
        ], $cambios);
    }
}
