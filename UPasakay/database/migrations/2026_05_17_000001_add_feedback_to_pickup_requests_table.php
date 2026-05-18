<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pickup_requests', function (Blueprint $table) {
            // Passenger feedback for a completed ride. The web FeedbackController
            // already reads these columns (behind Schema::hasColumn guards).
            $table->unsignedTinyInteger('rating')->nullable()->after('eta_minutes');
            $table->text('comment')->nullable()->after('rating');
            $table->boolean('replied')->default(false)->after('comment');
        });
    }

    public function down(): void
    {
        Schema::table('pickup_requests', function (Blueprint $table) {
            $table->dropColumn(['rating', 'comment', 'replied']);
        });
    }
};
