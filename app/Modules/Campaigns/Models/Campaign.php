<?php

namespace App\Modules\Campaigns\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Campaign extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'template_id',
        'name',
        'target_segment',
        'scheduled_at',
        'status',
        'total_recipients',
        'delivered_count',
        'read_count',
        'replied_count',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'total_recipients' => 'integer',
        'delivered_count' => 'integer',
        'read_count' => 'integer',
        'replied_count' => 'integer',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(CampaignTemplate::class, 'template_id');
    }
}