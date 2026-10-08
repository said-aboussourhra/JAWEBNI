<?php

namespace App\Http\Middleware;

use App\Modules\Billing\Services\UsageService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks access to the workspace when the tenant has no active subscription.
 * Billing, onboarding and authentication stay reachable so the owner can pay.
 */
class EnsureActiveSubscription
{
    protected array $except = [
        'logout',
        'settings',
        'settings.bank-transfer',
        'tenant.switch',
        'onboarding',
        'onboarding.save-step',
        'admin',
        'admin.payments.approve',
        'admin.payments.reject',
        'admin.bank-settings.update',
    ];

    public function __construct(protected UsageService $usage)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        if ((bool) $user->is_super_admin) {
            return $next($request);
        }

        $routeName = $request->route()?->getName();

        if ($routeName && in_array($routeName, $this->except, true)) {
            return $next($request);
        }

        if (! $user->current_business_id) {
            return $next($request);
        }

        if (! $this->usage->hasActiveSubscription($user->current_business_id)) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'subscription_required'], 402);
            }

            return redirect()->route('settings')
                ->with('error', 'اشتراكك غير مفعل أو منتهي الصلاحية. يرجى تجديد الاشتراك للمتابعة.');
        }

        return $next($request);
    }
}
