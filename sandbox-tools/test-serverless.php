<?php
// Simulates a Vercel request through api/index.php.
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = '/jawebni/api/index.php';
$_SERVER['DOCUMENT_ROOT'] = '/jawebni/public';
$_SERVER['HTTPS'] = 'on';
$_SERVER['SERVER_PORT'] = 443;

// Force the throwaway database used by the serverless deployment.
$db = getenv('JAWEBNI_TEST_DB') ?: '/tmp/jawebni/database/database.sqlite';
foreach (['DB_CONNECTION' => 'sqlite', 'DB_DATABASE' => $db,
          'SESSION_DRIVER' => 'cookie', 'CACHE_STORE' => 'array',
          'QUEUE_CONNECTION' => 'sync', 'LOG_CHANNEL' => 'stderr',
          'APP_ENV' => 'production', 'APP_DEBUG' => 'false'] as $k => $v) {
    putenv("$k=$v");
    $_ENV[$k] = $v;
    $_SERVER[$k] = $v;
}
putenv('APP_KEY=base64:c6YW+woES+8Wa3ryslZeaDDVTHBJI75AeoFbnaconMU=');
$_ENV['APP_KEY'] = $_SERVER['APP_KEY'] = 'base64:c6YW+woES+8Wa3ryslZeaDDVTHBJI75AeoFbnaconMU=';

require '/jawebni/api/index.php';

// diagnostics (run after the response has been flushed)
echo "\n[diag] db=" . config('database.connections.sqlite.database')
    . " exists=" . (file_exists(config('database.connections.sqlite.database')) ? 'yes' : 'no')
    . " users=" . App\Models\User::count()
    . " businesses=" . App\Modules\Tenancy\Models\Business::count()
    . " messages=" . App\Modules\WhatsAppBot\Models\Message::count()
    . " tmp=" . sys_get_temp_dir();
