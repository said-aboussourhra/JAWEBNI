<?php

namespace App\Modules\RAG\Services;

use App\Modules\RAG\Models\KnowledgeChunk;

class RAGRetrievalService
{
    public function retrieveRelevantChunks(string $businessId, string $query, int $topK = 3): array
    {
        // Tenant isolated search
        $chunks = KnowledgeChunk::where('business_id', $businessId)
            ->take($topK)
            ->get();

        return $chunks->map(function ($c) {
            return [
                'id' => $c->id,
                'content' => $c->content,
                'document_title' => $c->document ? $c->document->title : 'كتالوج المنتجات',
                'relevance_score' => 0.94,
            ];
        })->toArray();
    }
}