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
        $businessId = (string) auth()->user()->current_business_id;

        $workflows = Workflow::where('business_id', $businessId)
            ->latest()
            ->get()
            ->map(fn ($workflow) => [
                'id' => $workflow->id,
                'name' => $workflow->name,
                'description' => $workflow->description,
                'trigger_type' => $workflow->trigger_type,
                'is_active' => (bool) $workflow->is_active,
                'execution_count' => (int) $workflow->execution_count,
                'nodes' => $workflow->nodes ?? [],
                'edges' => $workflow->edges ?? [],
            ]);

        return Inertia::render('Automation/Index', [
            'workflows' => $workflows,
            'triggers' => [
                ['key' => 'purchase_intent', 'label' => 'نية شراء مرتفعة'],
                ['key' => 'booking_created', 'label' => 'إنشاء موعد جديد'],
                ['key' => 'new_customer', 'label' => 'زبون جديد'],
                ['key' => 'abandoned_cart', 'label' => 'سلة متروكة'],
                ['key' => 'complaint', 'label' => 'شكوى أو استرجاع'],
                ['key' => 'inactive_7d', 'label' => 'زبون صامت منذ 7 أيام'],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'trigger_type' => ['required', 'string'],
            'nodes' => ['nullable', 'array'],
            'edges' => ['nullable', 'array'],
        ]);

        Workflow::create([
            'business_id' => (string) auth()->user()->current_business_id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'trigger_type' => $validated['trigger_type'],
            'nodes' => $validated['nodes'] ?? [],
            'edges' => $validated['edges'] ?? [],
            'is_active' => true,
        ]);

        return back()->with('success', 'تم إنشاء مسار الأتمتة.');
    }

    public function toggle(string $id)
    {
        $workflow = Workflow::findOrFail($id);
        $workflow->update(['is_active' => ! $workflow->is_active]);

        return back()->with('success', $workflow->is_active ? 'تم تفعيل المسار.' : 'تم إيقاف المسار.');
    }

    public function destroy(string $id)
    {
        Workflow::findOrFail($id)->delete();

        return back()->with('success', 'تم حذف مسار الأتمتة.');
    }
}
