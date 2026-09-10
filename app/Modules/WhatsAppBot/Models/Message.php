<?php

namespace App\Modules\WhatsAppBot\Models;

use App\Core\Traits\BelongsToTenant;
use App\Models\User;
use App\Modules\CRM\Models\Customer;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'conversation_id',
        'customer_id',
        'whatsapp_message_id',
        'sender_type',
        'sent_by_user_id',
        'type',
        'body',
        'media_url',
        'media_mime_type',
        'media_duration_seconds',
        'status',
        'detected_intent',
        'ai_confidence',
        'ai_metadata',
    ];

    protected $casts = [
        'ai_confidence' => 'integer',
        'media_duration_seconds' => 'integer',
        'ai_metadata' => 'array',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function sentByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by_user_id');
    }
}