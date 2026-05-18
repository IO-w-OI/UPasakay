<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account approved</title>
</head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1f2937;">
    <h1 style="font-size: 1.25rem;">You're approved &mdash; welcome aboard!</h1>
    <p>Hi {{ $passenger->full_name ?? 'there' }},</p>
    <p style="font-size: 1.1rem; font-weight: 700; color: #701929;">
        Your UPasakay account has been approved by the administration.
    </p>
    <p>You can now log in to the UPasakay app and start booking rides.</p>
    <p>If you were already signed in on the "Account Under Review" screen, just log in again to continue.</p>
    <p>&mdash; UPasakay</p>
</body>
</html>
