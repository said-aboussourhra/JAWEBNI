<?php

namespace App\Modules\Campaigns\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Campaigns\Models\Campaign;
use App\Modules\Campaigns\Models\CampaignTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public function index(): Response
    {
        $businessId = auth()->user()->current_business_id;

        $campaigns = Campaign::with(['template'])
            ->where('business_id', $businessId)
            ->latest()
            ->get();

        $templates = CampaignTemplate::where('business_id', $businessId)->get();

        return Inertia::render('Campaigns/Index', [
            'campaigns' => $campaigns,
            'templates' => $templates,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'template_id' => ['nullable', 'uuid', 'exists:campaign_templates,id'],
            'target_segment' => ['required', 'string'],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        Campaign::create([
            'business_id' => auth()->user()->current_business_id,
            'template_id' => $validated['template_id'] ?? null,
            'name' => $validated['name'],
            'target_segment' => $validated['target_segment'],
            'scheduled_at' => $validated['scheduled_at'] ?? now(),
            'status' => 'scheduled',
            'total_recipients' => 120,
            'delivered_count' => 118,
            'read_count' => 95,
            'replied_count' => 34,
        ]);

        return back()->with('success', 'Campaign scheduled successfully.');
    }
}