<?php

namespace App\Modules\Agents\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Agents\Models\AIAgent;
use App\Modules\Agents\Models\AgentExecutionLog;
use App\Modules\Agents\Services\AgentRouterService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AgentControlRoomController extends Controller
{
    /**
     * Agent control room: the 5 specialised agents of the AI employee.
     */
    public function index(): Response
    {
        $businessId = (string) auth()->user()->current_business_id;

        $defaults = [
            ['type' => 'sales', 'name' => 'Sales Agent', 'purpose' => 'تحويل الاستفسارات إلى مبيعات مؤكدة واقتراح المقاسات وروابط الدفع', 'instructions' => 'الترحيب الحار بالدارجة المغربية، عرض الأسعار من الكتالوج، واقتراح تأكيد الطلبية فورا مع الدفع عند الاستلام.'],
            ['type' => 'booking', 'name' => 'Booking Agent', 'purpose' => 'حجز وإدارة مواعيد القياس في المحل مع الزبائن', 'instructions' => 'اقتراح المواعيد المتاحة يومي الجمعة والسبت من 10:00 إلى 19:00 وتأكيد الموعد برسالة واتساب.'],
            ['type' => 'support', 'name' => 'Support Agent', 'purpose' => 'تتبع الشحنات وأوقات العمل ومساعدة الزبائن', 'instructions' => 'تزويد الزبون برقم تتبع الإرسالية ومدة التوصيل المتبقية.'],
            ['type' => 'complaint', 'name' => 'Complaint Agent', 'purpose' => 'التهدئة والتحويل الفوري للتدخل البشري عند وجود شكوى أو طلب استرجاع', 'instructions' => 'الاعتذار اللبق للزبون وتحويل المحادثة فورا للمسؤول البشري مع وضع علامة عاجل.'],
            ['type' => 'faq', 'name' => 'FAQ Agent', 'purpose' => 'الإجابة على الأسئلة العامة والعناوين وطرق التواصل', 'instructions' => 'تقديم معلومات المتجر والمدينة بدقة.'],
        ];

        foreach ($defaults as $agent) {
            AIAgent::firstOrCreate(
                ['business_id' => $businessId, 'type' => $agent['type']],
                $agent + ['status' => 'active', 'conversations_handled' => 0, 'success_rate' => 95, 'handoff_rate' => 5]
            );
        }

        $agents = AIAgent::where('business_id', $businessId)
            ->get()
            ->map(fn ($agent) => [
                'id' => $agent->id,
                'type' => $agent->type,
                'name' => $agent->name,
                'purpose' => $agent->purpose,
                'instructions' => $agent->instructions,
                'status' => $agent->status,
                'conversations_handled' => $agent->conversations_handled,
                'success_rate' => $agent->success_rate,
                'handoff_rate' => $agent->handoff_rate,
            ]);

        $recentExecutions = AgentExecutionLog::with('agent')
            ->where('business_id', $businessId)
            ->latest()
            ->take(15)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'agent_name' => $log->agent?->name ?? 'AI Agent',
                'intent' => $log->detected_intent,
                'confidence' => $log->confidence_score,
                'latency_ms' => $log->latency_ms,
                'handoff' => (bool) $log->handoff_triggered,
                'created_at' => $log->created_at?->diffForHumans(),
            ]);

        return Inertia::render('Agents/Index', [
            'agents' => $agents,
            'recentExecutions' => $recentExecutions,
        ]);
    }

    public function updateAgent(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'purpose' => ['nullable', 'string'],
            'instructions' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:active,paused,disabled'],
        ]);

        $agent = AIAgent::findOrFail($id);
        $agent->update(array_filter($validated, fn ($value) => $value !== null));

        return back()->with('success', 'تم تحديث إعدادات الوكيل الذكي بنجاح.');
    }

    /**
     * Dry-run the intent router without sending anything to a customer.
     */
    public function simulate(Request $request, AgentRouterService $router)
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        return back()->with('simulation', $router->routeMessage($validated['message']));
    }
}
