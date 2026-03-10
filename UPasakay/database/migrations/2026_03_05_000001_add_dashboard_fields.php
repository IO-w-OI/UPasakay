<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Add slug-style code, status, current route, driver, and last_seen to shuttles
        Schema::table('shuttles', function (Blueprint $table) {
            $table->string('shuttle_code')->unique()->nullable()->after('id');
            $table->string('status')->default('offline')->after('is_active'); // active | idle | offline
            $table->foreignId('route_id')->nullable()->constrained('routes')->nullOnDelete()->after('status');
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete()->after('route_id');
            $table->timestamp('last_seen_at')->nullable()->after('driver_id');
        });

        // Add full_name to drivers
        Schema::table('drivers', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('shuttles', function (Blueprint $table) {
            $table->dropForeign(['route_id']);
            $table->dropForeign(['driver_id']);
            $table->dropColumn(['shuttle_code', 'status', 'route_id', 'driver_id', 'last_seen_at']);
        });

        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn('full_name');
        });
    }
};
