<?php

namespace Tests\Feature;

use App\Modules\AIEngine\Services\EmbeddingService;
use App\Modules\RAG\Models\KnowledgeChunk;
use App\Modules\RAG\Models\KnowledgeDocument;
use App\Modules\RAG\Services\RAGRetrievalService;
use App\Modules\Tenancy\Models\Business;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RagAndWebhookSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_semantic_retrieval_ranks_the_relevant_chunk_first(): void
    {
        $business = Business::create(['name' => 'Caftan Store', 'slug' => 'caftan-store']);

        $document = KnowledgeDocument::create([
            'business_id' => $business->id,
            'title' => 'كتالوج 2026',
            'file_name' => 'catalogue.txt',
            'file_path' => 'knowledge_docs/catalogue.txt',
            'mime_type' => 'text/plain',
            'file_size_bytes' => 1024,
            'pages_count' => 3,
        ]);

        $embeddings = app(EmbeddingService::class);

        $contents = [
            'قفطان ملكي بالصقلي الحر، الثمن يبدأ من 1,850 درهم مع التوصيل المجاني لكازا.',
            'البلغة الفاسية الجلدية الأصيلة بـ290 درهم والشربيل المطرز بـ340 درهم.',
            'أوقات العمل من الإثنين إلى السبت من 10:00 إلى 19:00 في محل أنفا.',
        ];

        foreach ($contents as $index => $content) {
            KnowledgeChunk::create([
                'business_id' => $business->id,
                'document_id' => $document->id,
                'chunk_index' => $index,
                'content' => $content,
                'token_count' => 12,
                'embedding' => $embeddings->embed($content),
            ]);
        }

        $service = new RAGRetrievalService($embeddings);
        $results = $service->retrieveRelevantChunks($business->id, 'شحال ثمن القفطان الملكي؟');

        $this->assertNotEmpty($results);
        $this->assertStringContainsString('قفطان', $results[0]['content']);
        $this->assertArrayHasKey('relevance_score', $results[0]);
    }

    public function test_offline_embeddings_are_deterministic_normalised_and_comparable(): void
    {
        $embeddings = app(EmbeddingService::class);

        $first = $embeddings->embed('التوصيل لكازا والرباط');
        $second = $embeddings->embed('التوصيل لكازا والرباط');
        $other = $embeddings->embed('أثمنة القفطان الملكي');

        $this->assertSame($first, $second);
        $this->assertGreaterThan($embeddings->cosine($first, $other), $embeddings->cosine($first, $second));
    }

    public function test_webhook_rejects_requests_with_invalid_signature(): void
    {
        config()->set('services.whatsapp.app_secret', 'test_app_secret');

        $payload = ['entry' => []];

        $this->postJson('/api/webhook/whatsapp', $payload, [
            'X-Hub-Signature-256' => 'sha256=invalid',
        ])->assertStatus(401);

        $body = json_encode($payload, JSON_UNESCAPED_UNICODE);
        $signature = 'sha256='.hash_hmac('sha256', (string) $body, 'test_app_secret');

        $this->call(
            'POST',
            '/api/webhook/whatsapp',
            [],
            [],
            [],
            ['HTTP_X_HUB_SIGNATURE_256' => $signature, 'CONTENT_TYPE' => 'application/json'],
            $body
        )->assertStatus(200);
    }

    public function test_webhook_ignores_payload_without_entries(): void
    {
        $this->postJson('/api/webhook/whatsapp', ['object' => 'whatsapp_business_account'])
            ->assertStatus(200)
            ->assertJson(['status' => 'ignored']);
    }
}
