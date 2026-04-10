<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\DriverAssignment;

class DriverAssignmentObserver
{
    /**
     * Handle the DriverAssignment "created" event.
     */
    public function created(DriverAssignment $assignment): void
    {
        $driver = $assignment->driver;
        $driverName = $driver?->full_name ?? 'Unknown driver';

        ActivityLog::log(
            type: 'assignment_created',
            description: "Driver {$driverName} assigned to pickup #{$assignment->pickup_request_id}",
            actor: $driver?->user,
            metadata: [
                'driver_assignment_id' => $assignment->id,
                'driver_name' => $driverName,
                'pickup_request_id' => $assignment->pickup_request_id,
            ],
        );
    }
}
