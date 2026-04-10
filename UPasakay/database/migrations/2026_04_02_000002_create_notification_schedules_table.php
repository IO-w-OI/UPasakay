<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notification_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Morning Peak Hour"
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['availability', 'delay', 'change', 'announcement'])->default('announcement');
            $table->string('target_route')->default('all'); // 'all' or specific route name
            $table->enum('audience', ['all', 'passengers', 'drivers'])->default('all');
            $table->enum('frequency', ['daily', 'weekdays', 'weekends', 'custom'])->default('daily');
            $table->time('time'); // e.g., "06:00" (24-hour format)
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active');
            $table->index('frequency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_schedules');
    }
};
