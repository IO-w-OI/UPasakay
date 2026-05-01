<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Vercel's filesystem is read-only except /tmp.
// Symlink writable Laravel directories into /tmp.
$tmpStorage = '/tmp/storage';
$appStorage = __DIR__ . '/../storage';

if (!is_dir($tmpStorage)) {
    // Copy the storage skeleton to /tmp so Laravel can write to it
    $dirs = [
        '/tmp/storage/app/public',
        '/tmp/storage/framework/cache/data',
        '/tmp/storage/framework/sessions',
        '/tmp/storage/framework/testing',
        '/tmp/storage/framework/views',
        '/tmp/storage/logs',
        '/tmp/bootstrap/cache',
    ];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__ . '/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__ . '/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__ . '/../bootstrap/app.php';

// Point Laravel storage and cache to /tmp
$app->useStoragePath('/tmp/storage');
$app->bootstrapPath('/tmp/bootstrap');

$app->handleRequest(Request::capture());

