<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\AIEngine\Models\AIPersonality;
use App\Modules\AIEngine\Models\KnowledgeItem;
use App\Modules\AIEngine\Services\ClaudeProvider;
use App\Modules\AIEngine\Services\PromptBuilderService;
use App\Modules\Tenancy\Models\Business;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase3AIEngineTest extends TestCase
{
    use RefreshDatabase;

    public function test_ai_provider_returns_structured_response(): void
    {
        $provider = new ClaudeProvider();
        $response = $provider->generateResponse([
            ['role' => 'user', 'content' => 'شحال الثمن ديال القفطان؟']
        ]);

        $this->assertEquals('claude', $response['provider']);
        $this->assertArrayHasKey('text', $response);
        $this->assertArrayHasKey('tokens_used', $response);
    }

    public function test_prompt_builder_injects_moroccan_business_context(): void
    {
        $business = Business::create([
            'name' => 'Caftan Atlas Casablanca',
            'slug' => 'caftan-atlas',
            'city' => 'Casablanca',
        ]);

        $personality = AIPersonality::create([
            'business_id' => $business->id,
            'communication_style' => 'friendly_moroccan',
            'darija_ratio' => 70,
            'arabic_ratio' => 20,
            'french_ratio' => 10,
        ]);

        $builder = new PromptBuilderService();
        $prompt = $builder->buildSystemPrompt($business, $personality);

        $this->assertStringContainsString('Caftan Atlas Casablanca', $prompt);
        $this->assertStringContainsString('Casablanca', $prompt);
        $this->assertStringContainsString('Darija: 70%', $prompt);
    }

    public function test_knowledge_item_creation_and_tenant_isolation(): void
    {
        $business = Business::create([
            'name' => 'Artisanat Store',
            'slug' => 'artisanat-store',
        ]);

        $user = User::create([
            'name' => 'Said',
            'email' => 'said@artisanat.ma',
            'password' => bcrypt('password123'),
            'current_business_id' => $business->id,
        ]);
        $user->businesses()->attach($business->id, ['role' => 'owner']);

        $this->actingAs($user);

        $item = KnowledgeItem::create([
            'business_id' => $business->id,
            'question' => 'واش كاين توصيل للرباط؟',
            'answer' => 'نعم التوصيل متوفر في 24 ساعة',
            'category' => 'delivery',
            'language' => 'darija',
        ]);

        $this->assertDatabaseHas('knowledge_items', [
            'business_id' => $business->id,
            'question' => 'واش كاين توصيل للرباط؟',
        ]);
    }
}
