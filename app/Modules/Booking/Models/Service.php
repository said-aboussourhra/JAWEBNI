<?php

namespace App\Modules\Booking\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'name',
        'description',
        'price',
        'duration_minutes',
        'color',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration_minutes' => 'integer',
        'is_active' => 'boolean',
    ];
}