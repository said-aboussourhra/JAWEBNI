<?php

namespace App\Core\Traits;

use App\Core\Scopes\TenantScope;
use App\Core\Tenancy\TenantManager;
use App\Modules\Tenancy\Models\Business;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function ($model) {
            if (empty($model->business_id)) {
                /** @var TenantManager $manager */
                $manager = app(TenantManager::class);
                $tenant = $manager->getTenant();

                if ($tenant) {
                    $model->business_id = $tenant;
                }
            }

            if (empty($model->{$model->getKeyName()}) && $model->getKeyType() === 'string' && ! $model->getIncrementing()) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }

    /**
     * Run a query without the tenant scope (used by queued jobs, CLI and
     * cross-tenant super admin reporting).
     */
    public static function withoutTenantScope()
    {
        return static::withoutGlobalScope(TenantScope::class);
    }
}
