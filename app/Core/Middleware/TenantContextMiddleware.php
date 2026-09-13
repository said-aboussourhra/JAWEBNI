<?php

namespace App\Core\Middleware;

use App\Core\Tenancy\TenantManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantContextMiddleware
{
    public function __construct(protected TenantManager $tenantManager)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user();

            // If user has no current business selected, select their primary business.
            if (empty($user->current_business_id)) {
                $business = $user->businesses()->first();
                if ($business) {
                    $user->current_business_id = $business->id;
                    $user->save();
                }
            }

            // Verify the user is associated with their current_business_id.
            if ($user->current_business_id) {
                $belongsToBusiness = $user->businesses()
                    ->where('businesses.id', $user->current_business_id)
                    ->exists();

                if (! $belongsToBusiness && ! $user->is_super_admin) {
                    abort(403, 'Cross-tenant access denied.');
                }
            }

            $this->tenantManager->setTenant($user->current_business_id);
        }

        return $next($request);
    }
}
