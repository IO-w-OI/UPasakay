<?php

namespace Database\Factories;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Admin>
 */
class AdminFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'access_level' => $this->faker->randomElement([1, 2]),
        ];
    }

    /**
     * Create a super admin.
     */
    public function superAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'access_level' => 2,
        ]);
    }

    /**
     * Create a regular admin.
     */
    public function regularAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'access_level' => 1,
        ]);
    }
}
