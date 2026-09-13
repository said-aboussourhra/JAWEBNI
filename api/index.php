<?php

declare(strict_types=1);

use Illuminate\Contracts\Console\Kernel as ConsoleKernel;
use Illuminate\Contracts\Http\Kernel as HttpKernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Serverless entry point (Vercel + vercel-php runtime)
|--------------------------------------------------------------------------
|
| Vercel mounts the deployment read-only: /tmp is the only writable
| directory. Every path Laravel writes to (compiled views, sessions, caches,
| the SQLite file) is therefore redirected under /tmp.
|
| When no external database is configured through environment variables, a
| throwaway SQLite database is created, migrated and seeded on the first
| request, so a fresh deployment works immediately with the demo workspace.
| Set DB_CONNECTION / DB_HOST / DB_DATABASE / DB_USERNAME / DB_PASSWORD in
| the Vercel dashboard to use MySQL or PostgreSQL instead.
|
*/

$root = dirname(__DIR__);
$tmp = sys_get_temp_dir() . '/jawebni';

$writableDirectories = [
    $tmp . '/storage/app/public',
    $tmp . '/storage/framework/cache/data',
    $tmp . '/storage/framework/sessions',
    $tmp . '/storage/framework/testing',
    $tmp . '/storage/framework/views',
    $tmp . '/storage/logs',
    $tmp . '/cache',
    $tmp . '/database',
];

foreach ($writableDirectories as $directory) {
    if (! is_dir($directory)) {
        @mkdir($directory, 0775, true);
    }
}

// Keep every compiled cache inside /tmp as well.
foreach ([
    'APP_CONFIG_CACHE' => $tmp . '/cache/config.php',
    'APP_ROUTES_CACHE' => $tmp . '/cache/routes-v7.php',
    'APP_EVENTS_CACHE' => $tmp . '/cache/events.php',
    'APP_SERVICES_CACHE' => $tmp . '/cache/services.php',
    'APP_PACKAGES_CACHE' => $tmp . '/cache/packages.php',
] as $name => $path) {
    putenv($name . '=' . $path);
    $_ENV[$name] = $path;
    $_SERVER[$name] = $path;
}

require $root . '/vendor/autoload.php';

/** @var Illuminate\Foundation\Application $app */
$app = require_once $root . '/bootstrap/app.php';
$app->useStoragePath($tmp . '/storage');

// ---------------------------------------------------------------------------
// Database bootstrap: create + seed a SQLite database on first cold start.
// ---------------------------------------------------------------------------
$app->make(ConsoleKernel::class)->bootstrap();

if (config('database.default') === 'sqlite') {
    $database = (string) config('database.connections.sqlite.database');

    if ($database !== '' && $database !== ':memory:' && ! file_exists($database)) {
        if (! is_dir(dirname($database))) {
            @mkdir(dirname($database), 0775, true);
        }

        touch($database);

        Artisan::call('migrate', ['--force' => true, '--no-interaction' => true]);
        Artisan::call('db:seed', ['--force' => true, '--no-interaction' => true]);
    }
}

// ---------------------------------------------------------------------------
// Handle the request.
// ---------------------------------------------------------------------------
$kernel = $app->make(HttpKernel::class);

$response = $kernel->handle($request = Request::capture());
$response->send();
$kernel->terminate($request, $response);
