<?php

use App\Models\Shuttle;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Give every shuttle that predates the boarding_code column a permanent
     * code, so it can be printed/posted without an admin clicking Regenerate
     * on each one. Idempotent — only touches rows with no code yet.
     */
    public function up(): void
    {
        Shuttle::query()
            ->where(function ($q) {
                $q->whereNull('boarding_code')->orWhere('boarding_code', '');
            })
            ->each(function (Shuttle $shuttle) {
                $shuttle->update([
                    'boarding_code' => Shuttle::generateUniqueBoardingCode(),
                ]);
            });
    }

    public function down(): void
    {
        // No-op: do not wipe live, possibly-already-printed codes.
    }
};
