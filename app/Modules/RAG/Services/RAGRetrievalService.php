<?php

namespace App\Modules\RAG\Services;

use App\Modules\AIEngine\Models\KnowledgeItem;
use App\Modules\AIEngine\Services\EmbeddingService;
use App\Modules\RAG\Models\KnowledgeChunk;

class RAGRetrievalService
{
    public function __construct(protected ?EmbeddingService $embeddings = null)
    {
        $this->embeddings = $embeddings ?? app(EmbeddingService::class);
    }

    /**
     * Retrieve the most relevant knowledge chunks for a customer question.
     *
     * Uses cosine similarity over stored embeddings and falls back to lexical
     * scoring for chunks that were indexed before embeddings were available.
     *
     * @return array<int, array{id: string, content: string, document_title: string, relevance_score: float, source: string}>
     */
    public function retrieveRelevantChunks(string $businessId, string $query, int $topK = 0): array
    {
        $topK = $topK > 0 ? $topK : (int) config('ai.rag.top_k', 4);
        $minScore = (float) config('ai.rag.min_score', 0.10);

        $chunks = KnowledgeChunk::withoutTenantScope()
            ->where('business_id', $businessId)
            ->with('document')
            ->limit(500)
            ->get();

        if ($chunks->isEmpty()) {
            return [];
        }

        $queryVector = $this->embeddings->embed($query);
        $scored = [];

        foreach ($chunks as $chunk) {
            $stored = is_array($chunk->embedding) ? $chunk->embedding : null;
            $score = 0.0;

            if (! empty($stored) && ! empty($queryVector)) {
                $score = $this->embeddings->cosine($queryVector, array_map('floatval', $stored));
            }

            if ($score <= 0.0) {
                $score = $this->embeddings->lexicalScore($query, (string) $chunk->content) * 0.9;
            }

            if ($score <= 0.0) {
                continue;
            }

            $scored[] = [
                'id' => $chunk->id,
                'content' => $chunk->content,
                'document_title' => $chunk->document ? $chunk->document->title : 'كتالوج المنتجات',
                'relevance_score' => round($score, 4),
                'source' => $chunk->document ? 'document' : 'knowledge',
            ];
        }

        // Q&A knowledge items are always checked too (they are short and exact).
        foreach ($this->knowledgeItems($businessId, $query) as $item) {
            $scored[] = $item;
        }

        usort($scored, fn ($a, $b) => $b['relevance_score'] <=> $a['relevance_score']);

        $filtered = array_values(array_filter($scored, fn ($item) => $item['relevance_score'] >= $minScore));

        // Never return an empty context when the tenant has knowledge: the AI
        // then answers from its own general understanding instead of failing.
        $results = $filtered !== [] ? $filtered : $scored;

        return array_slice($results, 0, $topK);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function knowledgeItems(string $businessId, string $query): array
    {
        $items = KnowledgeItem::withoutTenantScope()
            ->where('business_id', $businessId)
            ->limit(200)
            ->get();

        $results = [];

        foreach ($items as $item) {
            $question = (string) ($item->question ?? '');
            $answer = (string) ($item->answer ?? '');
            $score = max(
                $this->embeddings->lexicalScore($query, $question),
                $this->embeddings->lexicalScore($query, $answer) * 0.6
            );

            if ($score <= 0.05) {
                continue;
            }

            $results[] = [
                'id' => $item->id,
                'content' => $question !== '' ? $question."\n".$answer : $answer,
                'document_title' => $item->category ?: 'سؤال شائع',
                'relevance_score' => round($score, 4),
                'source' => 'qa',
            ];
        }

        return $results;
    }
}
