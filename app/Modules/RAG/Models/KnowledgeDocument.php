<?php

namespace App\Modules\RAG\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KnowledgeDocument extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'title',
        'file_name',
        'file_path',
        'mime_type',
        'file_size_bytes',
        'pages_count',
        'chunks_count',
        'extraction_confidence',
        'status',
        'error_message',
    ];

    protected $casts = [
        'file_size_bytes' => 'integer',
        'pages_count' => 'integer',
        'chunks_count' => 'integer',
        'extraction_confidence' => 'integer',
    ];

    public function chunks(): HasMany
    {
        return $this->hasMany(KnowledgeChunk::class, 'document_id')->orderBy('chunk_index', 'asc');
    }
}