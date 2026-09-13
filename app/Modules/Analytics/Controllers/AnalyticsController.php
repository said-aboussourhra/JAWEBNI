<?php

namespace App\Modules\Analytics\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Agents\Models\AgentExecutionLog;
use App\Modules\Agents\Models\AIAgent;
use App\Modules\Booking\Models\Booking;
use App\Modules\CRM\Models\Customer;
use App\Modules\WhatsAppBot\Models\Conversation;
use App\Modules\WhatsAppBot\Models\Message;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        $businessId = (string) auth()->user()->current_business_id;
        $from = now()->subDays(13)->startOfDay();

        $conversationsTotal = Conversation::where('business_id', $businessId)->count();
        $conversationsToday = Conversation::where('business_id', $businessId)
            ->whereDate('created_at', today())
            ->count();

        $messagesTotal = Message::where('business_id', $businessId)->count();
        $aiMessages = Message::where('business_id', $businessId)->where('sender_type', 'ai')->count();
        $humanMessages = Message::where('business_id', $businessId)->where('sender_type', 'human')->count();

        $handoffs = Conversation::where('business_id', $businessId)->where('status', 'waiting_human')->count();

        $dailyVolume = Message::where('business_id', $businessId)
            ->where('created_at', '>=', $from)
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        $series = [];

        for ($i = 13; $i >= 0; $i--) {
            $day = now()->subDays($i);
            $key = $day->format('Y-m-d');
            $series[] = [
                'date' => $key,
                'label' => $day->translatedFormat('d M'),
                'total' => (int) ($dailyVolume[$key]->total ?? 0),
            ];
        }

        $intentBreakdown = Message::where('business_id', $businessId)
            ->whereNotNull('detected_intent')
            ->select('detected_intent', DB::raw('COUNT(*) as total'))
            ->groupBy('detected_intent')
            ->orderByDesc('total')
            ->limit(6)
            ->get()
            ->map(fn ($row) => [
                'intent' => $row->detected_intent,
                'total' => (int) $row->total,
            ]);

        $agentPerformance = AIAgent::where('business_id', $businessId)
            ->get()
            ->map(fn ($agent) => [
                'id' => $agent->id,
                'name' => $agent->name,
                'type' => $agent->type,
                'conversations_handled' => (int) $agent->conversations_handled,
                'success_rate' => (int) $agent->success_rate,
                'handoff_rate' => (int) $agent->handoff_rate,
                'status' => $agent->status,
            ]);

        $avgLatency = (int) (AgentExecutionLog::where('business_id', $businessId)->avg('latency_ms') ?? 0);

        $customersTotal = Customer::where('business_id', $businessId)->count();
        $newCustomers = Customer::where('business_id', $businessId)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $bookingsUpcoming = Booking::where('business_id', $businessId)
            ->where('status', 'confirmed')
            ->where('booking_datetime', '>=', now())
            ->count();

        $resolutionRate = $conversationsTotal > 0
            ? (int) round((($conversationsTotal - $handoffs) / $conversationsTotal) * 100)
            : 100;

        return Inertia::render('Analytics/Index', [
            'stats' => [
                'conversations_total' => $conversationsTotal,
                'conversations_today' => $conversationsToday,
                'messages_total' => $messagesTotal,
                'ai_messages' => $aiMessages,
                'human_messages' => $humanMessages,
                'handoffs' => $handoffs,
                'resolution_rate' => $resolutionRate,
                'avg_latency_ms' => $avgLatency,
                'customers_total' => $customersTotal,
                'new_customers' => $newCustomers,
                'bookings_upcoming' => $bookingsUpcoming,
                'hours_saved' => round(($aiMessages * 1.5) / 60, 1),
                'automation_rate' => $messagesTotal > 0 ? (int) round(($aiMessages / $messagesTotal) * 100) : 0,
            ],
            'series' => $series,
            'intents' => $intentBreakdown,
            'agents' => $agentPerformance,
            'period' => [
                'from' => $from->format('Y-m-d'),
                'to' => now()->format('Y-m-d'),
                'generated_at' => Carbon::now()->format('Y-m-d H:i'),
            ],
        ]);
    }
}
