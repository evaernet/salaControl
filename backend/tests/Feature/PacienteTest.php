<?php

namespace Tests\Feature;

use App\Models\Cama;
use App\Models\Paciente;
use App\Models\Sala;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PacienteTest extends TestCase
{
    use RefreshDatabase;

    private Sala $sala;

    protected function setUp(): void
    {
        parent::setUp();

        $this->sala = Sala::create(['nombre' => 'Aislamiento']);
        $this->sala->camas()->create(['numero' => 1]);
        $this->sala->camas()->create(['numero' => 2]);
    }

    public function test_medico_interna_un_paciente_en_una_cama_libre(): void
    {
        Sanctum::actingAs(User::factory()->medico()->create());

        $this->postJson('/api/pacientes', $this->datos())
            ->assertCreated()
            ->assertJsonPath('nombre', 'Tomás')
            ->assertJsonPath('fecha_nacimiento', '2022-03-10')
            ->assertJsonPath('cama.numero', 1)
            ->assertJsonPath('cama.sala.nombre', 'Aislamiento');

        $this->getJson('/api/salas')
            ->assertJsonPath('0.camas.0.paciente.apellido', 'Gómez')
            ->assertJsonPath('0.camas.1.paciente', null);
    }

    public function test_no_se_interna_en_una_cama_ocupada_o_en_limpieza(): void
    {
        Sanctum::actingAs(User::factory()->medico()->create());
        $this->internar($this->cama(1));
        $this->cama(2)->update(['estado' => 'limpieza']);

        $this->postJson('/api/pacientes', $this->datos(['cama_id' => $this->cama(1)->id]))
            ->assertUnprocessable()
            ->assertJsonPath('message', 'La cama no está libre.');

        $this->postJson('/api/pacientes', $this->datos(['cama_id' => $this->cama(2)->id]))
            ->assertUnprocessable();
    }

    public function test_validaciones_al_internar(): void
    {
        Sanctum::actingAs(User::factory()->medico()->create());

        $this->postJson('/api/pacientes', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['cama_id', 'nombre', 'apellido', 'fecha_nacimiento', 'diagnostico', 'aislamiento']);

        $this->postJson('/api/pacientes', $this->datos(['fecha_nacimiento' => now()->addDay()->toDateString()]))
            ->assertUnprocessable()
            ->assertJsonPath('errors.fecha_nacimiento.0', 'La fecha de nacimiento no puede ser futura.');
    }

    public function test_enfermero_y_administrador_no_internan(): void
    {
        foreach (['enfermero', 'administrador'] as $rol) {
            Sanctum::actingAs(User::factory()->create(['rol' => $rol]));

            $this->postJson('/api/pacientes', $this->datos())->assertForbidden();
        }
    }

    public function test_cambiar_de_cama_deja_la_anterior_en_limpieza(): void
    {
        Sanctum::actingAs(User::factory()->medico()->create());
        $paciente = $this->internar($this->cama(1));

        $this->postJson("/api/pacientes/{$paciente->id}/cambiar-cama", ['cama_id' => $this->cama(2)->id])
            ->assertOk()
            ->assertJsonPath('cama.numero', 2);

        $this->assertSame('limpieza', $this->cama(1)->estado);
        $this->assertFalse($this->cama(1)->estaOcupada());
    }

    public function test_alta_deja_la_cama_en_limpieza_y_conserva_el_paciente(): void
    {
        Sanctum::actingAs(User::factory()->medico()->create());
        $paciente = $this->internar($this->cama(1));

        $this->postJson("/api/pacientes/{$paciente->id}/alta")->assertOk();

        $this->assertNotNull($paciente->fresh()->fecha_alta);
        $this->assertSame('limpieza', $this->cama(1)->estado);
        $this->assertFalse($this->cama(1)->estaOcupada());

        $this->postJson("/api/pacientes/{$paciente->id}/alta")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'El paciente ya fue dado de alta.');
    }

    public function test_enfermero_ve_la_ficha_y_libera_una_cama_en_limpieza(): void
    {
        $paciente = $this->internar($this->cama(1));
        $this->cama(2)->update(['estado' => 'limpieza']);
        Sanctum::actingAs(User::factory()->enfermero()->create());

        $this->getJson("/api/pacientes/{$paciente->id}")->assertOk()->assertJsonPath('diagnostico', 'Neumonía');

        $this->putJson("/api/camas/{$this->cama(2)->id}", ['estado' => 'libre'])
            ->assertOk()
            ->assertJsonPath('estado', 'libre');
    }

    public function test_no_se_cambia_el_estado_ni_se_borra_una_cama_ocupada(): void
    {
        $this->internar($this->cama(1));
        Sanctum::actingAs(User::factory()->administrador()->create());

        $this->putJson("/api/camas/{$this->cama(1)->id}", ['estado' => 'fuera_de_servicio'])->assertUnprocessable();
        $this->deleteJson("/api/camas/{$this->cama(1)->id}")->assertUnprocessable();
        $this->deleteJson("/api/salas/{$this->sala->id}")->assertUnprocessable();
    }

    public function test_medico_de_otra_sala_no_ve_ni_toca_el_paciente(): void
    {
        $paciente = $this->internar($this->cama(1));
        $otra = Sala::create(['nombre' => 'Clínica']);
        Sanctum::actingAs(User::factory()->medico()->create(['sala_id' => $otra->id]));

        $this->getJson("/api/pacientes/{$paciente->id}")->assertForbidden();
        $this->postJson("/api/pacientes/{$paciente->id}/alta")->assertForbidden();
        $this->postJson('/api/pacientes', $this->datos(['cama_id' => $this->cama(2)->id]))->assertForbidden();
    }

    private function cama(int $numero): Cama
    {
        return $this->sala->camas()->where('numero', $numero)->firstOrFail();
    }

    private function internar(Cama $cama): Paciente
    {
        return Paciente::create($this->datos(['cama_id' => $cama->id]) + ['fecha_ingreso' => now()]);
    }

    private function datos(array $cambios = []): array
    {
        return array_merge([
            'cama_id' => $this->cama(1)->id,
            'nombre' => 'Tomás',
            'apellido' => 'Gómez',
            'fecha_nacimiento' => '2022-03-10',
            'peso' => 16.5,
            'diagnostico' => 'Neumonía',
            'aislamiento' => 'contacto',
            'alergias' => 'Penicilina',
        ], $cambios);
    }
}
