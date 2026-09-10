<?php

namespace App\Jobs;

use App\Core\Tenancy\TenantManager;
use App\Modules\AIEngine\Services\AIConversationService;
use App\Modules\WhatsAppBot\Models\Conversation;
use App\Modules\WhatsAppBot\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Generates and delivers the AI answer for a freshly received WhatsApp message.
 */
class ProcessIncomingWhatsAppMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 10;

    public int $timeout = 120;

    public function __construct(
        public string $businessId,
        public string $conversationId,
        public string $messageId
    ) {
    }

    public function handle(TenantManager $tenantManager, AIConversationService $service): void
    {
        $tenantManager->setTenant($this->businessId);

        $conversation = Conversation::withoutTenantScope()->find($this->conversationId);
        $message = Message::withoutTenantScope()->find($this->messageId);

        if (! $conversation || ! $message) {
            return;
        }

        // The customer took over the conversation: the AI must stay silent.
        if ($conversation->status === 'human_handling') {
            return;
        }

        try {
            $service->handleIncoming($conversation, $message);
        } catch (\Throwable $e) {
            Log::error('AI conversation pipeline failed', [
                'conversation_id' => $this->conversationId,
                'message_id' => $this->messageId,
                'error' => $e->getMessage(),
            ]);

            $message->update([
                'status' => $message->status,
                'ai_metadata' => array_merge((array) $message->ai_metadata, [
                    'error' => $e->getMessage(),
                ]),
            ]);

            $this->fail($e);
        } finally {
            $tenantManager->forget();
        }
    }
}
