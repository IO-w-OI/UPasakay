<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shuttles', function (Blueprint $table) {
            // Static code physically printed on the shuttle. The passenger
            // scans/types it to confirm boarding; admin can regenerate it.
            $table->string('boarding_code', 12)->nullable()->after('shuttle_code');
            $table->index('boarding_code');
        });

        // Clean up the earlier per-request column if an old version of the
        // 2026_05_17_000002 migration already added it.
        if (Schema::hasColumn('pickup_requests', 'boarding_code')) {
            Schema::table('pickup_requests', function (Blueprint $table) {
                $table->dropIndex(['boarding_code']);
                $table->dropColumn('boarding_code');
            });
        }
    }

    public function down(): void
    {
        Schema::table('shuttles', function (Blueprint $table) {
            $table->dropIndex(['boarding_code']);
            $table->dropColumn('boarding_code');
        });
    }
};
