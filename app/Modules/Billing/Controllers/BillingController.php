<?php

namespace App\Modules\Billing\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Billing\Models\BankTransferPayment;
use App\Modules\Billing\Models\Subscription;
use App\Modules\Billing\Models\SubscriptionPlan;
use App\Modules\Billing\Models\SuperAdminBankSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(): Response
    {
        $businessId = auth()->user()->current_business_id;

        $plans = SubscriptionPlan::all();
        $subscription = Subscription::with(['plan'])->where('business_id', $businessId)->first();
        $bankSettings = SuperAdminBankSetting::where('is_active', true)->first();
        $payments = BankTransferPayment::with(['plan'])
            ->where('business_id', $businessId)
            ->latest()
            ->get();

        return Inertia::render('Settings/Index', [
            'plans' => $plans,
            'subscription' => $subscription,
            'bankSettings' => $bankSettings,
            'payments' => $payments,
        ]);
    }

    public function submitBankTransfer(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => ['required', 'uuid', 'exists:subscription_plans,id'],
            'receipt' => ['nullable', 'file', 'mimes:jpg,png,pdf', 'max:10240'],
        ]);

        $businessId = auth()->user()->current_business_id;
        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store('payment_receipts/' . $businessId);
        }

        $payment = BankTransferPayment::create([
            'business_id' => $businessId,
            'plan_id' => $plan->id,
            'reference_code' => 'JW-' . strtoupper(Str::random(8)),
            'amount' => $plan->price_mad,
            'currency' => 'MAD',
            'receipt_file_path' => $receiptPath,
            'status' => 'pending_review',
        ]);

        return back()->with('success', 'Payment submitted for review. Reference: ' . $payment->reference_code);
    }
}