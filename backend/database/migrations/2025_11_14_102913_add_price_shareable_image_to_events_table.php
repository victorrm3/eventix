<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Solo agregar las columnas si no existen
            if (!Schema::hasColumn('events', 'price')) {
                $table->decimal('price', 10, 2)->default(0)->after('capacity');
            }
            if (!Schema::hasColumn('events', 'shareable')) {
                $table->boolean('shareable')->default(false)->after('price');
            }
            if (!Schema::hasColumn('events', 'image_url')) {
                $table->string('image_url')->nullable()->after('shareable');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['price', 'shareable', 'image_url']);
        });
    }
};
