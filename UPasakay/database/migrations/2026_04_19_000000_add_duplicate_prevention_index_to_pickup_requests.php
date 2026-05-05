<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a unique index to prevent duplicate active bookings
     * This index covers the combination of user, route, and stops
     * We will rely on application logic to check the status
     */
    public function up(): void
    {
        Schema::table('pickup_requests', function (Blueprint $table) {
            // Add a composite index on (user_id, route_id, pickup_stop_id, dropoff_stop_id)
            // This helps with query performance when checking for duplicates
            $table->index(['user_id', 'route_id', 'pickup_stop_id', 'dropoff_stop_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pickup_requests', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'route_id', 'pickup_stop_id', 'dropoff_stop_id']);
        });
    }
};
