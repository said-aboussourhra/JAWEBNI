<?php

namespace App\Modules\Tenancy\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Billing\Models\BankTransferPayment;
use App\Modules\Billing\Models\Subscription;
use App\Modules\Billing\Models\SuperAdminBankSetting;
use App\Modules\Tenancy\Models\Business;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    public function index(): Response
    {
        $businesses = Business::withCount('users')->latest()->get();
        $pendingPayments = BankTransferPayment::with(['plan', 'business'])
            ->where('status', 'pending_review')
            ->latest()
            ->get();
        $allPayments = BankTransferPayment::with(['plan', 'business'])->latest()->take(20)->get();
        $bankSettings = SuperAdminBankSetting::first();

        return Inertia::render('Admin/Index', [
            'businesses' => $businesses,
            'pendingPayments' => $pendingPayments,
            'allPayments' => $allPayments,
            'bankSettings' => $bankSettings,
        ]);
    }

    public function approvePayment(Request $request, string $id)
    {
        $payment = BankTransferPayment::findOrFail($id);
        $payment->update([
            'status' => 'approved',
            'reviewed_by_user_id' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        // Activate or extend business subscription
        Subscription::updateOrCreate(
            ['business_id' => $payment->business_id],
            [
                'plan_id' => $payment->plan_id,
                'status' => 'active',
                'starts_at' => now(),
                'ends_at' => now()->addMonth(),
            ]
        );

        return back()->with('success', 'Payment approved and subscription activated automatically.');
    }

    public function rejectPayment(Request $request, string $id)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string'],
        ]);

        $payment = BankTransferPayment::findOrFail($id);
        $payment->update([
            'status' => 'rejected',
            'admin_notes' => $validated['reason'],
            'reviewed_by_user_id' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Payment rejected with notes recorded.');
    }

    public function updateBankSettings(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => ['required', 'string'],
            'account_holder' => ['required', 'string'],
            'rib' => ['required', 'string'],
            'iban' => ['required', 'string'],
            'swift_bic' => ['nullable', 'string'],
            'instructions' => ['nullable', 'string'],
        ]);

        SuperAdminBankSetting::updateOrCreate([], $validated);

        return back()->with('success', 'Bank information updated securely.');
    }
}