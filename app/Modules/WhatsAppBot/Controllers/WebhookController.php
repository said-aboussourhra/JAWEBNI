<?php

namespace App\Modules\WhatsAppBot\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\Customer;
use App\Modules\WhatsAppBot\Models\Conversation;
use App\Modules\WhatsAppBot\Models\HumanHandoffLog;
use App\Modules\WhatsAppBot\Models\Message;
use App\Modules\WhatsAppBot\Models\WhatsAppAccount;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function verify(Request $request)
    {
        $mode = $request->query('hub_mode') ?? $request->query('hub.mode');
        $token = $request->query('hub_verify_token') ?? $request->query('hub.verify_token');
        $challenge = $request->query('hub_challenge') ?? $request->query('hub.challenge');

        $expectedVerifyToken = config('services.whatsapp.verify_token', 'jawebni_webhook_secret_2026');

        if ($mode === 'subscribe' && ($token === $expectedVerifyToken || WhatsAppAccount::where('verify_token', $token)->exists())) {
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        return response()->json(['error' => 'Unauthorized verification challenge.'], 403);
    }

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        // 1. Check if payload contains entry and changes
        if (empty($payload['entry'])) {
            return response()->json(['status' => 'ignored'], 200);
        }

        foreach ($payload['entry'] as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                if (($change['field'] ?? '') !== 'messages') {
                    continue;
                }

                $value = $change['value'] ?? [];
                $phoneNumberId = $value['metadata']['phone_number_id'] ?? null;
                $contacts = $value['contacts'] ?? [];
                $incomingMessages = $value['messages'] ?? [];

                if (!$phoneNumberId || empty($incomingMessages)) {
                    continue;
                }

                // Resolve Tenant via WhatsAppAccount phone_number_id
                $account = WhatsAppAccount::where('phone_number_id', $phoneNumberId)->first();
                $businessId = $account ? $account->business_id : (string) \App\Modules\Tenancy\Models\Business::first()?->id;

                foreach ($incomingMessages as $msg) {
                    $fromPhone = $msg['from'] ?? '';
                    $msgId = $msg['id'] ?? null;
                    $msgType = $msg['type'] ?? 'text';
                    $msgBody = $msg['text']['body'] ?? '';
                    $profileName = $contacts[0]['profile']['name'] ?? 'زبون واتساب';

                    // Prevent duplicate processing
                    if ($msgId && Message::where('whatsapp_message_id', $msgId)->exists()) {
                        continue;
                    }

                    // 1. Resolve or Create Customer
                    $customer = Customer::withoutGlobalScopes()->firstOrCreate(
                        ['business_id' => $businessId, 'phone' => $fromPhone],
                        [
                            'name' => $profileName,
                            'city' => 'Casablanca',
                            'preferred_language' => 'darija',
                            'last_seen_at' => now(),
                        ]
                    );

                    // 2. Resolve Active Conversation
                    $conversation = Conversation::withoutGlobalScopes()
                        ->where('business_id', $businessId)
                        ->where('customer_id', $customer->id)
                        ->where('status', '!=', 'closed')
                        ->latest()
                        ->first();

                    if (!$conversation) {
                        $conversation = Conversation::withoutGlobalScopes()->create([
                            'business_id' => $businessId,
                            'customer_id' => $customer->id,
                            'whatsapp_account_id' => $account?->id,
                            'status' => 'ai_handling',
                            'intent' => 'purchase_inquiry',
                            'intent_confidence' => 92,
                            'sentiment' => 'positive',
                            'priority' => 'normal',
                            'window_expires_at' => Carbon::now()->addHours(24),
                        ]);
                    }

                    // Check for Handoff Trigger words (Complaints / Explicit Human Request)
                    $isComplaint = preg_match('/(شكوى|استرجاع|فلوسي|réclamation|remboursement|problem|نصابين|ردولي)/ui', $msgBody);
                    $confidence = $isComplaint ? 42 : 94;

                    if ($isComplaint) {
                        $conversation->status = 'waiting_human';
                        $conversation->priority = 'urgent';
                        $conversation->sentiment = 'negative';
                        $conversation->save();

                        HumanHandoffLog::withoutGlobalScopes()->create([
                            'business_id' => $businessId,
                            'conversation_id' => $conversation->id,
                            'reason' => 'customer_complaint',
                            'ai_confidence' => 42,
                            'status' => 'pending',
                        ]);
                    }

                    // 3. Store Inbound Message
                    $savedMessage = Message::withoutGlobalScopes()->create([
                        'business_id' => $businessId,
                        'conversation_id' => $conversation->id,
                        'customer_id' => $customer->id,
                        'whatsapp_message_id' => $msgId,
                        'sender_type' => 'customer',
                        'type' => $msgType,
                        'body' => $msgBody,
                        'status' => 'delivered',
                        'detected_intent' => $isComplaint ? 'complaint' : 'purchase_inquiry',
                        'ai_confidence' => $confidence,
                    ]);

                    $conversation->update([
                        'last_message_text' => $msgBody,
                        'last_message_at' => now(),
                        'window_expires_at' => Carbon::now()->addHours(24),
                    ]);
                }
            }
        }

        return response()->json(['status' => 'success'], 200);
    }
}