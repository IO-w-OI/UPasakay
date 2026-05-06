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
        if (Schema::hasTable('passengers')) {
            // Only drop the old 'course' column if it exists (keeps migrations idempotent
            // for environments where the original migration was adjusted).
            if (Schema::hasColumn('passengers', 'course')) {
                Schema::table('passengers', function (Blueprint $table) {
                    $table->dropColumn('course');
                });
            }

            Schema::table('passengers', function (Blueprint $table) {
                if (! Schema::hasColumn('passengers', 'department')) {
                    $table->string('department')->nullable();
                }
                if (! Schema::hasColumn('passengers', 'passenger_type')) {
                    $table->string('passenger_type')->default('student'); // student | staff | faculty
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('passengers')) {
            Schema::table('passengers', function (Blueprint $table) {
                if (Schema::hasColumn('passengers', 'department')) {
                    $table->dropColumn('department');
                }
                if (Schema::hasColumn('passengers', 'passenger_type')) {
                    $table->dropColumn('passenger_type');
                }
                if (! Schema::hasColumn('passengers', 'course')) {
                    $table->string('course')->nullable();
                }
            });
        }
    }
};
