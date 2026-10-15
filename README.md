# SalaControl · Etapa 1: login, roles y administración de usuarios

Primera parte de la app: inicio de sesión contra Laravel, roles (`administrador`, `medico`, `enfermero`),
administración de usuarios desde el rol Administrador y redirección según el rol.

```
salacontrol/
├── backend/   API REST · Laravel 11 + Sanctum + MySQL
└── mobile/    App · React Native + Expo SDK 57 + Expo Router + TypeScript + Axios
```

## Requisitos

- PHP 8.2 o superior y Composer 2
- MySQL 8
- Node.js 20 o superior
- Expo Go (SDK 57) en el celular, o un emulador de Android o iOS

---

## 1. Levantar Laravel

```bash
cd backend
composer install
cp .env.example .env          # en Windows: copy .env.example .env
php artisan key:generate
```

Crear la base de datos en MySQL:

```sql
CREATE DATABASE salacontrol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Completar en `.env` el usuario y la contraseña de MySQL (`DB_USERNAME`, `DB_PASSWORD`). Si querés, cambiá
`ADMIN_EMAIL` y `ADMIN_PASSWORD`, que son los datos del primer administrador.

```bash
php artisan migrate --seed                      # crea las tablas y el administrador inicial
php artisan serve --host=0.0.0.0 --port=8000    # 0.0.0.0 para que el celular llegue a la API
```

Pruebas automáticas del backend (usan SQLite en memoria, no tocan tu base; requieren la extensión `pdo_sqlite` de PHP):

```bash
php artisan test
```

## 2. Levantar Expo

```bash
cd mobile
npm install
npx expo start
```

- **Celular con Expo Go** (misma red Wi-Fi que la compu): escaneá el QR. La app usa sola la IP de la compu y el
  puerto 8000, no hay que configurar nada.
- **Emulador de Android**: creá `mobile/.env` con `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api` y reiniciá Expo.
- **Navegador** (tecla `w`): usa `http://localhost:8000/api`. Sirve para probar rápido; el destino es el celular.

Si cambiás `.env`, reiniciá con `npx expo start -c`.

## 3. Probar el flujo

| Paso | Qué hacer | Qué se ve |
|---|---|---|
| 1-3 | Abrir la app | Pantalla de inicio de sesión |
| 4 | Ingresar con `admin@salacontrol.test` / `Admin1234` | |
| 5 | | **Panel de Administrador** con nombre, rol, Usuarios y Crear usuario |
| 6 | Crear usuario → rol **Médico** | Aparece en Usuarios |
| 7 | Crear usuario → rol **Enfermero** | Aparece en Usuarios |
| 8 | Cerrar sesión | Vuelve al login |
| 9 | Ingresar con el médico | **Panel Médico** |
| 10 | Cerrar sesión | Vuelve al login |
| 11 | Ingresar con el enfermero | **Panel Enfermero** |

---

## API

Todas las respuestas son JSON. Las rutas protegidas llevan el header `Authorization: Bearer <token>`.

| Método | Ruta | Acceso | Respuesta |
|---|---|---|---|
| POST | `/api/login` | público (10 intentos por minuto) | `200 {token, user}` · `422` credenciales incorrectas · `403` usuario desactivado |
| GET | `/api/me` | con sesión | `200` usuario · `401` sin token válido |
| POST | `/api/logout` | con sesión | `200` · revoca el token de ese dispositivo |
| GET | `/api/users` | administrador | `200` lista de usuarios |
| POST | `/api/users` | administrador | `201` usuario creado · `422` validación |
| GET | `/api/users/{id}` | administrador | `200` usuario · `404` |
| PUT | `/api/users/{id}` | administrador | `200` usuario actualizado · `422` validación |
| DELETE | `/api/users/{id}` | administrador | `204` baja lógica |

Un médico o enfermero recibe **403** en todas las rutas de `/api/users`: lo controla el middleware
`role:administrador` en el servidor, no la app.

Usuario de ejemplo:

```json
{ "id": "0199a6f0-...", "nombre": "Laura", "apellido": "Méndez", "email": "lmendez@hospital.gob.ar",
  "rol": "medico", "activo": true, "created_at": "2026-10-05T16:20:00+00:00", "updated_at": "..." }
```

## Dónde está cada cosa

**backend/**
- `routes/api.php`: rutas y qué middleware protege cada una.
- `app/Http/Controllers/Api/`: `AuthController` (login, me, logout) y `UserController` (CRUD).
- `app/Http/Requests/`: validaciones con mensajes en español (`LoginRequest`, `StoreUserRequest`,
  `UpdateUserRequest`).
- `app/Http/Middleware/EnsureUserHasRole.php`: el middleware `role:...`, registrado en `bootstrap/app.php`.
- `app/Http/Resources/UserResource.php`: formato JSON del usuario (nunca incluye la contraseña).
- `app/Enums/Rol.php` y `app/Models/User.php`: roles y modelo.
- `database/migrations/` y `database/seeders/AdminUserSeeder.php`: tablas y administrador inicial.
- `tests/Feature/`: pruebas de autenticación y permisos.

**mobile/src/**
- `app/`: pantallas (Expo Router). `_layout.tsx` de cada carpeta protege su grupo de pantallas.
- `auth/`: `AuthContext` (sesión, login y logout) y `tokenStorage` (SecureStore).
- `api/`: cliente Axios con el token y el manejo de 401, y lectura de errores de Laravel.
- `services/`: llamadas a la API (`authService`, `userService`).
- `components/`: piezas de interfaz (`ui`), paneles, formulario y listado de usuarios, guardia de rol.
- `types/` y `constants/`: tipos de TypeScript, roles, colores y URL de la API.

## Decisiones de esta etapa

- **Rol como columna** `users.rol` con tres valores fijos, como en el modelo de datos del TFI, en lugar de una
  tabla `roles`.
- **IDs UUID** (v7, ordenados por tiempo), como en el diseño de la base.
- **DELETE es baja lógica** (soft delete): el usuario desaparece del listado y no puede ingresar, pero el registro
  se conserva. Su email no se puede reutilizar.
- **El administrador no puede quitarse el rol, desactivarse ni eliminarse a sí mismo**, así nunca queda la app
  sin administrador.
- **Al desactivar a un usuario o cambiarle el rol o la contraseña**, se cierran sus sesiones: tiene que volver a
  ingresar y la app lo lleva a la pantalla de su rol.
- **Token**: Sanctum genera un token por dispositivo. El celular lo guarda cifrado con SecureStore; en el
  navegador (solo para pruebas) va en `localStorage`.
- **Sanctum en lugar de JWT**: el documento de idea menciona JWT. Sanctum usa sus propios tokens, que la API
  valida contra la tabla `personal_access_tokens`.

## Problemas frecuentes

- **«No se pudo conectar con el servidor»**: Laravel tiene que estar levantado con `--host=0.0.0.0`, el celular
  en la misma red Wi-Fi y el firewall tiene que permitir el puerto 8000. Si usás `npx expo start --tunnel`, definí
  `EXPO_PUBLIC_API_URL` con la IP de la compu.
- **`SQLSTATE[HY000] [1045] Access denied`**: revisá `DB_USERNAME` y `DB_PASSWORD` en `backend/.env`.
- **Expo Go dice que el proyecto es de otro SDK**: actualizá Expo Go a la versión para SDK 57.
- **Olvidé la contraseña del administrador**: `php artisan tinker` y luego
  `App\Models\User::where('email', 'admin@salacontrol.test')->first()->update(['password' => 'NuevaClave123']);`
