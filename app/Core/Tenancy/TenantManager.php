<?php

namespace App\Core\Tenancy;

/**
 * Holds the tenant (business) id for the current execution context.
 *
 * Authentication is not available inside queued jobs, CLI commands and
 * webhook requests, so the tenant is resolved explicitly and shared through
 * this singleton. The global tenant scope reads from it first and only falls
 * back to the authenticated user.
 */
class TenantManager
{
    protected ?string $businessId = null;

    public function setTenant(?string $businessId): void
    {
        $this->businessId = $businessId ?: null;
    }

    public function getTenant(): ?string
    {
        if (! empty($this->businessId)) {
            return $this->businessId;
        }

        if (app()->runningInConsole() && ! app()->runningUnitTests()) {
            return null;
        }

        if (auth()->check()) {
            $current = auth()->user()->current_business_id ?? null;

            return $current ? (string) $current : null;
        }

        return null;
    }

    public function hasTenant(): bool
    {
        return $this->getTenant() !== null;
    }

    public function forget(): void
    {
        $this->businessId = null;
    }
}
