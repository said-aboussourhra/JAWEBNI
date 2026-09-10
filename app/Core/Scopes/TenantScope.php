<?php

namespace App\Core\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (auth()->check()) {
            $user = auth()->user();
            if ($user && !empty($user->current_business_id)) {
                $builder->where($model->getTable() . '.business_id', $user->current_business_id);
            }
        }
    }
}
