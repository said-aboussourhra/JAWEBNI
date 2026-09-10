<?php

namespace App\Modules\RAG\Services;

class TextChunkerService
{
    public function chunkText(string $text, int $maxChunkWords = 150, int $overlapWords = 30): array
    {
        $words = preg_split('/\s+/u', trim($text));
        $totalWords = count($words);

        if ($totalWords <= $maxChunkWords) {
            return [$text];
        }

        $chunks = [];
        $i = 0;

        while ($i < $totalWords) {
            $chunkSlice = array_slice($words, $i, $maxChunkWords);
            $chunkText = implode(' ', $chunkSlice);
            if (!empty(trim($chunkText))) {
                $chunks[] = $chunkText;
            }
            $i += ($maxChunkWords - $overlapWords);
        }

        return $chunks;
    }
}