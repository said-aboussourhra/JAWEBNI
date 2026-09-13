<?php

namespace App\Providers;

use App\Core\Contracts\AIProviderInterface;
use App\Core\Contracts\WhatsAppProviderInterface;
use App\Core\Tenancy\TenantManager;
use App\Modules\AIEngine\Services\AIProviderFactory;
use App\Modules\AIEngine\Services\EmbeddingService;
use App\Modules\Billing\Services\UsageService;
use App\Modules\WhatsAppBot\Services\MetaCloudProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(TenantManager::class, fn () => new TenantManager);
        $this->app->singleton(EmbeddingService::class, fn ($app) => new EmbeddingService(
            $app->make(AIProviderFactory::class)
        ));
        $this->app->singleton(UsageService::class, fn () => new UsageService);

        $this->app->singleton(AIProviderFactory::class, fn () => new AIProviderFactory);

        $this->app->bind(AIProviderInterface::class, function ($app) {
            /** @var AIProviderFactory $factory */
            $factory = $app->make(AIProviderFactory::class);

            return $factory->make();
        });

        $this->app->bind(WhatsAppProviderInterface::class, function () {
            return new MetaCloudProvider;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('whatsapp-webhook', function (Request $request) {
            return Limit::perMinute(600)->by($request->ip());
        });

        RateLimiter::for('ai-studio', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });
    }
}
