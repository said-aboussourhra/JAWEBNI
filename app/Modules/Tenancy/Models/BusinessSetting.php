<?php

namespace App\Modules\Tenancy\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class BusinessSetting extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'key',
        'value',
    ];
}
