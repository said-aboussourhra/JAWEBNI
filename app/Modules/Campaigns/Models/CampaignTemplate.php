<?php

namespace App\Modules\Campaigns\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CampaignTemplate extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'name',
        'whatsapp_template_name',
        'language',
        'category',
        'status',
        'body_text',
    ];
}