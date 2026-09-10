<?php

namespace App\Modules\Agents\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentExecutionLog extends Model
{
    use HasUuids, BelongsToTenant;

    protected $table = 'agent_execution_logs';

    protected $fillable = [
        'business_id',
        'agent_id',
        'conversation_id',
        'detected_intent',
        'confidence_score',
        'latency_ms',
        'handoff_triggered',
    ];

    protected $casts = [
        'confidence_score' => 'integer',
        'latency_ms' => 'integer',
        'handoff_triggered' => 'boolean',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AIAgent::class, 'agent_id');
    }
}