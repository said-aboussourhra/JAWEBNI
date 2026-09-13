<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Applies the locale preferred by the user (ar / fr / en) for every request.
 */
class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->user()?->preferred_locale
            ?? $request->user()?->currentBusiness?->default_language
            ?? config('app.locale', 'ar');

        $locale = match ($locale) {
            'darija', 'ar' => 'ar',
            'fr' => 'fr',
            'en' => 'en',
            default => 'ar',
        };

        app()->setLocale($locale);

        return $next($request);
    }
}
