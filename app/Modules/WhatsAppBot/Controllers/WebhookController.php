<?php

namespace App\Modules\WhatsAppBot\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessIncomingWhatsAppMessage;
use App\Modules\CRM\Models\Customer;
use App\Modules\WhatsAppBot\Models\Conversation;
use App\Modules\WhatsAppBot\Models\Message;
use App\Modules\WhatsAppBot\Models\WhatsAppAccount;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class WebhookController extends Controller
{
    /**
     * Meta Cloud API subscription challenge (GET).
     */
    public function verify(Request $request)
    {
        $mode = $request->query('hub_mode') ?? $request->query('hub.mode');
        $token = $request->query('hub_verify_token') ?? $request->query('hub.verify_token');
        $challenge = $request->query('hub_challenge') ?? $request->query('hub.challenge');

        $expectedVerifyToken = (string) config('services.whatsapp.verify_token', 'jawebni_webhook_secret_2026');

        if ($mode === 'subscribe' && hash_equals($expectedVerifyToken, (string) $token)) {
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        if ($mode === 'subscribe' && WhatsAppAccount::withoutTenantScope()->where('verify_token', $token)->exists()) {
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        return response()->json(['error' => 'Unauthorized verification challenge.'], 403);
    }

    /**
     * Inbound messages and delivery statuses (POST).
     */
    public function handle(Request $request): JsonResponse
    {
        if (RateLimiter::tooManyAttempts('whatsapp-webhook:'.$request->ip(), 600)) {
            return response()->json(['status' => 'rate_limited'], 429);
        }

        RateLimiter::hit('whatsapp-webhook:'.$request->ip());

        // Verify the Meta SHA-256 signature when an app secret is configured.
        if (! $this->signatureIsValid($request)) {
            Log::warning('WhatsApp webhook rejected: invalid signature.');

            return response()->json(['error' => 'Invalid signature.'], 401);
        }

        $payload = $request->all();

        if (empty($payload['entry'])) {
            return response()->json(['status' => 'ignored'], 200);
        }

        foreach ($payload['entry'] as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                if (($change['field'] ?? '') === 'messages') {
                    $this->handleMessages((array) ($change['value'] ?? []));
                    continue;
                }

                // Delivery / read receipts.
                $this->handleStatuses((array) ($change['value'] ?? []));
            }
        }

        return response()->json(['status' => 'success'], 200);
    }

    protected function handleMessages(array $value): void
    {
        $phoneNumberId = $value['metadata']['phone_number_id'] ?? null;
        $contacts = $value['contacts'] ?? [];
        $incomingMessages = $value['messages'] ?? [];

        if (! $phoneNumberId || empty($incomingMessages)) {
            return;
        }

        $account = WhatsAppAccount::withoutTenantScope()
            ->where('phone_number_id', $phoneNumberId)
            ->first();

        if (! $account) {
            Log::warning('Webhook received for unknown phone_number_id.', ['phone_number_id' => $phoneNumberId]);

            return;
        }

        $businessId = (string) $account->business_id;

        foreach ($incomingMessages as $msg) {
            $fromPhone = (string) ($msg['from'] ?? '');
            $msgId = $msg['id'] ?? null;
            $msgType = $msg['type'] ?? 'text';
            $msgBody = $msg['text']['body'] ?? '';
            $profileName = $contacts[0]['profile']['name'] ?? 'زبون واتساب';

            if ($fromPhone === '') {
                continue;
            }

            // Prevent duplicate processing (Meta retries webhooks).
            if ($msgId && Message::withoutTenantScope()->where('whatsapp_message_id', $msgId)->exists()) {
                continue;
            }

            // 1. Resolve or create the customer.
            $customer = Customer::withoutTenantScope()->firstOrCreate(
                ['business_id' => $businessId, 'phone' => $fromPhone],
                [
                    'name' => $profileName,
                    'city' => 'Casablanca',
                    'preferred_language' => 'darija',
                    'last_seen_at' => now(),
                ]
            );

            $customer->forceFill(['last_seen_at' => now()])->save();

            // 2. Resolve the active conversation (reopen closed ones).
            $conversation = Conversation::withoutTenantScope()
                ->where('business_id', $businessId)
                ->where('customer_id', $customer->id)
                ->where('status', '!=', 'closed')
                ->latest()
                ->first();

            if (! $conversation) {
                $conversation = Conversation::withoutTenantScope()->create([
                    'business_id' => $businessId,
                    'customer_id' => $customer->id,
                    'whatsapp_account_id' => $account->id,
                    'status' => 'ai_handling',
                    'intent' => 'purchase_inquiry',
                    'intent_confidence' => 92,
                    'sentiment' => 'positive',
                    'priority' => 'normal',
                    'window_expires_at' => Carbon::now()->addHours(24),
                ]);
            }

            // 3. Store the inbound message.
            $savedMessage = Message::withoutTenantScope()->create([
                'business_id' => $businessId,
                'conversation_id' => $conversation->id,
                'customer_id' => $customer->id,
                'whatsapp_message_id' => $msgId,
                'sender_type' => 'customer',
                'type' => $msgType,
                'body' => $msgBody,
                'status' => 'delivered',
            ]);

            $conversation->update([
                'last_message_text' => $msgBody,
                'last_message_at' => now(),
                'window_expires_at' => Carbon::now()->addHours(24),
            ]);

            // 4. Let the AI employee answer (queued, never blocks the webhook).
            ProcessIncomingWhatsAppMessage::dispatch($businessId, (string) $conversation->id, (string) $savedMessage->id);
        }
    }

    protected function handleStatuses(array $value): void
    {
        foreach ($value['statuses'] ?? [] as $status) {
            $messageId = $status['id'] ?? null;

            if (! $messageId) {
                continue;
            }

            $update = match ($status['status'] ?? null) {
                'sent' => ['status' => 'sent'],
                'delivered' => ['status' => 'delivered'],
                'read' => ['status' => 'read'],
                'failed' => ['status' => 'failed'],
                default => null,
            };

            if ($update) {
                Message::withoutTenantScope()
                    ->where('whatsapp_message_id', $messageId)
                    ->update($update);
            }
        }
    }

    protected function signatureIsValid(Request $request): bool
    {
        $appSecret = (string) config('services.whatsapp.app_secret');

        if ($appSecret === '') {
            // No secret configured (local dev / demo): skip verification.
            return true;
        }

        $signature = (string) $request->header('X-Hub-Signature-256', '');

        if ($signature === '') {
            return false;
        }

        $expected = 'sha256='.hash_hmac('sha256', $request->getContent(), $appSecret);

        return hash_equals($expected, $signature);
    }
}
