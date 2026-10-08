<?php

namespace App\Modules\AIEngine\Services;

use App\Core\Contracts\AIProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ClaudeProvider implements AIProviderInterface
{
    protected string $apiKey;
    protected string $model;
    protected string $baseUrl;

    public function __construct(string $apiKey = '', string $model = '', string $baseUrl = '')
    {
        $this->apiKey = $apiKey ?: (string) config('services.anthropic.key', '');
        $this->model = $model ?: (string) config('ai.models.claude', 'claude-3-5-sonnet-latest');
        $this->baseUrl = rtrim($baseUrl ?: (string) config('services.anthropic.base_url', 'https://api.anthropic.com/v1'), '/');
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
            $system = '';
            $conversation = [];

            foreach ($messages as $message) {
                if (($message['role'] ?? 'user') === 'system') {
                    $system .= ($system === '' ? '' : "\n\n").(string) ($message['content'] ?? '');
                    continue;
                }

                $conversation[] = [
                    'role' => ($message['role'] ?? 'user') === 'assistant' ? 'assistant' : 'user',
                    'content' => (string) ($message['content'] ?? ''),
                ];
            }

            if ($conversation === []) {
                $conversation[] = ['role' => 'user', 'content' => 'مرحباً'];
            }

            $payload = [
                'model' => $options['model'] ?? $this->model,
                'max_tokens' => $options['max_tokens'] ?? config('ai.max_tokens', 700),
                'temperature' => $options['temperature'] ?? config('ai.temperature', 0.4),
                'messages' => $conversation,
            ];

            if ($system !== '') {
                $payload['system'] = $system;
            }

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'anthropic-version' => (string) config('services.anthropic.version', '2023-06-01'),
            ])
                ->acceptJson()
                ->timeout((int) config('ai.timeout', 30))
                ->post($this->baseUrl.'/messages', $payload);

            if ($response->failed()) {
                Log::error('Claude request failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                return $this->offlineResponse($startedAt, $options);
            }

            $data = $response->json();
            $blocks = (array) data_get($data, 'content', []);
            $text = '';

            foreach ($blocks as $block) {
                if (($block['type'] ?? '') === 'text') {
                    $text .= $block['text'] ?? '';
                }
            }

            $text = trim($text);

            if ($text === '') {
                return $this->offlineResponse($startedAt, $options);
            }

            return [
                'provider' => 'claude',
                'model' => $data['model'] ?? $this->model,
                'text' => $text,
                'tokens_used' => (int) data_get($data, 'usage.input_tokens', 0) + (int) data_get($data, 'usage.output_tokens', 0),
                'latency_ms' => (int) round((microtime(true) - $startedAt) * 1000),
                'mode' => 'live',
            ];
        } catch (Throwable $e) {
            Log::error('Claude exception: '.$e->getMessage());

            return $this->offlineResponse($startedAt, $options);
        }
    }

    public function generateEmbedding(string $text): array
    {
        // Anthropic does not expose an embeddings endpoint: the shared
        // EmbeddingService falls back to the local hashing vectoriser.
        return [];
    }

    public function transcribeAudio(string $audioFilePath): string
    {
        return '';
    }

    protected function offlineResponse(float $startedAt, array $options = []): array
    {
        return [
            'provider' => 'claude',
            'model' => $options['model'] ?? $this->model,
            'text' => $options['mock_response']
            ?? 'مرحباً بك! أنا موظفك الذكي من جاوبني، كيف يمكنني مساعدتك اليوم بخصوص طلبك؟',
            'tokens_used' => 184,
            'latency_ms' => (int) round((microtime(true) - $startedAt) * 1000),
            'mode' => 'offline',
        ];
    }
}
