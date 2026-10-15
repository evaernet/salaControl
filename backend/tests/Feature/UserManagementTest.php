<?php

namespace Tests\Feature;

use App\Enums\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->administrador()->create();
    }

    public function test_sin_token_las_rutas_de_usuarios_devuelven_401(): void
    {
        $this->getJson('/api/users')->assertUnauthorized();
        $this->postJson('/api/users', [])->assertUnauthorized();
    }

    public function test_medico_y_enfermero_reciben_403_en_todas_las_rutas_de_usuarios(): void
    {
        $otro = User::factory()->create();

        foreach ([Rol::Medico, Rol::Enfermero] as $rol) {
            Sanctum::actingAs(User::factory()->create(['rol' => $rol]));

            $this->getJson('/api/users')->assertForbidden();
            $this->postJson('/api/users', $this->datosValidos())->assertForbidden();
            $this->getJson("/api/users/{$otro->id}")->assertForbidden();
            $this->putJson("/api/users/{$otro->id}", ['rol' => 'administrador'])->assertForbidden();
            $this->deleteJson("/api/users/{$otro->id}")->assertForbidden();
        }

        // Nadie se pudo crear ni modificar a sí mismo como administrador.
        $this->assertSame(Rol::Medico, $otro->fresh()->rol);
        $this->assertDatabaseCount('users', 4);
    }

    public function test_administrador_lista_usuarios(): void
    {
        User::factory()->count(2)->create();

        Sanctum::actingAs($this->admin);

        $this->getJson('/api/users')
            ->assertOk()
            ->assertJsonCount(3)
            ->assertJsonStructure(['*' => ['id', 'nombre', 'apellido', 'email', 'rol', 'activo']]);
    }

    public function test_administrador_crea_un_medico(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/users', $this->datosValidos([
            'email' => 'Medico.Nuevo@SalaControl.test',
            'rol' => 'medico',
        ]));

        $response->assertCreated()
            ->assertJsonPath('email', 'medico.nuevo@salacontrol.test')
            ->assertJsonPath('rol', 'medico')
            ->assertJsonPath('activo', true)
            ->assertJsonMissingPath('password');

        $creado = User::where('email', 'medico.nuevo@salacontrol.test')->firstOrFail();
        $this->assertTrue(Hash::check('Secreta123', $creado->password));
    }

    public function test_validaciones_al_crear(): void
    {
        Sanctum::actingAs($this->admin);

        $this->postJson('/api/users', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nombre', 'apellido', 'email', 'password', 'rol']);

        $this->postJson('/api/users', $this->datosValidos(['rol' => 'director', 'password' => '123']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['rol', 'password']);

        $this->postJson('/api/users', $this->datosValidos(['email' => $this->admin->email]))
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'Ya existe un usuario con ese email.');
    }

    public function test_administrador_ve_un_usuario(): void
    {
        $user = User::factory()->enfermero()->create();

        Sanctum::actingAs($this->admin);

        $this->getJson("/api/users/{$user->id}")
            ->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('rol', 'enfermero');
    }

    public function test_administrador_edita_datos_y_rol(): void
    {
        $user = User::factory()->medico()->create();
        $user->createToken('celular');

        Sanctum::actingAs($this->admin);

        $this->putJson("/api/users/{$user->id}", [
            'nombre' => 'Andrea',
            'apellido' => 'Duarte',
            'rol' => 'enfermero',
            'password' => '',
        ])->assertOk()
            ->assertJsonPath('nombre', 'Andrea')
            ->assertJsonPath('rol', 'enfermero');

        // Al cambiar el rol se cierran sus sesiones.
        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_contrasena_vacia_no_cambia_la_actual(): void
    {
        $user = User::factory()->create(['password' => 'Original123']);

        Sanctum::actingAs($this->admin);

        $this->putJson("/api/users/{$user->id}", ['nombre' => 'Otro', 'password' => null])->assertOk();

        $this->assertTrue(Hash::check('Original123', $user->fresh()->password));
    }

    public function test_desactivar_cierra_las_sesiones_del_usuario(): void
    {
        $user = User::factory()->create();
        $user->createToken('celular');

        Sanctum::actingAs($this->admin);

        $this->putJson("/api/users/{$user->id}", ['activo' => false])
            ->assertOk()
            ->assertJsonPath('activo', false);

        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_administrador_no_puede_quitarse_el_rol_ni_desactivarse(): void
    {
        Sanctum::actingAs($this->admin);

        $this->putJson("/api/users/{$this->admin->id}", ['rol' => 'medico', 'activo' => false])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['rol', 'activo']);

        $this->assertTrue($this->admin->fresh()->esAdministrador());
        $this->assertTrue($this->admin->fresh()->activo);
    }

    public function test_eliminar_es_baja_logica_y_cierra_sesiones(): void
    {
        $user = User::factory()->create();
        $user->createToken('celular');

        Sanctum::actingAs($this->admin);

        $this->deleteJson("/api/users/{$user->id}")->assertNoContent();

        $this->assertSoftDeleted($user);
        $this->assertSame(0, $user->tokens()->count());
        $this->getJson("/api/users/{$user->id}")->assertNotFound();
    }

    public function test_administrador_no_puede_eliminarse(): void
    {
        Sanctum::actingAs($this->admin);

        $this->deleteJson("/api/users/{$this->admin->id}")->assertUnprocessable();

        $this->assertNotSoftDeleted($this->admin);
    }

    /**
     * @param  array<string, mixed>  $cambios
     * @return array<string, mixed>
     */
    private function datosValidos(array $cambios = []): array
    {
        return array_merge([
            'nombre' => 'Laura',
            'apellido' => 'Méndez',
            'email' => 'laura.mendez@salacontrol.test',
            'password' => 'Secreta123',
            'rol' => 'medico',
        ], $cambios);
    }
}
