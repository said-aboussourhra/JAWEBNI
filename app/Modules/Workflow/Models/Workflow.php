<?php

namespace App\Modules\Workflow\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Workflow extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'name',
        'description',
        'trigger_type',
        'nodes',
        'edges',
        'is_active',
        'execution_count',
    ];

    protected $casts = [
        'nodes' => 'array',
        'edges' => 'array',
        'is_active' => 'boolean',
        'execution_count' => 'integer',
    ];
}