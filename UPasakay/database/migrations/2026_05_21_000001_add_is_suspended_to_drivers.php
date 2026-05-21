<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Suspension is an admin-controlled flag, kept separate from
        // driver_status (which now reflects only the driver's own on/off
        // duty toggle). This lets a driver be suspended without losing
        // their last duty state.
        Schema::table('drivers', function (Blueprint $table) {
            $table->boolean('is_suspended')->default(false)->after('driver_status');
        });

        // Migrate any driver previously parked at the overloaded
        // 'suspended' status onto the new flag, and reset their duty
        // status to offline.
        DB::table('drivers')->where('driver_status', 'suspended')->update([
            'is_suspended' => true,
            'driver_status' => 'offline',
        ]);
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn('is_suspended');
        });
    }
};
