<?php

use App\Core\Middleware\TenantContextMiddleware;
use App\Http\Middleware\EnsureActiveSubscription;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            SetLocale::class,
            TenantContextMiddleware::class,
            EnsureActiveSubscription::class,
        ]);

        $middleware->alias([
            'super.admin' => EnsureSuperAdmin::class,
            'tenant' => TenantContextMiddleware::class,
        ]);

        // Meta's Cloud API cannot send a CSRF token: the webhook must be public
        // and is protected instead by its own SHA-256 signature header.
        $middleware->validateCsrfTokens(except: [
            'api/webhook/whatsapp',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
