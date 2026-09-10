<?php

namespace App\Modules\Business\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Tenancy\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function show(): Response
    {
        $business = auth()->user()->currentBusiness;

        return Inertia::render('Onboarding/Index', [
            'business' => $business,
        ]);
    }

    public function saveStep(Request $request)
    {
        $validated = $request->validate([
            'step' => ['required', 'integer', 'min:1', 'max:5'],
            'data' => ['required', 'array'],
            'ai_readiness_score' => ['required', 'integer', 'min:0', 'max:100'],
            'completed' => ['nullable', 'boolean'],
        ]);

        $business = auth()->user()->currentBusiness;
        $mergedData = array_merge($business->onboarding_data ?? [], $validated['data']);

        $business->update([
            'onboarding_step' => $validated['step'],
            'onboarding_data' => $mergedData,
            'ai_readiness_score' => $validated['ai_readiness_score'],
            'onboarding_completed' => $validated['completed'] ?? ($validated['step'] >= 5),
        ]);

        AuditLog::create([
            'business_id' => $business->id,
            'user_id' => auth()->id(),
            'action' => 'onboarding_step_' . $validated['step'] . '_saved',
            'payload' => $validated['data'],
        ]);

        return back()->with('success', 'Step saved successfully.');
    }
}
