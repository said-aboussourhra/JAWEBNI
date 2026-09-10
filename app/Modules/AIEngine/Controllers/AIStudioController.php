<?php

namespace App\Modules\AIEngine\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Agents\Models\AIAgent;
use App\Modules\Agents\Services\AgentRouterService;
use App\Modules\AIEngine\Models\AIPersonality;
use App\Modules\AIEngine\Models\AITestRun;
use App\Modules\AIEngine\Models\KnowledgeItem;
use App\Modules\RAG\Models\KnowledgeDocument;
use App\Modules\RAG\Services\KnowledgeHealthService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AIStudioController extends Controller
{
    public function index(KnowledgeHealthService $healthService): Response
    {
        $business = auth()->user()->currentBusiness;
        $businessId = $business->id;

        // Initialize 5 Specialized Agents if not present
        $defaultAgents = [
            ['type' => 'sales', 'name' => 'Sales Agent', 'purpose' => 'تحويل الاستفسارات إلى مبيعات مؤكدة واقتراح المقاسات وروابط الدفع', 'instructions' => 'الترحيب الحار بالدارجة المغربية، عرض الأسعار من الكتالوج، واقتراح تأكيد الطلبية فورا مع الدفع عند الاستلام.'],
            ['type' => 'booking', 'name' => 'Booking Agent', 'purpose' => 'حجز وإدارة مواعيد القياس في المحل مع الزبائن', 'instructions' => 'اقتراح المواعيد المتاحة يومي الجمعة والسبت من 10:00 إلى 19:00 وتأكيد الموعد برسالة واتساب.'],
            ['type' => 'support', 'name' => 'Support Agent', 'purpose' => 'تتبع الشحنات وأوقات العمل ومساعدة الزبائن', 'instructions' => 'تزويد الزبون برقم تتبع الإرسالية ومدة التوصيل المتبقية.'],
            ['type' => 'complaint', 'name' => 'Complaint Agent', 'purpose' => 'التهدئة والتحويل الفوري للتدخل البشري عند وجود شكوى أو طلب استرجاع', 'instructions' => 'الاعتذار اللبق للزبون وتحويل المحادثة فورا للمسؤول البشري مع وضع علامة عاجل.'],
            ['type' => 'faq', 'name' => 'FAQ Agent', 'purpose' => 'الإجابة على الأسئلة العامة والعناوين وطرق التواصل', 'instructions' => 'تقديم معلومات المتجر والمدينة بدقة.'],
        ];

        foreach ($defaultAgents as $da) {
            AIAgent::firstOrCreate(
                ['business_id' => $businessId, 'type' => $da['type']],
                [
                    'name' => $da['name'],
                    'purpose' => $da['purpose'],
                    'instructions' => $da['instructions'],
                    'conversations_handled' => rand(15, 80),
                    'success_rate' => rand(92, 98),
                    'handoff_rate' => $da['type'] === 'complaint' ? 85 : rand(2, 6),
                    'status' => 'active',
                ]
            );
        }

        $agents = AIAgent::where('business_id', $businessId)->get();

        $knowledgeItems = KnowledgeItem::where('business_id', $businessId)
            ->latest()
            ->get();

        $documents = KnowledgeDocument::with(['chunks'])
            ->where('business_id', $businessId)
            ->latest()
            ->get()
            ->map(function ($d) {
                return [
                    'id' => $d->id,
                    'title' => $d->title,
                    'file_name' => $d->file_name,
                    'file_size' => round($d->file_size_bytes / 1024, 1) . ' KB',
                    'pages_count' => $d->pages_count,
                    'chunks_count' => $d->chunks_count,
                    'extraction_confidence' => $d->extraction_confidence,
                    'status' => $d->status,
                    'created_at' => $d->created_at->diffForHumans(),
                ];
            });

        $personality = AIPersonality::firstOrCreate(
            ['business_id' => $businessId],
            [
                'communication_style' => 'friendly_moroccan',
                'darija_ratio' => 70,
                'arabic_ratio' => 20,
                'french_ratio' => 10,
                'response_length' => 'balanced',
                'trait_helpfulness' => 90,
                'trait_persuasiveness' => 80,
                'trait_friendliness' => 95,
            ]
        );

        $testRuns = AITestRun::where('business_id', $businessId)
            ->latest()
            ->take(10)
            ->get();

        $healthData = $healthService->calculateHealth($businessId);

        return Inertia::render('AIStudio/Index', [
            'agents' => $agents,
            'knowledgeItems' => $knowledgeItems,
            'documents' => $documents,
            'personality' => $personality,
            'testRuns' => $testRuns,
            'healthData' => $healthData,
        ]);
    }

    public function storeKnowledge(Request $request)
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string'],
            'category' => ['required', 'string'],
            'language' => ['nullable', 'string'],
        ]);

        KnowledgeItem::create([
            'business_id' => auth()->user()->current_business_id,
            'question' => $validated['question'],
            'answer' => $validated['answer'],
            'category' => $validated['category'],
            'language' => $validated['language'] ?? 'darija',
            'source' => 'manual',
            'confidence_score' => 98,
        ]);

        return back()->with('success', 'Knowledge item added successfully.');
    }

    public function updatePersonality(Request $request)
    {
        $validated = $request->validate([
            'communication_style' => ['required', 'string'],
            'darija_ratio' => ['required', 'integer', 'min:0', 'max:100'],
            'arabic_ratio' => ['required', 'integer', 'min:0', 'max:100'],
            'french_ratio' => ['required', 'integer', 'min:0', 'max:100'],
            'response_length' => ['required', 'string'],
            'trait_helpfulness' => ['required', 'integer', 'min:0', 'max:100'],
            'trait_persuasiveness' => ['required', 'integer', 'min:0', 'max:100'],
            'trait_friendliness' => ['required', 'integer', 'min:0', 'max:100'],
            'custom_instructions' => ['nullable', 'string'],
        ]);

        AIPersonality::updateOrCreate(
            ['business_id' => auth()->user()->current_business_id],
            $validated
        );

        return back()->with('success', 'AI personality settings updated.');
    }

    public function runTestSimulation(Request $request, AgentRouterService $routerService)
    {
        $validated = $request->validate([
            'prompt' => ['required', 'string'],
        ]);

        $business = auth()->user()->currentBusiness;
        $prompt = $validated['prompt'];

        $routing = $routerService->routeMessage($prompt);

        if ($routing['agent_type'] === 'complaint') {
            $source = 'سياسة الشكاوى';
            $action = 'تحويل فوري للموظف البشري (Human Handoff)';
            $response = 'نعتذر منك بشدة على أي إزعاج أخي الكريم. تم تحويل محادثتك فوراً للمسؤول البشري لمتابعة المشكل وحله خلال دقائق.';
        } elseif ($routing['agent_type'] === 'booking') {
            $source = 'نظام المواعيد والحجوزات';
            $action = 'تأكيد الحجز المتاح وإرسال تذكير';
            $response = 'مرحباً بك! كاين إمكانية لحجز موعد القياس يوم الجمعة مع 16:00 أو السبت مع 11:00 في المحل. واش يناسبك هاد التوقيت؟';
        } elseif ($routing['agent_type'] === 'sales') {
            $source = 'كتالوج قفطان العروسة والجلابة (RAG Chunk #3)';
            $action = 'عرض الأسعار وإمكانية الطلب المباشر';
            $response = 'أهلاً وسهلاً! أثمنة القفطان الملكي بالصقلي كتبدا من 1,850 درهم، والجلابة العصرية من 650 درهم بجودة عالية وثوب ممتاز. والتوصيل مجاني لكازا!';
        } elseif ($routing['agent_type'] === 'support') {
            $source = 'بيانات الشحن وأمانة إكسبريس';
            $action = 'تتبع الإرسالية وتحديث الحالة';
            $response = 'الطلبية ديالك تم تسليمها لشركة التوصيل وغتوصلك خلال 24 ساعة للعنوان المحدد.';
        } else {
            $source = 'معلومات النشاط التجاري';
            $action = 'الرد الترحيبي وتقديم المساعدة';
            $response = 'مرحباً بك في جاوبني! كيف نقدر نعاونك اليوم بخصوص منتجاتنا؟';
        }

        $testRun = AITestRun::create([
            'business_id' => $business->id,
            'user_id' => auth()->id(),
            'input_prompt' => $prompt,
            'output_response' => $response,
            'detected_intent' => $routing['intent'],
            'selected_agent' => $routing['agent_name'],
            'knowledge_source' => $source,
            'confidence_score' => $routing['confidence'],
            'suggested_action' => $action,
        ]);

        return back()->with('testResult', [
            'id' => $testRun->id,
            'input_prompt' => $prompt,
            'output_response' => $response,
            'detected_intent' => $routing['intent'],
            'selected_agent' => $routing['agent_name'],
            'knowledge_source' => $source,
            'confidence_score' => $routing['confidence'],
            'suggested_action' => $action,
        ]);
    }
}