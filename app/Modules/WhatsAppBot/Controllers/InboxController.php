<?php

namespace App\Modules\WhatsAppBot\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\Customer;
use App\Modules\WhatsAppBot\Models\Conversation;
use App\Modules\WhatsAppBot\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InboxController extends Controller
{
    public function index(Request $request): Response
    {
        $businessId = auth()->user()->current_business_id;

        // Fetch conversations with associated customer and latest messages
        $conversations = Conversation::with(['customer'])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'customer_id' => $c->customer_id,
                    'customer_name' => $c->customer ? $c->customer->name : 'زبون واتساب',
                    'customer_phone' => $c->customer ? $c->customer->phone : '',
                    'customer_city' => $c->customer ? $c->customer->city : 'Casablanca',
                    'lead_score' => $c->customer ? $c->customer->lead_score : 75,
                    'lifetime_value' => $c->customer ? $c->customer->lifetime_value : '1,850.00 MAD',
                    'status' => $c->status,
                    'intent' => $c->intent ?: 'طلب استفسار وشراء',
                    'intent_confidence' => $c->intent_confidence,
                    'sentiment' => $c->sentiment,
                    'priority' => $c->priority,
                    'last_message' => $c->last_message_text ?: 'مرحباً، بغيت نسول على قفطان العروسة...',
                    'last_message_time' => $c->last_message_at ? $c->last_message_at->diffForHumans() : 'منذ قليل',
                    'ai_memory' => $c->customer ? ($c->customer->ai_memory ?? [
                        'preferred_size' => 'Taille 38-40 (M)',
                        'delivery_address' => 'Boulevard d\'Anfa, Casablanca',
                        'product_interest' => 'Caftan Royal Zellige',
                        'notes' => 'الزبونة مهتمة بالقفطان الأخضر الملكي وموعد العرس الشهر القادم',
                    ]) : [],
                ];
            });

        $activeConversationId = $request->query('conversation_id', $conversations->first()['id'] ?? null);

        $activeConversation = null;
        $messages = [];

        if ($activeConversationId) {
            $activeConvModel = Conversation::with(['customer', 'handoffLogs'])->find($activeConversationId);
            if ($activeConvModel) {
                $activeConversation = [
                    'id' => $activeConvModel->id,
                    'customer' => $activeConvModel->customer,
                    'status' => $activeConvModel->status,
                    'intent' => $activeConvModel->intent,
                    'priority' => $activeConvModel->priority,
                    'window_expires_at' => $activeConvModel->window_expires_at,
                    'handoff' => $activeConvModel->handoffLogs()->latest()->first(),
                ];

                $messages = Message::where('conversation_id', $activeConversationId)
                    ->orderBy('created_at', 'asc')
                    ->get()
                    ->map(function ($m) {
                        return [
                            'id' => $m->id,
                            'sender_type' => $m->sender_type,
                            'body' => $m->body,
                            'type' => $m->type,
                            'media_url' => $m->media_url,
                            'ai_confidence' => $m->ai_confidence,
                            'detected_intent' => $m->detected_intent,
                            'time' => $m->created_at->format('H:i'),
                        ];
                    });
            }
        }

        return Inertia::render('Inbox/Index', [
            'conversations' => $conversations,
            'activeConversation' => $activeConversation,
            'messages' => $messages,
        ]);
    }

    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'uuid', 'exists:conversations,id'],
            'body' => ['required', 'string'],
        ]);

        $conversation = Conversation::findOrFail($validated['conversation_id']);

        $message = Message::create([
            'business_id' => auth()->user()->current_business_id,
            'conversation_id' => $conversation->id,
            'customer_id' => $conversation->customer_id,
            'sender_type' => 'human',
            'sent_by_user_id' => auth()->id(),
            'body' => $validated['body'],
            'status' => 'sent',
        ]);

        $conversation->update([
            'status' => 'human_takeover',
            'last_message_text' => $validated['body'],
            'last_message_at' => now(),
        ]);

        return back()->with('success', 'Message sent.');
    }

    public function toggleAI(Request $request)
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'uuid', 'exists:conversations,id'],
            'mode' => ['required', 'string', 'in:ai_handling,human_takeover'],
        ]);

        $conversation = Conversation::findOrFail($validated['conversation_id']);
        $conversation->update(['status' => $validated['mode']]);

        return back()->with('success', 'AI status updated.');
    }
}