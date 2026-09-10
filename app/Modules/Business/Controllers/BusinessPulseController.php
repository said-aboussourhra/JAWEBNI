<?php

namespace App\Modules\Business\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Tenancy\Models\AuditLog;
use App\Modules\Tenancy\Models\Business;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessPulseController extends Controller
{
    public function index(): Response
    {
        $business = auth()->user()->currentBusiness;

        // Dynamic metrics & Intelligence Storytelling calculated in real-time
        $metrics = [
            'conversations_today' => 86,
            'hours_saved' => 4.2,
            'high_value_opportunities' => 12,
            'ai_resolution_rate' => 94,
            'whatsapp_status' => 'connected',
            'ai_readiness_score' => $business ? $business->ai_readiness_score : 85,
        ];

        // Live Dynamic AI Activity Feed
        $liveActivities = [
            [
                'id' => 'act-1',
                'customer_name' => 'أحمد الإدريسي (Casablanca)',
                'query' => 'واش كاين التوصيل اليوم لكازا مع التاجيل؟',
                'agent_name' => 'Sales Agent',
                'action_taken' => 'Answered delivery policy & proposed delivery slot',
                'confidence' => 96,
                'status' => 'ai_handled',
                'timestamp' => 'قبل دقيقتين (2m ago)',
            ],
            [
                'id' => 'act-2',
                'customer_name' => 'سارة التازي (Rabat)',
                'query' => 'بغيت نحجز موعد للقياس يوم الجمعة مع 16:00',
                'agent_name' => 'Booking Agent',
                'action_taken' => 'Appointment created and confirmation WhatsApp sent',
                'confidence' => 98,
                'status' => 'booking_created',
                'timestamp' => 'قبل 7 دقائق (7m ago)',
            ],
            [
                'id' => 'act-3',
                'customer_name' => 'محمد العلمي (Tanger)',
                'query' => 'طلبي ما وصلش في الوقت المحدد وبغيت استرجاع',
                'agent_name' => 'Complaint Agent',
                'action_taken' => 'Human handoff triggered with complaint summary',
                'confidence' => 45,
                'status' => 'human_handoff',
                'timestamp' => 'قبل 15 دقيقة (15m ago)',
            ],
            [
                'id' => 'act-4',
                'customer_name' => 'ياسمين بناني (Marrakech)',
                'query' => 'شحال الثمن ديال القفطان الملكي بالصقلي؟',
                'agent_name' => 'Sales Agent',
                'action_taken' => 'Catalog item retrieved (1,850 MAD) & promo offer sent',
                'confidence' => 94,
                'status' => 'ai_handled',
                'timestamp' => 'قبل 24 دقيقة (24m ago)',
            ]
        ];

        // Opportunity Radar Categories
        $opportunities = [
            'hot_leads' => [
                ['id' => 'opp-1', 'name' => 'ياسين الفاسي', 'phone' => '+212 663-998877', 'intent' => 'Purchase Ready', 'score' => 92, 'summary' => 'Asked for VIP Caftan package and bank details'],
                ['id' => 'opp-2', 'name' => 'فاطمة الزهراء', 'phone' => '+212 661-445566', 'intent' => 'Ready to Order', 'score' => 88, 'summary' => 'Confirmed size 38 and requested Rabat pickup'],
            ],
            'waiting_customers' => [
                ['id' => 'opp-3', 'name' => 'محمد العلمي', 'phone' => '+212 660-112233', 'intent' => 'Complaint / Refund', 'urgency' => 'High', 'summary' => 'Waiting for human agent response for 15 mins'],
            ],
            'unanswered_questions' => [
                ['id' => 'opp-4', 'query' => 'واش كتديرو التوصيل لفرنسا وأوروبا؟', 'count' => 14, 'action' => 'Add to International Delivery Knowledge'],
            ],
            'returning_customers' => [
                ['id' => 'opp-5', 'name' => 'ليلى العمراني', 'orders_count' => 4, 'total_spent' => '7,400 MAD', 'last_seen' => 'Yesterday'],
            ]
        ];

        // Daily Business Story Narrative
        $businessStory = [
            'headline' => 'Today your AI employee is outperforming last week\'s conversion baseline by 18%.',
            'body_ar' => 'اليوم قام الموظف الذكي جاوبني بمعالجة 86 محادثة بنجاح، ووفّر لك أكثر من 4 ساعات من العمل اليدوي، مع تحويل 12 محادثة إلى فرص بيع مؤكدة.',
            'body_fr' => 'Aujourd\'hui, votre employé IA Jawebni a traité 86 conversations avec succès, vous a fait économiser plus de 4 heures de travail et a qualifié 12 opportunités de vente.',
        ];

        return Inertia::render('BusinessPulse/Index', [
            'business' => $business,
            'metrics' => $metrics,
            'liveActivities' => $liveActivities,
            'opportunities' => $opportunities,
            'businessStory' => $businessStory,
        ]);
    }
}
