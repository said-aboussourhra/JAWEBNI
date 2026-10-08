<?php

namespace App\Modules\AIEngine\Services;

use App\Modules\Agents\Models\AIAgent;
use App\Modules\Agents\Models\AgentExecutionLog;
use App\Modules\Agents\Services\AgentRouterService;
use App\Modules\AIEngine\Models\AIPersonality;
use App\Modules\Billing\Services\UsageService;
use App\Modules\CRM\Models\Customer;
use App\Modules\RAG\Services\RAGRetrievalService;
use App\Modules\Tenancy\Models\Business;
use App\Modules\WhatsAppBot\Models\Conversation;
use App\Modules\WhatsAppBot\Models\HumanHandoffLog;
use App\Modules\WhatsAppBot\Models\Message;
use App\Modules\WhatsAppBot\Services\WhatsAppDeliveryService;
use Illuminate\Support\Facades\Log;

/**
 * Orchestrates a full AI turn: intent routing, RAG retrieval, generation,
 * delivery through the Meta Cloud API, logging and quota consumption.
 */
class AIConversationService
{
    public function __construct(
        protected AgentRouterService $router,
        protected PromptBuilderService $promptBuilder,
        protected RAGRetrievalService $retrieval,
        protected AIProviderFactory $factory,
        protected UsageService $usage,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function handleIncoming(Conversation $conversation, Message $inbound): array
    {
        $businessId = (string) $conversation->business_id;
        $customer = $conversation->customer;
        $body = (string) ($inbound->body ?? '');

        $routing = $this->router->routeMessage($body);
        $agent = $this->resolveAgent($businessId, $routing['agent_type']);

        // 1. Human handoff (explicit complaint or a conversation already waiting)
        if (($routing['requires_handoff'] ?? false) || $conversation->status === 'waiting_human') {
            return $this->handoff($conversation, $customer, $routing, $agent, $businessId);
        }

        // 2. Quota guard — never answer beyond the subscribed plan.
        if (! $this->usage->hasQuota($businessId)) {
            return [
                'status' => 'quota_exceeded',
                'agent' => $routing['agent_type'],
                'replied' => false,
            ];
        }

        // 3. Retrieve knowledge and build the prompt.
        $knowledge = $this->retrieval->retrieveRelevantChunks($businessId, $body);
        $personality = AIPersonality::withoutTenantScope()
            ->where('business_id', $businessId)
            ->first();

        $business = Business::find($businessId);
        $memory = is_array($customer?->ai_memory) ? $customer->ai_memory : [];

        $systemPrompt = $business
            ? $this->promptBuilder->buildSystemPrompt($business, $personality, $agent, $knowledge, $memory)
            : $this->promptBuilder->buildSystemPrompt(
                new Business(['name' => 'النشاط التجاري', 'city' => 'Casablanca']),
                $personality,
                $agent,
                $knowledge,
                $memory
            );

        // 4. Call the AI provider.
        $provider = $this->factory->resolve($business?->getSetting('ai_provider'));
        $result = $provider->generateResponse(
            $this->buildMessages($systemPrompt, $conversation, $inbound),
            ['max_tokens' => config('ai.max_tokens', 700)]
        );

        $reply = trim((string) ($result['text'] ?? ''));

        if ($reply === '') {
            return ['status' => 'empty_response', 'agent' => $routing['agent_type'], 'replied' => false];
        }

        // 5. Persist + deliver the AI answer.
        $outbound = Message::withoutTenantScope()->create([
            'business_id' => $businessId,
            'conversation_id' => $conversation->id,
            'customer_id' => $customer?->id,
            'sender_type' => 'ai',
            'type' => 'text',
            'body' => $reply,
            'status' => 'queued',
            'detected_intent' => $routing['intent'] ?? null,
            'ai_confidence' => (int) ($routing['confidence'] ?? 0),
            'ai_metadata' => array_merge($result, [
                'agent_type' => $routing['agent_type'],
                'knowledge_chunks' => count($knowledge),
            ]),
        ]);

        $delivery = $this->deliver($conversation, $customer, $reply);

        $outbound->update(['status' => $delivery['success'] ? 'sent' : 'failed']);

        $conversation->update([
            'status' => 'ai_handling',
            'intent' => $routing['intent'] ?? $conversation->intent,
            'intent_confidence' => (int) ($routing['confidence'] ?? $conversation->intent_confidence),
            'last_message_text' => $reply,
            'last_message_at' => now(),
        ]);

        // 6. Telemetry + billing.
        if ($agent) {
            AgentExecutionLog::withoutTenantScope()->create([
                'business_id' => $businessId,
                'agent_id' => $agent->id,
                'conversation_id' => $conversation->id,
                'detected_intent' => $routing['intent'] ?? null,
                'confidence_score' => (int) ($routing['confidence'] ?? 0),
                'latency_ms' => (int) ($result['latency_ms'] ?? 0),
                'handoff_triggered' => false,
            ]);

            $agent->increment('conversations_handled');
        }

        $this->usage->increment($businessId);

        return [
            'status' => 'replied',
            'agent' => $routing['agent_type'],
            'replied' => true,
            'delivered' => $delivery['success'],
            'provider' => $result['provider'] ?? null,
            'mode' => $result['mode'] ?? 'offline',
            'latency_ms' => $result['latency_ms'] ?? null,
            'message_id' => $outbound->id,
        ];
    }

    /**
     * @param  array<string, mixed>  $routing
     * @return array<string, mixed>
     */
    protected function handoff(Conversation $conversation, ?Customer $customer, array $routing, ?AIAgent $agent, string $businessId): array
    {
        $conversation->update([
            'status' => 'waiting_human',
            'priority' => 'urgent',
            'sentiment' => 'negative',
            'intent' => $routing['intent'] ?? 'complaint_escalation',
            'intent_confidence' => (int) ($routing['confidence'] ?? 45),
        ]);

        HumanHandoffLog::withoutTenantScope()->create([
            'business_id' => $businessId,
            'conversation_id' => $conversation->id,
            'reason' => 'customer_complaint',
            'ai_confidence' => (int) ($routing['confidence'] ?? 45),
            'status' => 'pending',
        ]);

        if ($agent) {
            AgentExecutionLog::withoutTenantScope()->create([
                'business_id' => $businessId,
                'agent_id' => $agent->id,
                'conversation_id' => $conversation->id,
                'detected_intent' => $routing['intent'] ?? 'complaint_escalation',
                'confidence_score' => (int) ($routing['confidence'] ?? 45),
                'latency_ms' => 0,
                'handoff_triggered' => true,
            ]);
        }

        $acknowledgement = 'نعتذر لك على هذا الإزعاج 🙏 تم تحويل محادثتك إلى المسؤول وسيتواصل معك مباشرة على هذا الرقم.';
        $delivery = $this->deliver($conversation, $customer, $acknowledgement);

        Message::withoutTenantScope()->create([
            'business_id' => $businessId,
            'conversation_id' => $conversation->id,
            'customer_id' => $customer?->id,
            'sender_type' => 'system',
            'type' => 'text',
            'body' => $acknowledgement,
            'status' => $delivery['success'] ? 'sent' : 'queued',
            'detected_intent' => 'complaint_escalation',
        ]);

        return [
            'status' => 'human_handoff',
            'agent' => $routing['agent_type'],
            'replied' => true,
            'delivered' => $delivery['success'],
        ];
    }

    /**
     * @return array<int, array{role: string, content: string}>
     */
    protected function buildMessages(string $systemPrompt, Conversation $conversation, Message $inbound): array
    {
        $messages = [['role' => 'system', 'content' => $systemPrompt]];

        $history = Message::withoutTenantScope()
            ->where('conversation_id', $conversation->id)
            ->where('id', '!=', $inbound->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->reverse()
            ->values();

        foreach ($history as $message) {
            if (empty($message->body)) {
                continue;
            }

            $messages[] = [
                'role' => $message->sender_type === 'customer' ? 'user' : 'assistant',
                'content' => (string) $message->body,
            ];
        }

        $messages[] = ['role' => 'user', 'content' => (string) $inbound->body];

        return $messages;
    }

    protected function resolveAgent(string $businessId, string $type): ?AIAgent
    {
        return AIAgent::withoutTenantScope()
            ->where('business_id', $businessId)
            ->where('type', $type)
            ->first();
    }

    /**
     * @return array{success: bool, reason?: string, response?: array}
     */
    protected function deliver(Conversation $conversation, ?Customer $customer, string $body): array
    {
        if (empty($customer?->phone)) {
            return ['success' => false, 'reason' => 'missing_phone'];
        }

        try {
            $response = app(WhatsAppDeliveryService::class)->sendText($conversation, $body);

            return [
                'success' => (bool) ($response['success'] ?? false),
                'reason' => $response['reason'] ?? null,
                'response' => $response,
            ];
        } catch (\Throwable $e) {
            Log::error('WhatsApp delivery failed: '.$e->getMessage());

            return ['success' => false, 'reason' => 'exception'];
        }
    }
}
