<?php

namespace App\Modules\CRM\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CustomerTag extends Model
{
    use HasUuids, BelongsToTenant;

    protected $table = 'customer_tags';

    protected $fillable = [
        'business_id',
        'name',
        'color',
    ];
}