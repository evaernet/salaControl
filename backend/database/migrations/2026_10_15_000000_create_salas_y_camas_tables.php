<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 80)->unique();
            $table->timestamps();
        });

        // "Ocupada" no se guarda acá: va a salir de si la cama tiene un paciente.
        Schema::create('camas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sala_id')->constrained('salas')->cascadeOnDelete();
            $table->unsignedSmallInteger('numero');
            $table->enum('estado', ['libre', 'limpieza', 'fuera_de_servicio'])->default('libre');
            $table->timestamps();

            $table->unique(['sala_id', 'numero']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('camas');
        Schema::dropIfExists('salas');
    }
};
