<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_tokens', function (Blueprint $table) {
            $table->id();
            // Both anchors are nullable: a passenger token carries both
            // user_id + passenger_id, a driver/admin token carries user_id only.
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->unsignedBigInteger('passenger_id')->nullable()->index();
            // Expo push token is the natural key. It rotates on reinstall /
            // data-clear, so store() upserts on this column.
            $table->string('expo_token')->unique();
            $table->string('platform')->nullable(); // ios | android
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_tokens');
    }
};
