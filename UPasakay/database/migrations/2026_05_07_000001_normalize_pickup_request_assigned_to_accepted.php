<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Aligns legacy pickup_requests rows with the accepted vocabulary used by the web UI and APIs.
     */
    public function up(): void
    {
        DB::table('pickup_requests')->where('status', 'assigned')->update(['status' => 'accepted']);
    }

    /**
     * Reverse the migrations.
     *
     * Intentionally no-op: reverting would incorrectly downgrade rows that were originally "accepted".
     */
    public function down(): void
    {
        //
    }
};
