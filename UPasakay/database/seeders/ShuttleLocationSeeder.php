<?php

namespace Database\Seeders;

use App\Models\Shuttle;
use App\Models\ShuttleLocation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShuttleLocationSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('shuttle_locations')->truncate();

        $shuttles = Shuttle::with('route')->get();

        // Real coordinates along each route (between stops)
        $routePoints = [
            'North' => [
                // UP Cebu → Banilad → Talamban Junction → Mandaue → Consolacion
                ['lat' => 10.3200, 'lng' => 123.8900, 'speed' => 25],
                ['lat' => 10.3275, 'lng' => 123.9050, 'speed' => 30],
                ['lat' => 10.3370, 'lng' => 123.9100, 'speed' => 35],
                ['lat' => 10.3450, 'lng' => 123.9130, 'speed' => 28],
                ['lat' => 10.3390, 'lng' => 123.9343, 'speed' => 32],
                ['lat' => 10.3580, 'lng' => 123.9450, 'speed' => 30],
                ['lat' => 10.3778, 'lng' => 123.9562, 'speed' => 0],
            ],
            'South' => [
                // UP Cebu → Fuente → Capitol → Bulacao → Tabunok
                ['lat' => 10.3140, 'lng' => 123.8870, 'speed' => 20],
                ['lat' => 10.3100, 'lng' => 123.8907, 'speed' => 25],
                ['lat' => 10.3040, 'lng' => 123.8920, 'speed' => 30],
                ['lat' => 10.2994, 'lng' => 123.8924, 'speed' => 28],
                ['lat' => 10.2880, 'lng' => 123.8780, 'speed' => 35],
                ['lat' => 10.2787, 'lng' => 123.8672, 'speed' => 30],
                ['lat' => 10.2615, 'lng' => 123.8470, 'speed' => 0],
            ],
            'Cebu City' => [
                // UP Cebu → JY Square → Pit-os → Talamban
                ['lat' => 10.3190, 'lng' => 123.8880, 'speed' => 15],
                ['lat' => 10.3270, 'lng' => 123.8958, 'speed' => 20],
                ['lat' => 10.3340, 'lng' => 123.8985, 'speed' => 25],
                ['lat' => 10.3400, 'lng' => 123.9010, 'speed' => 22],
                ['lat' => 10.3553, 'lng' => 123.9128, 'speed' => 0],
            ],
        ];

        foreach ($shuttles as $shuttle) {
            $routeName = $shuttle->route?->name;
            if (! $routeName || ! isset($routePoints[$routeName])) {
                continue;
            }

            $points = $routePoints[$routeName];

            // Pick a position along the route based on shuttle status
            if ($shuttle->status === 'active') {
                // Active shuttles: place midway along route
                $idx = (int) floor(count($points) / 2);
                $point = $points[$idx];
            } elseif ($shuttle->status === 'idle') {
                // Idle shuttles: place near UP Cebu (start)
                $point = $points[0];
            } else {
                // Offline: place at UP Cebu base
                $point = ['lat' => 10.3157, 'lng' => 123.8854, 'speed' => 0];
            }

            // Insert a few recent location records for realistic trail
            for ($i = 0; $i < 3; $i++) {
                ShuttleLocation::create([
                    'shuttle_id' => $shuttle->id,
                    'latitude' => $point['lat'] + ($i * 0.0003),
                    'longitude' => $point['lng'] + ($i * 0.0004),
                    'speed_kmh' => $shuttle->status === 'active' ? $point['speed'] : 0,
                    'recorded_at' => now()->subMinutes(5 - $i * 2),
                ]);
            }
        }
    }
}
