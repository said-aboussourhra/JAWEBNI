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

$host = (string) ($_SERVER['HTTP_HOST'] ?? '');
$forwardedProto = strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''));
$isHttps = $forwardedProto === 'https'
    || str_ends_with($host, '.e2b.app')
    || str_ends_with($host, '.e2b.dev');

if ($isHttps) {
    // The preview is served over HTTPS behind a proxy: without this Laravel
    // emits http:// redirects, which browsers block inside the HTTPS frame.
    $_SERVER['HTTPS'] = 'on';
    $_SERVER['SERVER_PORT'] = 443;
    $_SERVER['REQUEST_SCHEME'] = 'https';
} elseif (str_contains($host, ':')) {
    $_SERVER['SERVER_PORT'] = explode(':', $host)[1];
}

require '/jawebni/public/index.php';
