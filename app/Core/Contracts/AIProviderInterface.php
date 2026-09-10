<?php

namespace App\Core\Contracts;

interface AIProviderInterface
{
    public function generateResponse(array $messages, array $options = []): array;
    public function generateEmbedding(string $text): array;
    public function transcribeAudio(string $audioFilePath): string;
}
