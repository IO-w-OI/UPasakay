<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['schedule', 'delay', 'change', 'alert', 'custom', 'availability', 'announcement'])->default('announcement');
            $table->string('target')->default('All');
            $table->string('target_route')->default('all'); // 'all' or specific route name
            $table->enum('audience', ['all', 'passengers', 'drivers'])->default('all');
            $table->enum('status', ['pending', 'sent', 'scheduled', 'failed'])->default('pending');
            $table->foreignId('route_id')->nullable()->constrained('routes')->nullOnDelete();
            $table->dateTime('scheduled_at')->nullable();
            $table->dateTime('sent_at')->nullable();
            $table->json('metadata')->nullable();
            $table->text('failed_reason')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('type');
            $table->index('target');
            $table->index('target_route');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
