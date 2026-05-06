<?php

return [
    'registration' => [
        // Set to false to disable public admin sign-up page/flow.
        'enabled' => env('ADMIN_REGISTRATION_ENABLED', true),

        // Optional invite code required during admin registration when set.
        'invite_code' => env('ADMIN_REGISTRATION_INVITE_CODE'),
    ],
];
