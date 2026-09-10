<?php

namespace App\Modules\RAG\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeChunk extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'document_id',
        'chunk_index',
        'content',
        'token_count',
        'embedding',
        'metadata',
    ];

    protected $casts = [
        'chunk_index' => 'integer',
        'token_count' => 'integer',
        'embedding' => 'array',
        'metadata' => 'array',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(KnowledgeDocument::class, 'document_id');
    }
}