<?php

namespace App\Modules\Business\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Agents\Models\AIAgent;
use App\Modules\Booking\Models\Booking;
use App\Modules\CRM\Models\Customer;
use App\Modules\RAG\Models\KnowledgeDocument;
use App\Modules\Tenancy\Models\Business;
use App\Modules\WhatsAppBot\Models\Conversation;
use App\Modules\WhatsAppBot\Models\Message;
use App\Modules\WhatsAppBot\Models\WhatsAppAccount;
use Inertia\Inertia;
use Inertia\Response;

class BusinessPulseController extends Controller
{
    public function index(): Response
    {
        $business = auth()->user()->currentBusiness;
        $businessId = (string) auth()->user()->current_business_id;

        $conversationsTotal = Conversation::where('business_id', $businessId)->count();
        $conversationsToday = Conversation::where('business_id', $businessId)
            ->whereDate('last_message_at', today())
            ->count();

        $aiMessagesToday = Message::where('business_id', $businessId)
            ->where('sender_type', 'ai')
            ->whereDate('created_at', today())
            ->count();

        $waiting = Conversation::where('business_id', $businessId)
            ->where('status', 'waiting_human')
            ->count();

        $account = WhatsAppAccount::where('business_id', $businessId)->first();

        $resolutionRate = $conversationsTotal > 0
            ? (int) round((($conversationsTotal - $waiting) / $conversationsTotal) * 100)
            : 100;

        $metrics = [
            'conversations_today' => $conversationsToday,
            'conversations_total' => $conversationsTotal,
            'hours_saved' => round(($aiMessagesToday * 1.5) / 60, 1),
            'high_value_opportunities' => Customer::where('business_id', $businessId)
                ->where('lead_score', '>=', 80)
                ->count(),
            'ai_resolution_rate' => $resolutionRate,
            'whatsapp_status' => $account?->status ?? 'not_connected',
            'ai_readiness_score' => $business?->ai_readiness_score ?? 20,
            'knowledge_documents' => KnowledgeDocument::where('business_id', $businessId)->count(),
            'active_agents' => AIAgent::where('business_id', $businessId)->where('status', 'active')->count(),
            'upcoming_bookings' => Booking::where('business_id', $businessId)
                ->where('status', 'confirmed')
                ->where('booking_datetime', '>=', now())
                ->count(),
        ];

        return Inertia::render('BusinessPulse/Index', [
            'business' => $business,
            'metrics' => $metrics,
            'liveActivities' => $this->liveActivities($businessId),
            'opportunities' => $this->opportunities($businessId),
            'businessStory' => $this->story($business, $metrics),
        ]);
    }

    protected function liveActivities(string $businessId): array
    {
        return Message::with(['customer', 'conversation'])
            ->where('business_id', $businessId)
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'customer_name' => $message->customer?->name ?: 'زبون واتساب',
                    'query' => $message->body,
                    'agent_name' => $this->agentLabel($message->detected_intent),
                    'action_taken' => $message->sender_type === 'ai'
                        ? 'تم الرد تلقائياً بالاعتماد على قاعدة المعرفة'
                        : 'في انتظار معالجة الموظف الذكي',
                    'confidence' => (int) ($message->ai_confidence ?: 0),
                    'status' => $message->sender_type === 'ai' ? 'ai_handled' : ($message->detected_intent === 'complaint' ? 'human_handoff' : 'incoming'),
                    'timestamp' => $message->created_at?->diffForHumans() ?: 'الآن',
                ];
            })
            ->toArray();
    }

    protected function opportunities(string $businessId): array
    {
        $hotLeads = Customer::where('business_id', $businessId)
            ->where('lead_score', '>=', 70)
            ->orderByDesc('lead_score')
            ->take(4)
            ->get()
            ->map(fn ($customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'intent' => 'Purchase Ready',
                'score' => (int) $customer->lead_score,
                'summary' => 'آخر تفاعل: '.($customer->last_seen_at?->diffForHumans() ?? 'غير معروف'),
            ])
            ->toArray();

        $waitingCustomers = Conversation::with('customer')
            ->where('business_id', $businessId)
            ->where('status', 'waiting_human')
            ->latest()
            ->take(4)
            ->get()
            ->map(fn ($conversation) => [
                'id' => $conversation->id,
                'name' => $conversation->customer?->name ?? 'زبون واتساب',
                'phone' => $conversation->customer?->phone ?? '',
                'intent' => 'Complaint / Refund',
                'urgency' => 'High',
                'summary' => $conversation->last_message_text ?? '',
            ])
            ->toArray();

        $unanswered = Message::where('business_id', $businessId)
            ->where('sender_type', 'customer')
            ->whereNull('detected_intent')
            ->latest()
            ->take(3)
            ->get()
            ->map(fn ($message) => [
                'id' => $message->id,
                'query' => $message->body,
                'count' => 1,
                'action' => 'أضف الجواب إلى قاعدة المعرفة',
            ])
            ->toArray();

        $returning = Customer::where('business_id', $businessId)
            ->where('total_orders', '>=', 2)
            ->orderByDesc('lifetime_value')
            ->take(3)
            ->get()
            ->map(fn ($customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'orders_count' => (int) $customer->total_orders,
                'total_spent' => number_format((float) $customer->lifetime_value, 2).' MAD',
                'last_seen' => $customer->last_seen_at?->diffForHumans() ?? 'غير معروف',
            ])
            ->toArray();

        return [
            'hot_leads' => $hotLeads,
            'waiting_customers' => $waitingCustomers,
            'unanswered_questions' => $unanswered,
            'returning_customers' => $returning,
        ];
    }

    protected function story(?Business $business, array $metrics): array
    {
        $name = $business?->name ?? 'نشاطك التجاري';

        return [
            'headline' => 'Today your AI employee handled '.$metrics['conversations_today'].' conversations with a '.$metrics['ai_resolution_rate'].'% resolution rate.',
            'body_ar' => "اليوم عالج الموظف الذكي جاوبني {$metrics['conversations_today']} محادثة لفائدة {$name}، ووفّر لك حوالي {$metrics['hours_saved']} ساعات من العمل اليدوي، مع {$metrics['high_value_opportunities']} فرصة بيع عالية القيمة تستحق المتابعة الفورية.",
            'body_fr' => "Aujourd'hui, votre employé IA Jawebni a traité {$metrics['conversations_today']} conversations pour {$name}, vous a fait économiser environ {$metrics['hours_saved']} heures de travail manuel et a identifié {$metrics['high_value_opportunities']} opportunités à forte valeur.",
        ];
    }

    protected function agentLabel(?string $intent): string
    {
        return match ($intent) {
            'complaint', 'complaint_escalation' => 'Complaint Agent',
            'appointment_booking' => 'Booking Agent',
            'purchase_inquiry' => 'Sales Agent',
            'order_support' => 'Support Agent',
            default => 'FAQ Agent',
        };
    }
}
