<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $business = $user ? $user->currentBusiness : null;
        $userBusinesses = $user ? $user->businesses()->select('businesses.id', 'businesses.name', 'businesses.slug', 'businesses.city', 'businesses.status')->get() : [];

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_super_admin' => (bool)$user->is_super_admin,
                    'preferred_locale' => $user->preferred_locale ?? 'ar',
                ] : null,
                'business' => $business ? [
                    'id' => $business->id,
                    'name' => $business->name,
                    'slug' => $business->slug,
                    'city' => $business->city,
                    'phone_number' => $business->phone_number,
                    'currency' => $business->currency,
                    'default_language' => $business->default_language,
                    'ai_readiness_score' => $business->ai_readiness_score,
                    'onboarding_completed' => (bool)$business->onboarding_completed,
                    'onboarding_step' => $business->onboarding_step,
                ] : null,
                'user_businesses' => $userBusinesses,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
            ],
            'simulation' => fn () => $request->session()->get('simulation'),
            'inbox' => [
                'waiting_human' => fn () => $user && $user->current_business_id
                    ? \App\Modules\WhatsAppBot\Models\Conversation::withoutTenantScope()
                        ->where('business_id', $user->current_business_id)
                        ->where('status', 'waiting_human')
                        ->count()
                    : 0,
            ],
        ];
    }
}
