<?php

namespace App\Modules\AIEngine\Services;

use App\Core\Contracts\AIProviderInterface;

class GeminiProvider implements AIProviderInterface
{
    protected string $apiKey;
    protected string $model;

    public function __construct(string $apiKey = '', string $model = 'gemini-1.5-pro')
    {
        $this->apiKey = $apiKey ?: (string) config('services.gemini.key', 'mock_gemini_key');
        $this->model = $model;
    }

    public function generateResponse(array $messages, array $options = []): array
    {
        return [
            'provider' => 'gemini',
            'model' => $this->model,
            'text' => $options['mock_response'] ?? 'مرحباً! نعم نقوم بالتوصيل لكافة المدن المغربية والدفع عند الاستلام.',
            'tokens_used' => 140,
            'latency_ms' => 310,
        ];
    }

    public function generateEmbedding(string $text): array
    {
        return array_fill(0, 1536, 0.0118);
    }

    public function transcribeAudio(string $audioFilePath): string
    {
        return 'شحال الوقت كياخد التوصيل لمراكش؟';
    }
}