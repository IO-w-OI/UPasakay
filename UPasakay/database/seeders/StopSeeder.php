<?php

namespace Database\Seeders;

use App\Models\Route;
use App\Models\Stop;
use Illuminate\Database\Seeder;

class StopSeeder extends Seeder
{
    /**
     * Canonical stops per route — kept in sync with the web admin map data in
     * resources/js/data/routeData.ts so the driver app shows the same stops
     * the admin sees. Idempotent (updateOrCreate keyed by route + name): safe
     * to re-run on production without wiping stops referenced by pickup
     * requests (pickup_stop_id has no cascade-on-delete).
     */
    public function run(): void
    {
        $routes = [
            'Cebu City' => [
                ['Bacayan', 10.370231192895845, 123.91939456782869],
                ['Gaisano Talamban', 10.366354532260916, 123.9137593968295],
                ['Cabancalan', 10.350996808797992, 123.92415954908583],
                ['USPF (front)', 10.329066480061208, 123.90216149375473],
                ['JY Square', 10.330508129133642, 123.89792033979448],
                ['Corner Sudlon', 10.32854085813706, 123.89729405708417],
                ['UP Cebu Lahug', 10.32240110974636, 123.89839499974325],
            ],
            'South' => [
                ['Gaisano Tabunok', 10.2657, 123.8419],
                ['University of Cebu - Pardo & Talisay', 10.2720425, 123.8476984],
                ['Shopwise / SuperMetro Mambaling', 10.2899117, 123.87033],
                ['Jollibee Punta Princesa', 10.295489, 123.8696003],
                ['Gaisano Tisa', 10.299779, 123.869784],
                ['CCNSHS (Bus Stop)', 10.300318, 123.878662],
                ['Guadalupe (Jollibee)', 10.3155822, 123.885001],
                ['Capitol (Metrobank)', 10.3161199, 123.8912534],
                ['UP Cebu (Oblation Sq.)', 10.322385, 123.898391],
            ],
            'North' => [
                ['SM Consolacion', 10.379421466919222, 123.96500992917743],
                ["Home Builder's Consolacion", 10.378576269510365, 123.96361680702032],
                ['UP Cebu Lahug', 10.32240110974636, 123.89839499974325],
                ['Pacific Mall Mandaue', 10.340956164883575, 123.9485818683762],
                ['Gaisano Island Mall', 10.317342554183213, 123.96261657121796],
                ['San Miguel Brewery - Tipolo', 10.330419131323268, 123.93289450989764],
                ['Hipodromo', 10.313965655571439, 123.91404037008384],
                ['CIC / Camp Sotero Cabahug', 10.312423759176745, 123.90317026577462],
            ],
        ];

        foreach ($routes as $routeName => $stops) {
            $route = Route::where('name', $routeName)->first();
            if (! $route) {
                $this->command?->warn("Route '{$routeName}' not found — skipping its stops.");
                continue;
            }

            foreach ($stops as $i => [$name, $lat, $lng]) {
                Stop::updateOrCreate(
                    ['route_id' => $route->id, 'name' => $name],
                    [
                        'sequence' => $i + 1,
                        'latitude' => $lat,
                        'longitude' => $lng,
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
