<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_correcto_devuelve_token_y_usuario_con_rol(): void
    {
        $user = User::factory()->administrador()->create([
            'email' => 'admin@salacontrol.test',
            'password' => 'Secreta123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'ADMIN@salacontrol.test',
            'password' => 'Secreta123',
            'device_name' => 'test',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'nombre', 'apellido', 'email', 'rol', 'activo']])
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.rol', 'administrador')
            ->assertJsonMissingPath('user.password');

        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_credenciales_incorrectas_devuelven_422_con_mensaje(): void
    {
        User::factory()->create(['email' => 'medico@salacontrol.test', 'password' => 'Secreta123']);

        $this->postJson('/api/login', ['email' => 'medico@salacontrol.test', 'password' => 'otra-cosa'])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Email o contraseña incorrectos.');

        $this->postJson('/api/login', ['email' => 'nadie@salacontrol.test', 'password' => 'Secreta123'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_login_exige_email_y_contrasena(): void
    {
        $this->postJson('/api/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_usuario_desactivado_no_puede_ingresar(): void
    {
        User::factory()->inactivo()->create(['email' => 'baja@salacontrol.test', 'password' => 'Secreta123']);

        $this->postJson('/api/login', ['email' => 'baja@salacontrol.test', 'password' => 'Secreta123'])
            ->assertForbidden();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_me_requiere_token(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
    }

    public function test_me_devuelve_el_usuario_autenticado(): void
    {
        $user = User::factory()->enfermero()->create();

        Sanctum::actingAs($user);

        $this->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('rol', 'enfermero');
    }

    public function test_logout_revoca_el_token_del_dispositivo(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
