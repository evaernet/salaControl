<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Sala donde trabaja cada usuario. Vacío = puede ver todas las salas.
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('sala_id')->nullable()->after('activo')->constrained('salas')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sala_id');
        });
    }
};
