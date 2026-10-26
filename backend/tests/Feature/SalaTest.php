<?php

namespace Tests\Feature;

use App\Models\Sala;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SalaTest extends TestCase
{
    use RefreshDatabase;

    public function test_sin_token_no_se_ven_las_salas(): void
    {
        $this->getJson('/api/salas')->assertUnauthorized();
    }

    public function test_administrador_crea_una_sala_con_sus_camas(): void
    {
        Sanctum::actingAs(User::factory()->administrador()->create());

        $this->postJson('/api/salas', ['nombre' => 'Aislamiento', 'camas' => 3])
            ->assertCreated()
            ->assertJsonPath('nombre', 'Aislamiento')
            ->assertJsonCount(3, 'camas')
            ->assertJsonPath('camas.0.numero', 1)
            ->assertJsonPath('camas.2.numero', 3)
            ->assertJsonPath('camas.0.estado', 'libre');
    }

    public function test_no_se_repite_el_nombre_de_una_sala(): void
    {
        Sala::create(['nombre' => 'Aislamiento']);
        Sanctum::actingAs(User::factory()->administrador()->create());

        $this->postJson('/api/salas', ['nombre' => 'Aislamiento'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.nombre.0', 'Ya existe una sala con ese nombre.');
    }

    public function test_medico_y_enfermero_ven_las_salas_pero_no_las_modifican(): void
    {
        $sala = Sala::create(['nombre' => 'Aislamiento']);
        $cama = $sala->camas()->create(['numero' => 1]);

        foreach (['medico', 'enfermero'] as $rol) {
            Sanctum::actingAs(User::factory()->create(['rol' => $rol]));

            $this->getJson('/api/salas')
                ->assertOk()
                ->assertJsonPath('0.camas_count', 1)
                ->assertJsonPath('0.camas.0.numero', 1);
            $this->getJson("/api/salas/{$sala->id}")->assertOk()->assertJsonCount(1, 'camas');

            $this->postJson('/api/salas', ['nombre' => 'Otra'])->assertForbidden();
            $this->deleteJson("/api/salas/{$sala->id}")->assertForbidden();
            $this->postJson("/api/salas/{$sala->id}/camas")->assertForbidden();
            $this->putJson("/api/camas/{$cama->id}", ['estado' => 'limpieza'])->assertForbidden();
            $this->deleteJson("/api/camas/{$cama->id}")->assertForbidden();
        }
    }

    public function test_agregar_cama_usa_el_numero_siguiente(): void
    {
        $sala = Sala::create(['nombre' => 'Aislamiento']);
        $sala->camas()->create(['numero' => 1]);
        $sala->camas()->create(['numero' => 2]);
        Sanctum::actingAs(User::factory()->administrador()->create());

        $this->postJson("/api/salas/{$sala->id}/camas")
            ->assertCreated()
            ->assertJsonPath('numero', 3);
    }

    public function test_cambiar_el_estado_de_una_cama(): void
    {
        $cama = Sala::create(['nombre' => 'Aislamiento'])->camas()->create(['numero' => 1]);
        Sanctum::actingAs(User::factory()->administrador()->create());

        $this->putJson("/api/camas/{$cama->id}", ['estado' => 'limpieza'])
            ->assertOk()
            ->assertJsonPath('estado', 'limpieza');

        $this->putJson("/api/camas/{$cama->id}", ['estado' => 'rota'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('estado');
    }

    public function test_borrar_una_sala_borra_sus_camas(): void
    {
        $sala = Sala::create(['nombre' => 'Aislamiento']);
        $sala->camas()->create(['numero' => 1]);
        Sanctum::actingAs(User::factory()->administrador()->create());

        $this->deleteJson("/api/salas/{$sala->id}")->assertNoContent();

        $this->assertDatabaseCount('salas', 0);
        $this->assertDatabaseCount('camas', 0);
    }
}
