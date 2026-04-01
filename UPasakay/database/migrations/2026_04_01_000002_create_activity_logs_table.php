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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type');                // e.g. pickup_completed, login, assignment, shuttle_start
            $table->string('description');          // human-readable description
            $table->nullableMorphs('actor');        // polymorphic: actor_type + actor_id (User, Driver, etc.)
            $table->json('metadata')->nullable();   // extra context (route name, shuttle code, etc.)
            $table->timestamps();

            $table->index('type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
