<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notification_schedules', function (Blueprint $table) {
            // The date (Manila time) a recurring schedule last fired — guards
            // the processor against sending the same schedule twice in a day.
            $table->date('last_sent_on')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('notification_schedules', function (Blueprint $table) {
            $table->dropColumn('last_sent_on');
        });
    }
};
