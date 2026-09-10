<?php

namespace App\Modules\CRM\Models;

use App\Core\Traits\BelongsToTenant;
use App\Modules\WhatsAppBot\Models\Conversation;
use App\Modules\WhatsAppBot\Models\Message;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'name',
        'phone',
        'city',
        'preferred_language',
        'lead_score',
        'lifetime_value',
        'total_orders',
        'tags',
        'ai_memory',
        'last_seen_at',
    ];

    protected $casts = [
        'lead_score' => 'integer',
        'lifetime_value' => 'decimal:2',
        'total_orders' => 'integer',
        'tags' => 'array',
        'ai_memory' => 'array',
        'last_seen_at' => 'datetime',
    ];

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}