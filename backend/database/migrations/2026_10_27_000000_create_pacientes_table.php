<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Cada fila es una internación. Si el paciente vuelve, se carga una nueva
    // y la anterior queda como historial (fecha_alta con valor).
    public function up(): void
    {
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cama_id')->nullable()->constrained('camas')->nullOnDelete();
            $table->string('nombre', 80);
            $table->string('apellido', 80);
            $table->date('fecha_nacimiento');
            $table->decimal('peso', 5, 2)->nullable();
            $table->string('diagnostico', 200);
            $table->string('diagnosticos_base', 500)->nullable();
            $table->enum('aislamiento', ['ninguno', 'contacto', 'gotitas', 'aereo'])->default('ninguno');
            $table->string('alergias', 200)->nullable();
            $table->string('obra_social', 80)->nullable();
            $table->string('acompanante', 120)->nullable();
            $table->string('acompanante_telefono', 40)->nullable();
            $table->dateTime('fecha_ingreso');
            $table->dateTime('fecha_alta')->nullable();
            $table->timestamps();

            $table->index(['apellido', 'nombre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pacientes');
    }
};
