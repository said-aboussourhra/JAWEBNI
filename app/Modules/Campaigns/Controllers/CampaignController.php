<?php

namespace App\Modules\Campaigns\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\SendCampaign;
use App\Modules\Campaigns\Models\Campaign;
use App\Modules\Campaigns\Models\CampaignTemplate;
use App\Modules\CRM\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public function index(): Response
    {
        $businessId = (string) auth()->user()->current_business_id;

        $campaigns = Campaign::with(['template'])
            ->where('business_id', $businessId)
            ->latest()
            ->get()
            ->map(fn ($campaign) => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'target_segment' => $campaign->target_segment,
                'status' => $campaign->status,
                'scheduled_at' => $campaign->scheduled_at?->format('Y-m-d H:i'),
                'template_name' => $campaign->template?->name,
                'total_recipients' => (int) $campaign->total_recipients,
                'delivered_count' => (int) $campaign->delivered_count,
                'read_count' => (int) $campaign->read_count,
                'replied_count' => (int) $campaign->replied_count,
                'conversion_rate' => $campaign->delivered_count > 0
                    ? round(($campaign->replied_count / $campaign->delivered_count) * 100, 1)
                    : 0,
                'created_at' => $campaign->created_at?->diffForHumans(),
            ]);

        return Inertia::render('Campaigns/Index', [
            'campaigns' => $campaigns,
            'templates' => CampaignTemplate::where('business_id', $businessId)->latest()->get(),
            'segments' => $this->segments($businessId),
            'stats' => [
                'sent' => Campaign::where('business_id', $businessId)->whereIn('status', ['completed', 'sending'])->count(),
                'scheduled' => Campaign::where('business_id', $businessId)->where('status', 'scheduled')->count(),
                'reached' => (int) Campaign::where('business_id', $businessId)->sum('delivered_count'),
                'replies' => (int) Campaign::where('business_id', $businessId)->sum('replied_count'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'template_id' => ['nullable', 'uuid', 'exists:campaign_templates,id'],
            'target_segment' => ['required', 'string', 'in:all_customers,vip_customers,recent_customers,inactive_customers,casablanca'],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        $businessId = (string) auth()->user()->current_business_id;

        $campaign = Campaign::create([
            'business_id' => $businessId,
            'template_id' => $validated['template_id'] ?? null,
            'name' => $validated['name'],
            'target_segment' => $validated['target_segment'],
            'scheduled_at' => $validated['scheduled_at'] ?? now(),
            'status' => 'scheduled',
            'total_recipients' => $this->segments($businessId)[$validated['target_segment']]['count'] ?? 0,
        ]);

        return back()->with('success', 'تم إنشاء الحملة. اضغط "إطلاق" لإرسالها عبر واتساب.');
    }

    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'whatsapp_template_name' => ['required', 'string', 'max:255'],
            'language' => ['nullable', 'string', 'max:10'],
            'category' => ['nullable', 'string', 'max:50'],
            'body_text' => ['required', 'string'],
        ]);

        CampaignTemplate::create([
            'business_id' => (string) auth()->user()->current_business_id,
            'name' => $validated['name'],
            'whatsapp_template_name' => $validated['whatsapp_template_name'],
            'language' => $validated['language'] ?? 'ar',
            'category' => $validated['category'] ?? 'marketing',
            'body_text' => $validated['body_text'],
            'status' => 'approved',
        ]);

        return back()->with('success', 'تم حفظ القالب التسويقي.');
    }

    public function launch(string $id)
    {
        $campaign = Campaign::findOrFail($id);

        SendCampaign::dispatch((string) $campaign->business_id, (string) $campaign->id);

        return back()->with('success', 'تم إطلاق الحملة وستُرسل الرسائل عبر واتساب تدريجياً.');
    }

    public function destroy(string $id)
    {
        Campaign::findOrFail($id)->delete();

        return back()->with('success', 'تم حذف الحملة.');
    }

    protected function segments(string $businessId): array
    {
        $base = Customer::where('business_id', $businessId);

        return [
            'all_customers' => [
                'key' => 'all_customers',
                'label' => 'كل الزبناء',
                'count' => (clone $base)->count(),
            ],
            'vip_customers' => [
                'key' => 'vip_customers',
                'label' => 'الزبناء المميزون (VIP)',
                'count' => (clone $base)->where('lead_score', '>=', 70)->count(),
            ],
            'recent_customers' => [
                'key' => 'recent_customers',
                'label' => 'الزبناء الجدد (30 يوم)',
                'count' => (clone $base)->where('last_seen_at', '>=', now()->subDays(30))->count(),
            ],
            'inactive_customers' => [
                'key' => 'inactive_customers',
                'label' => 'الزبناء غير النشطين',
                'count' => (clone $base)->where(function ($q) {
                    $q->whereNull('last_seen_at')->orWhere('last_seen_at', '<', now()->subDays(60));
                })->count(),
            ],
            'casablanca' => [
                'key' => 'casablanca',
                'label' => 'زبناء الدار البيضاء',
                'count' => (clone $base)->where('city', 'Casablanca')->count(),
            ],
        ];
    }
}
