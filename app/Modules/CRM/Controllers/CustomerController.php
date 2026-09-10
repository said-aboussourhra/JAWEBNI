<?php

namespace App\Modules\CRM\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\Customer;
use App\Modules\CRM\Models\CustomerNote;
use App\Modules\CRM\Models\CustomerOrder;
use App\Modules\CRM\Models\CustomerTag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $businessId = auth()->user()->current_business_id;

        $customers = Customer::where('business_id', $businessId)
            ->latest()
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->name ?: 'زبون واتساب',
                    'phone' => $c->phone,
                    'city' => $c->city ?: 'Casablanca',
                    'lead_score' => $c->lead_score,
                    'lifetime_value' => number_format($c->lifetime_value, 2) . ' MAD',
                    'total_orders' => $c->total_orders,
                    'tags' => $c->tags ?? ['VIP', 'Casablanca'],
                    'ai_memory' => $c->ai_memory ?? [
                        'preferred_size' => 'Taille 38 (M)',
                        'favorite_color' => 'Vert Émeraude',
                        'notes' => 'الزبونة تفضل القفطان التقليدي بالصقلي الحر',
                    ],
                    'last_seen' => $c->last_seen_at ? $c->last_seen_at->diffForHumans() : 'منذ قليل',
                ];
            });

        $tags = CustomerTag::where('business_id', $businessId)->get();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'tags' => $tags,
        ]);
    }

    public function updateMemory(Request $request, string $id)
    {
        $validated = $request->validate([
            'ai_memory' => ['required', 'array'],
        ]);

        $customer = Customer::findOrFail($id);
        $customer->update(['ai_memory' => $validated['ai_memory']]);

        return back()->with('success', 'Customer AI memory updated.');
    }

    public function addNote(Request $request, string $id)
    {
        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $customer = Customer::findOrFail($id);

        CustomerNote::create([
            'business_id' => auth()->user()->current_business_id,
            'customer_id' => $customer->id,
            'user_id' => auth()->id(),
            'content' => $validated['content'],
            'type' => 'staff',
        ]);

        return back()->with('success', 'Note added to customer dossier.');
    }
}