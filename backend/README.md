# SalaControl · Backend

API REST en Laravel 13 con Sanctum y MySQL: login, roles y administración de usuarios.

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
php artisan test
```

Las instrucciones completas, los endpoints y las decisiones de diseño están en el `README.md` de la carpeta
principal del proyecto.
