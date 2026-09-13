<?php

namespace App\Modules\AIEngine\Services;

use Illuminate\Support\Facades\Cache;

/**
 * Turns text into vectors used by the RAG pipeline.
 *
 * When an embedding provider is configured (OpenAI / Gemini) real vectors are
 * used. Otherwise a deterministic offline hashing vectoriser keeps semantic
 * search functional without any API key or paid vector database.
 */
class EmbeddingService
{
    public function __construct(protected ?AIProviderFactory $factory = null)
    {
        $this->factory = $factory ?? new AIProviderFactory;
    }

    /**
     * @return float[]
     */
    public function embed(string $text): array
    {
        $text = $this->normalize($text);

        if ($text === '') {
            return [];
        }

        $cacheKey = 'embedding:'.md5($text);
        $cached = Cache::store('array')->get($cacheKey);

        if (is_array($cached)) {
            return $cached;
        }

        $driver = strtolower((string) config('ai.embedding_provider', 'openai'));
        $vector = [];

        if (in_array($driver, ['openai', 'gemini', 'claude'], true)) {
            try {
                $vector = $this->factory->make($driver)->generateEmbedding($text);
            } catch (\Throwable $e) {
                $vector = [];
            }
        }

        if (empty($vector)) {
            $vector = $this->localVector($text);
        }

        $vector = $this->normalizeVector($vector);
        Cache::store('array')->put($cacheKey, $vector, 600);

        return $vector;
    }

    /**
     * Deterministic offline vectoriser (hashing trick over word tokens and
     * character trigrams) — good enough for tenant-scoped FAQ retrieval.
     *
     * @return float[]
     */
    public function localVector(string $text): array
    {
        $dimensions = max(64, (int) config('ai.local_embedding_dimensions', 512));
        $vector = array_fill(0, $dimensions, 0.0);
        $text = $this->normalize($text);

        $tokens = preg_split('/[\s\p{P}]+/u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        foreach ($tokens as $token) {
            $this->addToken($vector, $token, 1.0);
        }

        // Character trigrams add fuzzy matching (القفطان ~ قفطان).
        $compact = preg_replace('/\s+/u', '', $text) ?? '';
        $length = mb_strlen($compact);

        for ($i = 0; $i < $length - 2; $i++) {
            $this->addToken($vector, mb_substr($compact, $i, 3), 0.35);
        }

        return $vector;
    }

    public function cosine(array $a, array $b): float
    {
        if (empty($a) || empty($b)) {
            return 0.0;
        }

        if (count($a) !== count($b)) {
            // Vectors from different models: fall back to lexical similarity.
            return 0.0;
        }

        $dot = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        foreach ($a as $index => $value) {
            $bValue = $b[$index] ?? 0.0;
            $dot += $value * $bValue;
            $normA += $value * $value;
            $normB += $bValue * $bValue;
        }

        if ($normA <= 0.0 || $normB <= 0.0) {
            return 0.0;
        }

        return $dot / (sqrt($normA) * sqrt($normB));
    }

    /**
     * Lexical relevance (0..1) used when vectors are unavailable.
     */
    public function lexicalScore(string $query, string $content): float
    {
        $query = $this->normalize($query);
        $content = $this->normalize($content);

        if ($query === '' || $content === '') {
            return 0.0;
        }

        $queryTokens = array_unique(preg_split('/[\s\p{P}]+/u', $query, -1, PREG_SPLIT_NO_EMPTY) ?: []);
        $compactContent = preg_replace('/\s+/u', '', $content) ?? '';
        $compactQuery = preg_replace('/\s+/u', '', $query) ?? '';

        $matched = 0;

        foreach ($queryTokens as $token) {
            if (mb_strlen($token) < 2) {
                continue;
            }

            if (mb_strpos($content, $token) !== false || mb_strpos($compactContent, $token) !== false) {
                $matched++;
            }
        }

        if ($matched === 0 && $compactQuery !== '') {
            // Substring of the whole query (handles short queries).
            $compactQuery = mb_substr($compactQuery, 0, 12);
            if (mb_strlen($compactQuery) >= 3 && mb_strpos($compactContent, $compactQuery) !== false) {
                $matched = 1;
            }
        }

        $denominator = max(1, count($queryTokens));

        return min(1.0, $matched / $denominator);
    }

    protected function addToken(array &$vector, string $token, float $weight): void
    {
        $dimensions = count($vector);
        $hash = hexdec(substr(md5($token), 0, 8));
        $index = $hash % $dimensions;

        $vector[$index] += $weight;
    }

    /**
     * @return float[]
     */
    protected function normalizeVector(array $vector): array
    {
        $norm = 0.0;

        foreach ($vector as $value) {
            $norm += ((float) $value) ** 2;
        }

        $norm = sqrt($norm);

        if ($norm <= 0.0) {
            return $vector;
        }

        return array_map(fn ($value) => (float) $value / $norm, $vector);
    }

    /**
     * Arabic / Darija friendly normalisation.
     */
    public function normalize(string $text): string
    {
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/[\x{064B}-\x{0652}\x{0640}]/u', '', $text) ?? $text; // harakat + tatweel

        $replacements = [
            'أ' => 'ا', 'إ' => 'ا', 'آ' => 'ا', 'ٱ' => 'ا',
            'ى' => 'ي', 'ی' => 'ي', 'ئ' => 'ي',
            'ؤ' => 'و', 'ة' => 'ه',
        ];

        $text = strtr($text, $replacements);
        $text = preg_replace('/\bال/u', '', $text) ?? $text;
        $text = preg_replace('/\s+/u', ' ', $text) ?? $text;

        return mb_strtolower(trim($text));
    }
}
