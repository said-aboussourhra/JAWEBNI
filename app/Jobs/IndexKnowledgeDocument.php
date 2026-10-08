<?php

namespace App\Jobs;

use App\Core\Tenancy\TenantManager;
use App\Modules\AIEngine\Services\EmbeddingService;
use App\Modules\RAG\Models\KnowledgeChunk;
use App\Modules\RAG\Models\KnowledgeDocument;
use App\Modules\RAG\Services\DocumentExtractorService;
use App\Modules\RAG\Services\TextChunkerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Extracts text, splits it into chunks and stores real vector embeddings.
 */
class IndexKnowledgeDocument implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public int $timeout = 300;

    public function __construct(
        public string $businessId,
        public string $documentId
    ) {
    }

    public function handle(TenantManager $tenantManager, EmbeddingService $embeddings): void
    {
        $tenantManager->setTenant($this->businessId);

        $document = KnowledgeDocument::withoutTenantScope()->find($this->documentId);

        if (! $document) {
            $tenantManager->forget();

            return;
        }

        try {
            $document->update(['status' => 'processing']);

            $disk = Storage::disk(config('filesystems.default', 'local'));

            if (! $disk->exists($document->file_path)) {
                throw new \RuntimeException('Uploaded file missing at '.$document->file_path);
            }

            $rawText = (new DocumentExtractorService)->extractText(
                new \Illuminate\Http\File($disk->path($document->file_path))
            );

            $chunker = new TextChunkerService;
            $chunks = $chunker->chunkText(
                $rawText,
                (int) config('ai.rag.chunk_words', 150),
                (int) config('ai.rag.chunk_overlap', 30)
            );

            // Replace previously indexed chunks for this document.
            KnowledgeChunk::withoutTenantScope()
                ->where('document_id', $document->id)
                ->delete();

            foreach ($chunks as $index => $chunkText) {
                KnowledgeChunk::withoutTenantScope()->create([
                    'id' => (string) Str::uuid(),
                    'business_id' => $this->businessId,
                    'document_id' => $document->id,
                    'chunk_index' => $index,
                    'content' => $chunkText,
                    'token_count' => count(preg_split('/\s+/u', trim($chunkText)) ?: []),
                    'embedding' => $embeddings->embed($chunkText),
                    'metadata' => [
                        'source_file' => $document->file_name,
                        'chunk_num' => $index + 1,
                    ],
                ]);
            }

            $document->update([
                'status' => 'indexed',
                'chunks_count' => count($chunks),
                'pages_count' => max(1, count($chunks)),
                'extraction_confidence' => mb_strlen($rawText) > 200 ? 96 : 72,
                'error_message' => null,
            ]);
        } catch (\Throwable $e) {
            Log::error('Knowledge indexing failed: '.$e->getMessage());

            $document->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            $this->fail($e);
        } finally {
            $tenantManager->forget();
        }
    }
}
