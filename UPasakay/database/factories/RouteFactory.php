<?php

namespace Database\Factories;

use App\Models\Route;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Route>
 */
class RouteFactory extends Factory
{
    protected $model = Route::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->streetName(),
            'start_location' => fake()->city(),
            'end_location' => fake()->city(),
            'distance_km' => fake()->randomFloat(2, 1, 50),
            'estimated_duration_minutes' => fake()->numberBetween(10, 120),
            'is_active' => true,
        ];
    }
}
