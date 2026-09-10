<?php

namespace App\Core\Traits;

use App\Core\Scopes\TenantScope;
use App\Modules\Tenancy\Models\Business;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function ($model) {
            if (empty($model->business_id) && auth()->check()) {
                $user = auth()->user();
                if (!empty($user->current_business_id)) {
                    $model->business_id = $user->current_business_id;
                }
            }

            if (empty($model->id) && in_array('id', $model->getFillable()) || empty($model->getKey())) {
                // If model uses string/uuid primary keys
                if ($model->getKeyType() === 'string' && !$model->getIncrementing()) {
                    $model->{$model->getKeyName()} = (string) Str::uuid();
                }
            }
        });
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }
}
