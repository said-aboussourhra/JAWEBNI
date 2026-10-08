<?php

namespace App\Console\Commands;

use App\Jobs\SendBookingReminder;
use App\Modules\Booking\Models\Booking;
use Illuminate\Console\Command;

class DispatchBookingReminders extends Command
{
    protected $signature = 'jawebni:booking-reminders {--hours=24 : How many hours before the appointment}';

    protected $description = 'Queue WhatsApp reminders for upcoming confirmed bookings';

    public function handle(): int
    {
        $hours = (int) $this->option('hours');

        $bookings = Booking::withoutTenantScope()
            ->with('customer')
            ->where('status', 'confirmed')
            ->where('reminder_sent', false)
            ->whereBetween('booking_datetime', [now()->addHours($hours - 1), now()->addHours($hours + 1)])
            ->get();

        foreach ($bookings as $booking) {
            SendBookingReminder::dispatch((string) $booking->business_id, (string) $booking->id);
        }

        $this->info('Queued '.$bookings->count().' booking reminder(s).');

        return self::SUCCESS;
    }
}
