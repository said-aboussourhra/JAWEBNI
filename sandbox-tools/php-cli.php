<?php
/**
 * CLI shim for the WebAssembly SAPI.
 *
 * php-wasm exposes no STDIN/STDOUT/STDERR constants and leaves $argv empty, so
 * the target script and its arguments are passed through the environment.
 */

if (! defined('STDOUT')) {
    define('STDOUT', fopen('php://stdout', 'w'));
}
if (! defined('STDERR')) {
    define('STDERR', fopen('php://stderr', 'w'));
}
if (! defined('STDIN')) {
    define('STDIN', fopen('php://stdin', 'r'));
}

$target = getenv('JAWEBNI_CLI_TARGET');
if (! $target) {
    fwrite(STDERR, 'Missing JAWEBNI_CLI_TARGET' . PHP_EOL);
    exit(1);
}
if (! is_file($target)) {
    fwrite(STDERR, "Invalid JAWEBNI_CLI_TARGET: '" . $target . "'" . PHP_EOL);
    exit(1);
}

$args = json_decode((string) getenv('JAWEBNI_CLI_ARGS'), true) ?: [];

$_SERVER['argv'] = array_values(array_merge([$target], $args));
$_SERVER['argc'] = count($_SERVER['argv']);
$GLOBALS['argv'] = $_SERVER['argv'];
$GLOBALS['argc'] = $_SERVER['argc'];

putenv('COMPOSER=/jawebni/composer.json');
$_SERVER['COMPOSER'] = '/jawebni/composer.json';
putenv('COMPOSER_HOME=/tmp/composer-home');
putenv('COMPOSER_ALLOW_SUPERUSER=1');
putenv('APP_RUNNING_IN_CONSOLE=true');
$_SERVER['APP_RUNNING_IN_CONSOLE'] = 'true';
$_ENV['APP_RUNNING_IN_CONSOLE'] = 'true';

require $target;
