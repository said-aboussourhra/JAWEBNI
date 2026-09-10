<?php

namespace App\Modules\AIEngine\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class KnowledgeItem extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'question',
        'answer',
        'category',
        'language',
        'source',
        'usage_count',
        'confidence_score',
        'is_active',
    ];

    protected $casts = [
        'usage_count' => 'integer',
        'confidence_score' => 'integer',
        'is_active' => 'boolean',
    ];
}