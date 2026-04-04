<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stops', function (Blueprint $table) {
            $table->unsignedInteger('sequence')->default(0)->after('name');
        });

        // Assign default sequence values to existing stops (ordered by id within each route)
        $stops = DB::table('stops')->orderBy('route_id')->orderBy('id')->get();
        $routeCounters = [];

        foreach ($stops as $stop) {
            $routeId = $stop->route_id;
            if (! isset($routeCounters[$routeId])) {
                $routeCounters[$routeId] = 1;
            }
            DB::table('stops')
                ->where('id', $stop->id)
                ->update(['sequence' => $routeCounters[$routeId]]);
            $routeCounters[$routeId]++;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stops', function (Blueprint $table) {
            $table->dropColumn('sequence');
        });
    }
};
