<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\PickupRequest;
use App\Models\Route;
use App\Models\Stop;
use App\Models\User;

class PickupRequestSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('TRUNCATE TABLE pickup_requests RESTART IDENTITY CASCADE');

        $south = Route::where('name', 'South')->first();
        $north = Route::where('name', 'North')->first();
        $cebu = Route::where('name', 'Cebu City')->first();

        // Pull first available passenger user IDs
        $users = User::whereNotIn('email', [
            'admin@upasakay.edu.ph',
            'juan@upasakay.com',
            'maria@upasakay.com',
            'pedro@upasakay.com',
            'ana@upasakay.com',
        ])->pluck('id')->take(5)->toArray();

        $uid = fn(int $i) => $users[$i] ?? 1;

        $stops = Stop::pluck('id')->toArray();
        $s = fn(int $i) => $stops[$i % count($stops)] ?? 1;

        $rows = [];
        // 12 pending requests across routes
        foreach ([
            $south,
            $north,
            $cebu,
            $south,
            $north,
            $cebu,
            $south,
            $north,
            $cebu,
            $south,
            $north,
            $cebu
        ] as $i => $route) {
            $rows[] = [
                'user_id' => $uid($i % 5),
                'route_id' => $route?->id ?? 1,
                'pickup_stop_id' => $s($i),
                'dropoff_stop_id' => $s($i + 1),
                'status' => 'pending',
                'completed_at' => null,
                'created_at' => now()->subMinutes(rand(1, 120)),
                'updated_at' => now(),
            ];
        }

        // Completed requests for success-rate chart
        $southId = $south?->id ?? 1;
        $northId = $north?->id ?? 1;
        $cebuId = $cebu?->id ?? 1;

        foreach (range(1, 35) as $i) { // South ~35
            $rows[] = ['user_id' => $uid($i % 5), 'route_id' => $southId, 'pickup_stop_id' => $s(0), 'dropoff_stop_id' => $s(1), 'status' => 'completed', 'completed_at' => now()->subMinutes(rand(10, 300)), 'created_at' => now()->subHours(rand(1, 8)), 'updated_at' => now()];
        }
        foreach (range(1, 28) as $i) { // North ~28
            $rows[] = ['user_id' => $uid($i % 5), 'route_id' => $northId, 'pickup_stop_id' => $s(0), 'dropoff_stop_id' => $s(1), 'status' => 'completed', 'completed_at' => now()->subMinutes(rand(10, 300)), 'created_at' => now()->subHours(rand(1, 8)), 'updated_at' => now()];
        }
        foreach (range(1, 18) as $i) { // Cebu City ~18
            $rows[] = ['user_id' => $uid($i % 5), 'route_id' => $cebuId, 'pickup_stop_id' => $s(0), 'dropoff_stop_id' => $s(1), 'status' => 'completed', 'completed_at' => now()->subMinutes(rand(10, 300)), 'created_at' => now()->subHours(rand(1, 8)), 'updated_at' => now()];
        }
        // Failed requests
        foreach (range(1, 18) as $i) {
            $routeId = [$southId, $northId, $cebuId][$i % 3];
            $rows[] = ['user_id' => $uid($i % 5), 'route_id' => $routeId, 'pickup_stop_id' => $s(0), 'dropoff_stop_id' => $s(1), 'status' => 'cancelled', 'completed_at' => null, 'created_at' => now()->subHours(rand(1, 8)), 'updated_at' => now()];
        }

        PickupRequest::insert($rows);
    }
}