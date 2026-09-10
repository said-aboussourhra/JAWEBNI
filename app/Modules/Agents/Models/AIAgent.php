<?php

namespace App\Modules\Agents\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AIAgent extends Model
{
    use HasUuids, BelongsToTenant;

    protected $table = 'ai_agents';

    protected $fillable = [
        'business_id',
        'type',
        'name',
        'purpose',
        'instructions',
        'conversations_handled',
        'success_rate',
        'handoff_rate',
        'status',
    ];

    protected $casts = [
        'conversations_handled' => 'integer',
        'success_rate' => 'integer',
        'handoff_rate' => 'integer',
    ];

    public function executionLogs(): HasMany
    {
        return $this->hasMany(AgentExecutionLog::class, 'agent_id');
    }
}