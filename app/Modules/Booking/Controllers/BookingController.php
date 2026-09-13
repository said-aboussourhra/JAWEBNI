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
        $businessId = (string) auth()->user()->current_business_id;

        $bookings = Booking::with(['customer', 'service', 'staffMember'])
            ->where('business_id', $businessId)
            ->orderBy('booking_datetime', 'desc')
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'customer_name' => $b->customer?->name ?: 'زبون واتساب',
                    'customer_phone' => $b->customer?->phone ?: '',
                    'service_name' => $b->service?->name ?: 'جلسة قياس قفطان',
                    'service_price' => $b->service ? number_format((float) $b->service->price, 2).' MAD' : 'مجاني',
                    'staff_name' => $b->staffMember?->name ?: 'فريق المحل',
                    'datetime' => $b->booking_datetime?->format('Y-m-d H:i'),
                    'human_date' => $b->booking_datetime?->translatedFormat('l d F Y • H:i'),
                    'status' => $b->status,
                    'booked_via' => $b->booked_via,
                    'reminder_sent' => (bool) $b->reminder_sent,
                    'notes' => $b->notes,
                ];
            });

        return Inertia::render('Booking/Index', [
            'bookings' => $bookings,
            'services' => Service::where('business_id', $businessId)->get(),
            'staff' => StaffMember::where('business_id', $businessId)->get(),
            'customers' => Customer::where('business_id', $businessId)
                ->orderBy('name')
                ->limit(200)
                ->get(['id', 'name', 'phone']),
            'stats' => [
                'upcoming' => Booking::where('business_id', $businessId)
                    ->where('status', 'confirmed')
                    ->where('booking_datetime', '>=', now())
                    ->count(),
                'today' => Booking::where('business_id', $businessId)
                    ->whereDate('booking_datetime', today())
                    ->count(),
                'completed' => Booking::where('business_id', $businessId)->where('status', 'completed')->count(),
                'cancelled' => Booking::where('business_id', $businessId)->where('status', 'cancelled')->count(),
            ],
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

        $businessId = (string) auth()->user()->current_business_id;

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
            'booked_via' => $validated['booked_via'] ?? 'manual',
            'notes' => $validated['notes'] ?? null,
            'status' => 'confirmed',
        ]);

        return back()->with('success', 'تم تأكيد الموعد وإضافته لجدول المحل.');
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:confirmed,completed,cancelled'],
            'booking_datetime' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $booking = Booking::findOrFail($id);
        $booking->update(array_filter($validated, fn ($value) => $value !== null));

        return back()->with('success', 'تم تحديث حالة الموعد.');
    }

    public function destroy(string $id)
    {
        Booking::findOrFail($id)->delete();

        return back()->with('success', 'تم حذف الموعد.');
    }

    public function storeService(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'duration_minutes' => ['nullable', 'integer', 'min:5', 'max:600'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        Service::create([
            'business_id' => (string) auth()->user()->current_business_id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'] ?? 0,
            'duration_minutes' => $validated['duration_minutes'] ?? 30,
            'color' => $validated['color'] ?? '#0F9D8C',
            'is_active' => true,
        ]);

        return back()->with('success', 'تمت إضافة الخدمة بنجاح.');
    }

    public function storeStaff(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
            'role_title' => ['nullable', 'string'],
        ]);

        StaffMember::create([
            'business_id' => (string) auth()->user()->current_business_id,
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'role_title' => $validated['role_title'] ?? 'عضو الفريق',
            'is_active' => true,
        ]);

        return back()->with('success', 'تمت إضافة عضو الفريق بنجاح.');
    }
}
