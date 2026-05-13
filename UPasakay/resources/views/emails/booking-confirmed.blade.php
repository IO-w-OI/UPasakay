<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
</head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1f2937;">
    <h1 style="font-size: 1.25rem;">Booking confirmed</h1>
    <p>Hi {{ $pickupRequest->user?->name ?? 'there' }},</p>
    <p>Your shuttle pickup request has been accepted. Here are the details:</p>
    <ul>
        <li><strong>Request ID:</strong> #{{ $pickupRequest->id }}</li>
        <li><strong>Route:</strong> {{ $pickupRequest->route?->name ?? '—' }}</li>
        <li><strong>Pickup:</strong> {{ $pickupRequest->pickupStop?->name ?? '—' }}</li>
        <li><strong>Drop-off:</strong> {{ $pickupRequest->dropoffStop?->name ?? '—' }}</li>
        @if($pickupRequest->assignment?->driver)
            <li><strong>Driver:</strong> {{ $pickupRequest->assignment->driver->full_name }}</li>
        @endif
        @if($pickupRequest->eta_minutes !== null)
            <li><strong>Estimated time to pickup:</strong> ~{{ $pickupRequest->eta_minutes }} minutes</li>
        @endif
    </ul>
    <p>Thank you for using UPasakay.</p>
</body>
</html>
