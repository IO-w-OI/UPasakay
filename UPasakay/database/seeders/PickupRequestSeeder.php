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

        $north = Route::where('name', 'North')->first();
        $south = Route::where('name', 'South')->first();
        $cebu = Route::where('name', 'Cebu City')->first();

        // Stops grouped by route for correct pickup/dropoff pairing
        $northStops = Stop::where('route_id', $north->id)->pluck('id')->toArray();
        $southStops = Stop::where('route_id', $south->id)->pluck('id')->toArray();
        $cebuStops = Stop::where('route_id', $cebu->id)->pluck('id')->toArray();

        $routeStops = [
            $north->id => $northStops,
            $south->id => $southStops,
            $cebu->id => $cebuStops,
        ];

        // Pull passenger user IDs
        $users = User::whereNotIn('email', [
            'admin@upasakay.edu.ph',
            'juan@upasakay.com',
            'maria@upasakay.com',
            'pedro@upasakay.com',
            'ana@upasakay.com',
        ])->pluck('id')->take(5)->toArray();

        $uid = fn(int $i) => $users[$i % count($users)] ?? 1;

        // Helper: pick a random pickup & dropoff within the same route
        $pickDrop = function (int $routeId) use ($routeStops) {
            $stops = $routeStops[$routeId];
            $pickup = $stops[array_rand($stops)];
            do {
                $dropoff = $stops[array_rand($stops)];
            } while ($dropoff === $pickup);
            return [$pickup, $dropoff];
        };

        $rows = [];
        $routes = [$north, $south, $cebu];

        // 12 pending requests (4 per route)
        foreach ($routes as $ri => $route) {
            for ($j = 0; $j < 4; $j++) {
                [$p, $d] = $pickDrop($route->id);
                $rows[] = [
                    'user_id' => $uid($ri * 4 + $j),
                    'route_id' => $route->id,
                    'pickup_stop_id' => $p,
                    'dropoff_stop_id' => $d,
                    'status' => 'pending',
                    'completed_at' => null,
                    'created_at' => now()->subMinutes(rand(1, 120)),
                    'updated_at' => now(),
                ];
            }
        }

        // Completed requests for success-rate chart
        foreach (range(1, 35) as $i) { // South ~35
            [$p, $d] = $pickDrop($south->id);
            $rows[] = ['user_id' => $uid($i), 'route_id' => $south->id, 'pickup_stop_id' => $p, 'dropoff_stop_id' => $d, 'status' => 'completed', 'completed_at' => now()->subMinutes(rand(10, 300)), 'created_at' => now()->subHours(rand(1, 8)), 'updated_at' => now()];
        }
        foreach (range(1, 28) as $i) { // North ~28
            [$p, $d] = $pickDrop($north->id);
            $rows[] = ['user_id' => $uid($i), 'route_id' => $north->id, 'pickup_stop_id' => $p, 'dropoff_stop_id' => $d, 'status' => 'completed', 'completed_at' => now()->subMinutes(rand(10, 300)), 'created_at' => now()->subHours(rand(1, 8)), 'updated_at' => now()];
        }
        foreach (range(1, 18) as $i) { // Cebu City ~18
            [$p, $d] = $pickDrop($cebu->id);
            $rows[] = ['user_id' => $uid($i), 'route_id' => $cebu->id, 'pickup_stop_id' => $p, 'dropoff_stop_id' => $d, 'status' => 'completed', 'completed_at' => now()->subMinutes(rand(10, 300)), 'created_at' => now()->subHours(rand(1, 8)), 'updated_at' => now()];
        }

        // Failed/cancelled requests
        foreach (range(1, 18) as $i) {
            $route = $routes[$i % 3];
            [$p, $d] = $pickDrop($route->id);
            $rows[] = ['user_id' => $uid($i), 'route_id' => $route->id, 'pickup_stop_id' => $p, 'dropoff_stop_id' => $d, 'status' => 'cancelled', 'completed_at' => null, 'created_at' => now()->subHours(rand(1, 8)), 'updated_at' => now()];
        }

        PickupRequest::insert($rows);
    }
}