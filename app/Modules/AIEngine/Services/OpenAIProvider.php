<?php

namespace App\Modules\AIEngine\Services;

use App\Core\Contracts\AIProviderInterface;

class OpenAIProvider implements AIProviderInterface
{
    protected string $apiKey;
    protected string $model;

    public function __construct(string $apiKey = '', string $model = 'gpt-4o')
    {
        $this->apiKey = $apiKey ?: (string) config('services.openai.key', 'mock_openai_key');
        $this->model = $model;
    }

    public function generateResponse(array $messages, array $options = []): array
    {
        return [
            'provider' => 'openai',
            'model' => $this->model,
            'text' => $options['mock_response'] ?? 'أهلاً وسهلاً، طلبك قيد المتابعة وسيصلك في أقرب وقت.',
            'tokens_used' => 160,
            'latency_ms' => 380,
        ];
    }

    public function generateEmbedding(string $text): array
    {
        return array_fill(0, 1536, 0.0142);
    }

    public function transcribeAudio(string $audioFilePath): string
    {
        return 'واش متوفر القفطان الأخضر؟';
    }
}