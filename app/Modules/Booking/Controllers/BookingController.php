<?php

namespace App\Modules\Booking\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Booking\Models\Booking;
use App\Modules\Booking\Models\Service;
use App\Modules\Booking\Models\StaffMember;
use App\Modules\CRM\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(): Response
    {
        $businessId = auth()->user()->current_business_id;

        $bookings = Booking::with(['customer', 'service', 'staffMember'])
            ->where('business_id', $businessId)
            ->orderBy('booking_datetime', 'desc')
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'customer_name' => $b->customer ? $b->customer->name : 'زبون واتساب',
                    'customer_phone' => $b->customer ? $b->customer->phone : '',
                    'service_name' => $b->service ? $b->service->name : 'جلسة قياس قفطان',
                    'service_price' => $b->service ? $b->service->price . ' MAD' : 'مجاني',
                    'staff_name' => $b->staffMember ? $b->staffMember->name : 'سارة (Styliste)',
                    'datetime' => $b->booking_datetime->format('Y-m-d H:i'),
                    'status' => $b->status,
                    'booked_via' => $b->booked_via,
                    'reminder_sent' => $b->reminder_sent,
                ];
            });

        $services = Service::where('business_id', $businessId)->get();
        $staff = StaffMember::where('business_id', $businessId)->get();

        return Inertia::render('Booking/Index', [
            'bookings' => $bookings,
            'services' => $services,
            'staff' => $staff,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string'],
            'customer_phone' => ['required', 'string'],
            'service_id' => ['nullable', 'uuid', 'exists:services,id'],
            'staff_member_id' => ['nullable', 'uuid', 'exists:staff_members,id'],
            'booking_datetime' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $businessId = auth()->user()->current_business_id;

        $customer = Customer::firstOrCreate(
            ['business_id' => $businessId, 'phone' => $validated['customer_phone']],
            ['name' => $validated['customer_name'], 'city' => 'Casablanca']
        );

        Booking::create([
            'business_id' => $businessId,
            'customer_id' => $customer->id,
            'service_id' => $validated['service_id'] ?? null,
            'staff_member_id' => $validated['staff_member_id'] ?? null,
            'booking_datetime' => $validated['booking_datetime'],
            'booked_via' => 'manual',
            'notes' => $validated['notes'] ?? null,
            'status' => 'confirmed',
        ]);

        return back()->with('success', 'Booking confirmed.');
    }
}