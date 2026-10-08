<?php

namespace App\Modules\AIEngine\Models;

use App\Core\Traits\BelongsToTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AITestRun extends Model
{
    use HasUuids, BelongsToTenant;

    protected $table = 'ai_test_runs';

    protected $fillable = [
        'business_id',
        'user_id',
        'input_prompt',
        'output_response',
        'detected_intent',
        'selected_agent',
        'knowledge_source',
        'confidence_score',
        'suggested_action',
        'feedback',
        'feedback_notes',
    ];

    protected $casts = [
        'confidence_score' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}