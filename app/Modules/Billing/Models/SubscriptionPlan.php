<?php

namespace App\Modules\Billing\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'price_mad',
        'messages_limit',
        'numbers_limit',
        'features',
        'is_popular',
    ];

    protected $casts = [
        'price_mad' => 'decimal:2',
        'messages_limit' => 'integer',
        'numbers_limit' => 'integer',
        'features' => 'array',
        'is_popular' => 'boolean',
    ];
}