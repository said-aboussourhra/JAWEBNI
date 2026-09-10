<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\RAG\Models\KnowledgeChunk;
use App\Modules\RAG\Models\KnowledgeDocument;
use App\Modules\RAG\Services\KnowledgeHealthService;
use App\Modules\RAG\Services\RAGRetrievalService;
use App\Modules\RAG\Services\TextChunkerService;
use App\Modules\Tenancy\Models\Business;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class Phase4RAGTest extends TestCase
{
    use RefreshDatabase;

    public function test_text_chunker_splits_content_with_overlap(): void
    {
        $chunker = new TextChunkerService();
        $text = str_repeat('كلمة مغربية قفطان جلابة توصيل سريع كازا ', 50);

        $chunks = $chunker->chunkText($text, 50, 10);

        $this->assertGreaterThan(1, count($chunks));
        $this->assertNotEmpty($chunks[0]);
    }

    public function test_document_upload_and_chunking_with_tenant_isolation(): void
    {
        $business = Business::create([
            'name' => 'Maroc Caftan',
            'slug' => 'maroc-caftan',
        ]);

        $user = User::create([
            'name' => 'Said',
            'email' => 'said@caftan.ma',
            'password' => bcrypt('password123'),
            'current_business_id' => $business->id,
        ]);
        $user->businesses()->attach($business->id, ['role' => 'owner']);

        $this->actingAs($user);

        $file = UploadedFile::fake()->create('catalogue_2026.pdf', 500, 'application/pdf');

        $response = $this->post('/rag/documents/upload', [
            'document' => $file,
            'title' => 'كتالوج الأسعار 2026',
        ]);

        $response->assertStatus(302);

        $this->assertDatabaseHas('knowledge_documents', [
            'business_id' => $business->id,
            'title' => 'كتالوج الأسعار 2026',
        ]);

        $this->assertDatabaseHas('knowledge_chunks', [
            'business_id' => $business->id,
        ]);
    }

    public function test_semantic_retrieval_and_health_calculation(): void
    {
        $business = Business::create([
            'name' => 'Tech Shop',
            'slug' => 'tech-shop',
        ]);

        $doc = KnowledgeDocument::create([
            'business_id' => $business->id,
            'title' => 'كتالوج المنتجات',
            'file_name' => 'products.pdf',
            'file_path' => 'mock/path',
            'mime_type' => 'application/pdf',
            'file_size_bytes' => 10240,
            'pages_count' => 5,
            'chunks_count' => 10,
            'extraction_confidence' => 96,
        ]);

        KnowledgeChunk::create([
            'business_id' => $business->id,
            'document_id' => $doc->id,
            'chunk_index' => 0,
            'content' => 'قفطان ملكي أصيل بثمن 1850 درهم وتوصيل لكازا والرباط',
            'token_count' => 15,
        ]);

        $retrievalService = new RAGRetrievalService();
        $results = $retrievalService->retrieveRelevantChunks($business->id, 'شحال ثمن القفطان');

        $this->assertCount(1, $results);
        $this->assertStringContainsString('1850 درهم', $results[0]['content']);

        $healthService = new KnowledgeHealthService();
        $health = $healthService->calculateHealth($business->id);

        $this->assertGreaterThanOrEqual(70, $health['score']);
        $this->assertEquals(1, $health['docs_count']);
    }
}