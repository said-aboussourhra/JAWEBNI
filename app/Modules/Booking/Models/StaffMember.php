<?php

namespace App\Modules\Booking\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StaffMember extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'user_id',
        'name',
        'email',
        'phone',
        'role_title',
        'working_hours',
        'is_active',
    ];

    protected $casts = [
        'working_hours' => 'array',
        'is_active' => 'boolean',
    ];
}