<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Keep the newest row for duplicate driver user mappings before adding a unique index.
        $duplicateDriverUserIds = DB::table('drivers')
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('user_id');

        foreach ($duplicateDriverUserIds as $userId) {
            $idsToDelete = DB::table('drivers')
                ->where('user_id', $userId)
                ->orderByDesc('id')
                ->skip(1)
                ->pluck('id');

            if ($idsToDelete->isNotEmpty()) {
                DB::table('drivers')->whereIn('id', $idsToDelete)->delete();
            }
        }

        // Keep only the newest assignment per pickup request before enforcing one-to-one assignment.
        $duplicateAssignmentPickupIds = DB::table('driver_assignments')
            ->select('pickup_request_id')
            ->groupBy('pickup_request_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('pickup_request_id');

        foreach ($duplicateAssignmentPickupIds as $pickupRequestId) {
            $idsToDelete = DB::table('driver_assignments')
                ->where('pickup_request_id', $pickupRequestId)
                ->orderByDesc('id')
                ->skip(1)
                ->pluck('id');

            if ($idsToDelete->isNotEmpty()) {
                DB::table('driver_assignments')->whereIn('id', $idsToDelete)->delete();
            }
        }

        Schema::table('drivers', function (Blueprint $table) {
            $table->unique('user_id', 'drivers_user_id_unique');
        });

        Schema::table('driver_assignments', function (Blueprint $table) {
            $table->unique('pickup_request_id', 'driver_assignments_pickup_request_id_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('driver_assignments', function (Blueprint $table) {
            $table->dropUnique('driver_assignments_pickup_request_id_unique');
        });

        Schema::table('drivers', function (Blueprint $table) {
            $table->dropUnique('drivers_user_id_unique');
        });
    }
};
