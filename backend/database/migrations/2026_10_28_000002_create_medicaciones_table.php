<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Indicaciones del médico. Los horarios y los días que faltan se calculan
    // con inicio + cada_horas + dias, no se guardan.
    public function up(): void
    {
        Schema::create('medicaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->cascadeOnDelete();
            $table->string('nombre', 120);
            $table->string('dosis', 60);
            $table->string('via', 30);
            $table->unsignedTinyInteger('cada_horas');
            $table->unsignedSmallInteger('dias')->nullable();
            $table->dateTime('inicio');
            $table->dateTime('suspendida')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicaciones');
    }
};
