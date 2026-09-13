<?php

namespace App\Modules\AIEngine\Services;

use App\Core\Contracts\AIProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class OpenAIProvider implements AIProviderInterface
{
    protected string $apiKey;
    protected string $model;
    protected string $baseUrl;

    public function __construct(string $apiKey = '', string $model = '', string $baseUrl = '')
    {
        $this->apiKey = $apiKey ?: (string) config('services.openai.key', '');
        $this->model = $model ?: (string) config('ai.models.openai', 'gpt-4o-mini');
        $this->baseUrl = rtrim($baseUrl ?: (string) config('services.openai.base_url', 'https://api.openai.com/v1'), '/');
    }

    public function hasCredentials(): bool
    {
        return $this->apiKey !== '' && ! str_starts_with($this->apiKey, 'mock_');
    }

    public function generateResponse(array $messages, array $options = []): array
    {
        $startedAt = microtime(true);

        if (! $this->hasCredentials()) {
            return $this->offlineResponse($startedAt, $options);
        }

        try {
            $payload = [
                'model' => $options['model'] ?? $this->model,
                'messages' => $messages,
                'temperature' => $options['temperature'] ?? config('ai.temperature', 0.4),
                'max_tokens' => $options['max_tokens'] ?? config('ai.max_tokens', 700),
            ];

            $response = Http::withToken($this->apiKey)
                ->acceptJson()
                ->timeout((int) config('ai.timeout', 30))
                ->post($this->baseUrl.'/chat/completions', $payload);

            if ($response->failed()) {
                Log::error('OpenAI request failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                return $this->offlineResponse($startedAt, $options);
            }

            $data = $response->json();
            $text = trim((string) data_get($data, 'choices.0.message.content', ''));

            if ($text === '') {
                return $this->offlineResponse($startedAt, $options);
            }

            return [
                'provider' => 'openai',
                'model' => $data['model'] ?? $this->model,
                'text' => $text,
                'tokens_used' => (int) data_get($data, 'usage.total_tokens', $this->estimateTokens($messages, $text)),
                'latency_ms' => (int) round((microtime(true) - $startedAt) * 1000),
                'mode' => 'live',
            ];
        } catch (Throwable $e) {
            Log::error('OpenAI exception: '.$e->getMessage());

            return $this->offlineResponse($startedAt, $options);
        }
    }

    public function generateEmbedding(string $text): array
    {
        if (! $this->hasCredentials()) {
            return [];
        }

        try {
            $response = Http::withToken($this->apiKey)
                ->acceptJson()
                ->timeout((int) config('ai.timeout', 30))
                ->post($this->baseUrl.'/embeddings', [
                    'model' => config('ai.embedding_model', 'text-embedding-3-small'),
                    'input' => mb_substr($text, 0, 8000),
                ]);

            if ($response->failed()) {
                Log::error('OpenAI embedding failed', ['status' => $response->status()]);

                return [];
            }

            return array_map('floatval', (array) data_get($response->json(), 'data.0.embedding', []));
        } catch (Throwable $e) {
            Log::error('OpenAI embedding exception: '.$e->getMessage());

            return [];
        }
    }

    public function transcribeAudio(string $audioFilePath): string
    {
        if (! $this->hasCredentials() || ! is_file($audioFilePath)) {
            return '';
        }

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(60)
                ->attach('file', fopen($audioFilePath, 'r'), basename($audioFilePath))
                ->post($this->baseUrl.'/audio/transcriptions', [
                    'model' => 'whisper-1',
                    'language' => 'ar',
                ]);

            if ($response->failed()) {
                return '';
            }

            return (string) data_get($response->json(), 'text', '');
        } catch (Throwable $e) {
            Log::error('OpenAI transcription exception: '.$e->getMessage());

            return '';
        }
    }

    protected function offlineResponse(float $startedAt, array $options = []): array
    {
        return [
            'provider' => 'openai',
            'model' => $options['model'] ?? $this->model,
            'text' => $options['mock_response']
            ?? 'أهلاً وسهلاً! أنا الموظف الذكي ديال جاوبني. كيفاش نقدر نعاونك اليوم؟',
            'tokens_used' => 160,
            'latency_ms' => (int) round((microtime(true) - $startedAt) * 1000),
            'mode' => 'offline',
        ];
    }

    protected function estimateTokens(array $messages, string $completion): int
    {
        $characters = mb_strlen($completion);

        foreach ($messages as $message) {
            $characters += mb_strlen((string) ($message['content'] ?? ''));
        }

        return (int) max(1, round($characters / 3));
    }
}
