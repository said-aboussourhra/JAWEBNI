<?php

namespace App\Modules\AIEngine\Services;

use App\Core\Contracts\AIProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class GeminiProvider implements AIProviderInterface
{
    protected string $apiKey;
    protected string $model;
    protected string $baseUrl;

    public function __construct(string $apiKey = '', string $model = '', string $baseUrl = '')
    {
        $this->apiKey = $apiKey ?: (string) config('services.gemini.key', '');
        $this->model = $model ?: (string) config('ai.models.gemini', 'gemini-2.0-flash');
        $this->baseUrl = rtrim($baseUrl ?: (string) config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta'), '/');
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
            $contents = [];

            foreach ($messages as $message) {
                $content = (string) ($message['content'] ?? '');

                if (($message['role'] ?? 'user') === 'system') {
                    $system .= ($system === '' ? '' : "\n\n").$content;
                    continue;
                }

                $contents[] = [
                    'role' => ($message['role'] ?? 'user') === 'assistant' ? 'model' : 'user',
                    'parts' => [['text' => $content]],
                ];
            }

            if ($contents === []) {
                $contents[] = ['role' => 'user', 'parts' => [['text' => 'مرحباً']]];
            }

            $payload = [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => $options['temperature'] ?? config('ai.temperature', 0.4),
                    'maxOutputTokens' => $options['max_tokens'] ?? config('ai.max_tokens', 700),
                ],
            ];

            if ($system !== '') {
                $payload['systemInstruction'] = ['parts' => [['text' => $system]]];
            }

            $model = $options['model'] ?? $this->model;

            $response = Http::acceptJson()
                ->timeout((int) config('ai.timeout', 30))
                ->post($this->baseUrl.'/models/'.$model.':generateContent?key='.$this->apiKey, $payload);

            if ($response->failed()) {
                Log::error('Gemini request failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                return $this->offlineResponse($startedAt, $options);
            }

            $data = $response->json();
            $parts = (array) data_get($data, 'candidates.0.content.parts', []);
            $text = '';

            foreach ($parts as $part) {
                $text .= $part['text'] ?? '';
            }

            $text = trim($text);

            if ($text === '') {
                return $this->offlineResponse($startedAt, $options);
            }

            return [
                'provider' => 'gemini',
                'model' => $model,
                'text' => $text,
                'tokens_used' => (int) data_get($data, 'usageMetadata.totalTokenCount', 0) ?: (int) (mb_strlen($text) / 3),
                'latency_ms' => (int) round((microtime(true) - $startedAt) * 1000),
                'mode' => 'live',
            ];
        } catch (Throwable $e) {
            Log::error('Gemini exception: '.$e->getMessage());

            return $this->offlineResponse($startedAt, $options);
        }
    }

    public function generateEmbedding(string $text): array
    {
        if (! $this->hasCredentials()) {
            return [];
        }

        try {
            $model = config('ai.gemini_embedding_model', 'text-embedding-004');

            $response = Http::acceptJson()
                ->timeout((int) config('ai.timeout', 30))
                ->post($this->baseUrl.'/models/'.$model.':embedContent?key='.$this->apiKey, [
                    'model' => 'models/'.$model,
                    'content' => ['parts' => [['text' => mb_substr($text, 0, 8000)]]],
                ]);

            if ($response->failed()) {
                Log::error('Gemini embedding failed', ['status' => $response->status()]);

                return [];
            }

            return array_map('floatval', (array) data_get($response->json(), 'embedding.values', []));
        } catch (Throwable $e) {
            Log::error('Gemini embedding exception: '.$e->getMessage());

            return [];
        }
    }

    /**
     * Gemini can transcribe audio directly through its multimodal endpoint.
     */
    public function transcribeAudio(string $audioFilePath): string
    {
        if (! $this->hasCredentials() || ! is_file($audioFilePath)) {
            return '';
        }

        try {
            $mime = mime_content_type($audioFilePath) ?: 'audio/ogg';
            $payload = [
                'contents' => [[
                    'parts' => [
                        ['text' => 'Transcris exactement ce message audio en darija marocaine.'],
                        ['inline_data' => [
                            'mime_type' => $mime,
                            'data' => base64_encode((string) file_get_contents($audioFilePath)),
                        ]],
                    ],
                ]],
            ];

            $response = Http::acceptJson()
                ->timeout(90)
                ->post($this->baseUrl.'/models/'.$this->model.':generateContent?key='.$this->apiKey, $payload);

            if ($response->failed()) {
                return '';
            }

            return trim((string) data_get($response->json(), 'candidates.0.content.parts.0.text', ''));
        } catch (Throwable $e) {
            Log::error('Gemini transcription exception: '.$e->getMessage());

            return '';
        }
    }

    protected function offlineResponse(float $startedAt, array $options = []): array
    {
        return [
            'provider' => 'gemini',
            'model' => $options['model'] ?? $this->model,
            'text' => $options['mock_response']
            ?? 'مرحباً! نعم نقوم بالتوصيل لكافة المدن المغربية والدفع عند الاستلام.',
            'tokens_used' => 140,
            'latency_ms' => (int) round((microtime(true) - $startedAt) * 1000),
            'mode' => 'offline',
        ];
    }
}
