<?php

namespace App\Modules\AIEngine\Services;

use App\Core\Contracts\AIProviderInterface;
use InvalidArgumentException;

class AIProviderFactory
{
    /**
     * Build a provider instance by name (openai | claude | gemini).
     */
    public function make(?string $provider = null): AIProviderInterface
    {
        $provider = $provider ?: (string) config('ai.default_provider', 'openai');

        return match (strtolower($provider)) {
            'openai', 'gpt' => new OpenAIProvider,
            'claude', 'anthropic' => new ClaudeProvider,
            'gemini', 'google' => new GeminiProvider,
            default => throw new InvalidArgumentException("Unsupported AI provider [{$provider}]."),
        };
    }

    /**
     * Providers that currently hold real API credentials.
     */
    public function available(): array
    {
        $available = [];

        foreach (['openai' => OpenAIProvider::class, 'claude' => ClaudeProvider::class, 'gemini' => GeminiProvider::class] as $name => $class) {
            /** @var OpenAIProvider|ClaudeProvider|GeminiProvider $instance */
            $instance = new $class;

            if ($instance->hasCredentials()) {
                $available[] = $name;
            }
        }

        return $available;
    }

    /**
     * Resolve the best provider: the configured one when it has credentials,
     * otherwise the first configured fallback, otherwise the default (offline).
     */
    public function resolve(?string $preferred = null): AIProviderInterface
    {
        $candidates = array_values(array_filter(array_unique([
            $preferred,
            config('ai.default_provider'),
            config('ai.fallback_provider'),
        ])));

        foreach ($candidates as $candidate) {
            if (! $candidate) {
                continue;
            }

            try {
                $provider = $this->make((string) $candidate);
            } catch (InvalidArgumentException $e) {
                continue;
            }

            if (method_exists($provider, 'hasCredentials') && $provider->hasCredentials()) {
                return $provider;
            }
        }

        return $this->make($preferred ?: (string) config('ai.default_provider', 'openai'));
    }
}
