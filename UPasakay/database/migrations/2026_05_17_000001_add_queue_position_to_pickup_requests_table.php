<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pickup_requests', function (Blueprint $table) {
            // Position in the route's waiting queue for requests that exceed
            // the assigned shuttle's capacity (null = accepted / not queued).
            $table->unsignedInteger('queue_position')->nullable()->after('eta_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('pickup_requests', function (Blueprint $table) {
            $table->dropColumn('queue_position');
        });
    }
};
