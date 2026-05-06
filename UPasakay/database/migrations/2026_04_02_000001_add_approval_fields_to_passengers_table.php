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
        Schema::table('passengers', function (Blueprint $table) {
            if (! Schema::hasColumn('passengers', 'passenger_status')) {
                $table->string('passenger_status')->default('pending')->after('passenger_type');
            }

            if (! Schema::hasColumn('passengers', 'proof_document_path')) {
                $table->string('proof_document_path')->nullable()->after('passenger_status');
            }

            if (! Schema::hasColumn('passengers', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('proof_document_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('passengers', function (Blueprint $table) {
            if (Schema::hasColumn('passengers', 'reviewed_at')) {
                $table->dropColumn('reviewed_at');
            }

            if (Schema::hasColumn('passengers', 'proof_document_path')) {
                $table->dropColumn('proof_document_path');
            }

            if (Schema::hasColumn('passengers', 'passenger_status')) {
                $table->dropColumn('passenger_status');
            }
        });
    }
};
