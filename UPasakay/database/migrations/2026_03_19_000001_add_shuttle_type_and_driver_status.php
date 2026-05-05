<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add shuttle_type to shuttles
        Schema::table('shuttles', function (Blueprint $table) {
            $table->string('shuttle_type')->default('van')->after('shuttle_code'); // van | minibus | bus
        });

        // Add status string to drivers (active | idle | offline | suspended)
        Schema::table('drivers', function (Blueprint $table) {
            $table->string('driver_status')->default('active')->after('is_available');
        });

        // Sync existing driver_status from is_available
        DB::table('drivers')->where('is_available', true)->update(['driver_status' => 'active']);
        DB::table('drivers')->where('is_available', false)->update(['driver_status' => 'offline']);
    }

    public function down(): void
    {
        Schema::table('shuttles', function (Blueprint $table) {
            $table->dropColumn('shuttle_type');
        });

        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn('driver_status');
        });
    }
};
