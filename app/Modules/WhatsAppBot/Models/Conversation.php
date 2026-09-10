<?php

namespace App\Modules\WhatsAppBot\Models;

use App\Core\Traits\BelongsToTenant;
use App\Modules\CRM\Models\Customer;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'customer_id',
        'whatsapp_account_id',
        'status',
        'intent',
        'intent_confidence',
        'sentiment',
        'priority',
        'window_expires_at',
        'last_message_text',
        'last_message_at',
    ];

    protected $casts = [
        'intent_confidence' => 'integer',
        'window_expires_at' => 'datetime',
        'last_message_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function whatsappAccount(): BelongsTo
    {
        return $this->belongsTo(WhatsAppAccount::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function handoffLogs(): HasMany
    {
        return $this->hasMany(HumanHandoffLog::class);
    }
}