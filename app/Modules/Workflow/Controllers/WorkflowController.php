<?php

namespace App\Modules\Workflow\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Workflow\Models\Workflow;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkflowController extends Controller
{
    public function index(): Response
    {
        $businessId = auth()->user()->current_business_id;

        $workflows = Workflow::where('business_id', $businessId)
            ->latest()
            ->get();

        return Inertia::render('Automation/Index', [
            'workflows' => $workflows,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'trigger_type' => ['required', 'string'],
            'nodes' => ['nullable', 'array'],
            'edges' => ['nullable', 'array'],
        ]);

        Workflow::create([
            'business_id' => auth()->user()->current_business_id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'trigger_type' => $validated['trigger_type'],
            'nodes' => $validated['nodes'] ?? [],
            'edges' => $validated['edges'] ?? [],
            'is_active' => true,
        ]);

        return back()->with('success', 'Workflow automation created.');
    }
}