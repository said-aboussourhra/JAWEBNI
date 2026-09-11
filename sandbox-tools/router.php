<?php
/**
 * WebAssembly SAPI shim for HTTP requests.
 *
 * php-wasm sets SCRIPT_NAME/PHP_SELF to the request URI, which makes Laravel
 * (Symfony HttpFoundation) treat the current path as the application base URL
 * and generate nested URLs such as /login/login. Restoring the real
 * front-controller values fixes routing and URL generation.
 */

$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = '/jawebni/public/index.php';
$_SERVER['DOCUMENT_ROOT'] = '/jawebni/public';

if (! empty($_SERVER['HTTP_HOST']) && str_contains($_SERVER['HTTP_HOST'], ':')) {
    $_SERVER['SERVER_PORT'] = explode(':', $_SERVER['HTTP_HOST'])[1];
}

require '/jawebni/public/index.php';
