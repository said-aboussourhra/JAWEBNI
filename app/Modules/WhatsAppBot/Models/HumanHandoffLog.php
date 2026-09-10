<?php

namespace App\Modules\WhatsAppBot\Models;

use App\Core\Traits\BelongsToTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HumanHandoffLog extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'conversation_id',
        'reason',
        'ai_confidence',
        'assigned_user_id',
        'status',
        'resolved_at',
    ];

    protected $casts = [
        'ai_confidence' => 'integer',
        'resolved_at' => 'datetime',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }
}