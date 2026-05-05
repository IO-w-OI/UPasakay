<?php

namespace Database\Seeders;

use App\Models\Route;
use App\Models\Stop;
use Illuminate\Database\Seeder;

class StopSeeder extends Seeder
{
    public function run(): void
    {
        Stop::query()->delete();

        $north = Route::where('name', 'North')->first();
        $south = Route::where('name', 'South')->first();
        $cebu = Route::where('name', 'Cebu City')->first();

        Stop::insert([
            // ── North Route: UP Cebu → Consolacion → UP Cebu ──────────────
            // 5:30 Dep UP, 6:00 Arr Consolacion, 6:40 Arr UP
            ['route_id' => $north->id, 'name' => 'UP Cebu (Lahug)', 'latitude' => 10.3157, 'longitude' => 123.8854, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['route_id' => $north->id, 'name' => 'Banilad (IT Park)', 'latitude' => 10.3275, 'longitude' => 123.9050, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['route_id' => $north->id, 'name' => 'Talamban Junction', 'latitude' => 10.3450, 'longitude' => 123.9130, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['route_id' => $north->id, 'name' => 'Mandaue (A.C. Cortes)', 'latitude' => 10.3390, 'longitude' => 123.9343, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['route_id' => $north->id, 'name' => 'Consolacion Town Proper', 'latitude' => 10.3778, 'longitude' => 123.9562, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // ── South Route: UP Cebu → Tabunok → UP Cebu ─────────────────
            // 5:30 Dep UP, 6:00 Arr Tabunok, 6:30 Arr UP
            ['route_id' => $south->id, 'name' => 'UP Cebu (Lahug)', 'latitude' => 10.3157, 'longitude' => 123.8854, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['route_id' => $south->id, 'name' => 'Fuente Osmeña', 'latitude' => 10.3100, 'longitude' => 123.8907, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['route_id' => $south->id, 'name' => 'Capitol Site', 'latitude' => 10.2994, 'longitude' => 123.8924, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['route_id' => $south->id, 'name' => 'Bulacao', 'latitude' => 10.2787, 'longitude' => 123.8672, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['route_id' => $south->id, 'name' => 'Tabunok (Talisay)', 'latitude' => 10.2615, 'longitude' => 123.8470, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // ── Cebu City Route: UP Cebu → Talamban → UP Cebu ─────────────
            // 6:00 Dep UP, 6:30 Arr Talamban, 7:00 Arr UP
            ['route_id' => $cebu->id, 'name' => 'UP Cebu (Lahug)', 'latitude' => 10.3157, 'longitude' => 123.8854, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['route_id' => $cebu->id, 'name' => 'JY Square Mall', 'latitude' => 10.3270, 'longitude' => 123.8958, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['route_id' => $cebu->id, 'name' => 'Pit-os', 'latitude' => 10.3400, 'longitude' => 123.9010, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['route_id' => $cebu->id, 'name' => 'Talamban Proper', 'latitude' => 10.3553, 'longitude' => 123.9128, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
