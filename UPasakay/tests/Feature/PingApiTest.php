<?php

namespace Tests\Feature;

use Tests\TestCase;

class PingApiTest extends TestCase
{
    public function test_ping_returns_ok_without_authentication(): void
    {
        $response = $this->getJson('/api/ping');

        $response->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonStructure(['status', 'time']);
    }
}
