<?php

namespace App\Core\Scopes;

use App\Core\Tenancy\TenantManager;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $businessId = $this->resolveTenantId();

        if (! $businessId) {
            return;
        }

        $builder->where($model->getTable() . '.business_id', $businessId);
    }

    protected function resolveTenantId(): ?string
    {
        /** @var TenantManager $manager */
        $manager = app(TenantManager::class);

        return $manager->getTenant();
    }
}
