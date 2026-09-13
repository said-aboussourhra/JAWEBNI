<?php

namespace App\Providers;

use App\Core\Contracts\AIProviderInterface;
use App\Core\Contracts\PaymentProviderInterface;
use App\Core\Contracts\WhatsAppProviderInterface;
use App\Modules\AIEngine\Services\ClaudeProvider;
use App\Modules\AIEngine\Services\GeminiProvider;
use App\Modules\AIEngine\Services\OpenAIProvider;
use App\Modules\WhatsAppBot\Services\MetaCloudProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind WhatsApp Provider
        $this->app->singleton(WhatsAppProviderInterface::class, function ($app) {
            return new MetaCloudProvider(
                config('services.whatsapp.phone_number_id', ''),
                config('services.whatsapp.access_token', ''),
                config('services.whatsapp.api_version', 'v20.0')
            );
        });

        // Bind AI Provider with factory pattern
        $this->app->singleton(AIProviderInterface::class, function ($app) {
            $default = config('services.ai.default_provider', 'openai');
            
            return match ($default) {
                'claude' => new ClaudeProvider(),
                'gemini' => new GeminiProvider(),
                default => new OpenAIProvider(),
            };
        });

        // Payment Provider placeholder
        $this->app->singleton(PaymentProviderInterface::class, function ($app) {
            return new class implements PaymentProviderInterface {
                public function processPayment(array $payload): array
                {
                    return ['success' => true, 'reference' => 'JW-' . strtoupper(\Illuminate\Support\Str::random(8))];
                }
                public function verifyPayment(string $reference): array
                {
                    return ['success' => true, 'status' => 'approved'];
                }
            };
        });
    }

    public function boot(): void
    {
        // Configure tenant scoping and security headers
        \Illuminate\Support\Facades\URL::forceScheme(env('APP_ENV') === 'production' ? 'https' : 'http');
        
        // Register custom validation rules if needed
    }
}
