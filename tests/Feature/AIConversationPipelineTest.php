<?php

namespace Tests\Feature;

use App\Jobs\ProcessIncomingWhatsAppMessage;
use App\Modules\AIEngine\Services\AIConversationService;
use App\Modules\Agents\Models\AIAgent;
use App\Modules\Billing\Models\Subscription;
use App\Modules\Billing\Models\SubscriptionPlan;
use App\Modules\CRM\Models\Customer;
use App\Modules\Tenancy\Models\Business;
use App\Modules\WhatsAppBot\Models\Conversation;
use App\Modules\WhatsAppBot\Models\Message;
use App\Modules\WhatsAppBot\Models\WhatsAppAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AIConversationPipelineTest extends TestCase
{
    use RefreshDatabase;

    protected Business $business;

    protected function setUp(): void
    {
        parent::setUp();

        $this->business = Business::create([
            'name' => 'Caftan Royal Casablanca',
            'slug' => 'caftan-royal',
            'city' => 'Casablanca',
            'status' => 'active',
        ]);

        $plan = SubscriptionPlan::create([
            'name' => 'Professional',
            'slug' => 'professional',
            'price_mad' => 499,
            'messages_limit' => 3000,
        ]);

        Subscription::create([
            'business_id' => $this->business->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        WhatsAppAccount::create([
            'business_id' => $this->business->id,
            'phone_number' => '+212661000001',
            'phone_number_id' => 'PHONE_ID_AI_TEST',
            'access_token' => 'EAAG_MOCK_TOKEN',
            'verify_token' => 'jawebni_webhook_secret_2026',
            'status' => 'connected',
        ]);

        AIAgent::create([
            'business_id' => $this->business->id,
            'type' => 'sales',
            'name' => 'Sales Agent',
            'purpose' => 'تحويل الاستفسارات إلى مبيعات',
            'instructions' => 'الترحيب بالدارجة واقتراح الدفع عند الاستلام.',
            'status' => 'active',
        ]);
    }

    protected function incomingMessage(string $body, string $status = 'ai_handling'): array
    {
        $customer = Customer::withoutTenantScope()->create([
            'business_id' => $this->business->id,
            'name' => 'زبون تجريبي',
            'phone' => '+212661112233',
            'city' => 'Casablanca',
        ]);

        $conversation = Conversation::withoutTenantScope()->create([
            'business_id' => $this->business->id,
            'customer_id' => $customer->id,
            'status' => $status,
            'intent' => 'purchase_inquiry',
            'intent_confidence' => 95,
            'window_expires_at' => now()->addDay(),
        ]);

        $message = Message::withoutTenantScope()->create([
            'business_id' => $this->business->id,
            'conversation_id' => $conversation->id,
            'customer_id' => $customer->id,
            'sender_type' => 'customer',
            'type' => 'text',
            'body' => $body,
            'status' => 'delivered',
        ]);

        return [$conversation, $message];
    }

    public function test_ai_pipeline_generates_and_stores_a_reply(): void
    {
        [$conversation, $message] = $this->incomingMessage('السلام عليكم، شحال ثمن القفطان الملكي؟');

        ProcessIncomingWhatsAppMessage::dispatchSync(
            (string) $this->business->id,
            (string) $conversation->id,
            (string) $message->id
        );

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_type' => 'ai',
        ]);

        $this->assertDatabaseHas('agent_execution_logs', [
            'business_id' => $this->business->id,
            'conversation_id' => $conversation->id,
            'detected_intent' => 'purchase_inquiry',
            'handoff_triggered' => false,
        ]);

        $conversation->refresh();
        $this->assertSame('ai_handling', $conversation->status);
        $this->assertNotEmpty($conversation->last_message_text);
    }

    public function test_complaint_message_triggers_human_handoff_and_no_ai_reply(): void
    {
        [$conversation, $message] = $this->incomingMessage('عندي شكوى وبغيت استرجاع فلوسي');

        app(AIConversationService::class)->handleIncoming($conversation, $message);

        $this->assertSame('waiting_human', $conversation->fresh()->status);

        $this->assertDatabaseHas('human_handoff_logs', [
            'business_id' => $this->business->id,
            'conversation_id' => $conversation->id,
            'reason' => 'customer_complaint',
            'status' => 'pending',
        ]);

        $this->assertDatabaseMissing('messages', [
            'conversation_id' => $conversation->id,
            'sender_type' => 'ai',
        ]);
    }

    public function test_ai_stays_silent_when_subscription_quota_is_exhausted(): void
    {
        $plan = SubscriptionPlan::create([
            'name' => 'Starter',
            'slug' => 'starter',
            'price_mad' => 99,
            'messages_limit' => 1,
        ]);

        Subscription::where('business_id', $this->business->id)->update([
            'plan_id' => $plan->id,
        ]);

        [$conversation, $message] = $this->incomingMessage('شحال ثمن الجلابة؟');

        // Consume the single available message.
        Message::withoutTenantScope()->create([
            'business_id' => $this->business->id,
            'conversation_id' => $conversation->id,
            'sender_type' => 'ai',
            'type' => 'text',
            'body' => 'رد سابق',
            'status' => 'sent',
        ]);

        $result = app(AIConversationService::class)->handleIncoming($conversation, $message);

        $this->assertSame('quota_exceeded', $result['status']);
        $this->assertFalse($result['replied']);
    }
}
