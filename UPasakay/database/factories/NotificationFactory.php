<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\Route;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['schedule', 'delay', 'change', 'alert', 'custom'];
        $statuses = ['pending', 'sent', 'scheduled', 'failed'];
        $targets = ['All', 'North', 'South', 'East', 'West'];

        return [
            'title' => fake()->sentence(),
            'type' => fake()->randomElement($types),
            'message' => fake()->paragraph(),
            'status' => fake()->randomElement($statuses),
            'target' => fake()->randomElement($targets),
            'target_route' => 'all',
            'audience' => 'all',
            'route_id' => fake()->randomElement([null, null, Route::factory()]),
            'scheduled_at' => fake()->dateTimeBetween('-7 days', '+30 days'),
            'sent_at' => fake()->optional()->dateTime(),
            'metadata' => null,
            'failed_reason' => null,
        ];
    }

    /**
     * Indicate that the notification is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'sent_at' => null,
            'scheduled_at' => null,
        ]);
    }

    /**
     * Indicate that the notification is sent.
     */
    public function sent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    /**
     * Indicate that the notification is scheduled.
     */
    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'scheduled',
            'sent_at' => null,
            'scheduled_at' => now()->addHours(fake()->numberBetween(1, 48)),
        ]);
    }

    /**
     * Indicate that the notification failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
        ]);
    }

    /**
     * Indicate the notification is of type schedule.
     */
    public function schedule(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'schedule',
        ]);
    }

    /**
     * Indicate the notification is of type delay.
     */
    public function delay(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'delay',
        ]);
    }

    /**
     * Indicate the notification is of type change.
     */
    public function change(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'change',
        ]);
    }
}
