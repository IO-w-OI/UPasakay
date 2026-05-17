<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pickup_requests', function (Blueprint $table) {
            // Short code minted when a request is accepted. The passenger app
            // renders it as a QR; the driver scans it to confirm boarding.
            $table->string('boarding_code', 12)->nullable()->after('queue_position');
            $table->index('boarding_code');

            // Stamped when the passenger actually boards (QR scan or manual).
            $table->timestamp('boarded_at')->nullable()->after('assigned_at');
        });
    }

    public function down(): void
    {
        Schema::table('pickup_requests', function (Blueprint $table) {
            $table->dropIndex(['boarding_code']);
            $table->dropColumn(['boarding_code', 'boarded_at']);
        });
    }
};
