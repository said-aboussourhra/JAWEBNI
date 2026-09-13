<?php

namespace App\Jobs;

use App\Core\Tenancy\TenantManager;
use App\Modules\Booking\Models\Booking;
use App\Modules\WhatsAppBot\Services\WhatsAppDeliveryService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Sends the automatic WhatsApp reminder 24h before an appointment.
 */
class SendBookingReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(
        public string $businessId,
        public string $bookingId
    ) {
    }

    public function handle(TenantManager $tenantManager, WhatsAppDeliveryService $delivery): void
    {
        $tenantManager->setTenant($this->businessId);

        $booking = Booking::withoutTenantScope()->with(['customer', 'service', 'staffMember'])->find($this->bookingId);

        if (! $booking || ! $booking->customer) {
            $tenantManager->forget();

            return;
        }

        try {
            $message = $this->message($booking);
            $account = $delivery->resolveAccount($this->businessId);
            $provider = $delivery->provider($account);

            $sent = false;

            if ($provider) {
                $response = $provider->sendTextMessage((string) $booking->customer->phone, $message);
                $sent = (bool) ($response['success'] ?? false);
            }

            $booking->update(['reminder_sent' => $sent]);

            Log::info('Booking reminder processed', [
                'booking_id' => $booking->id,
                'sent' => $sent,
            ]);
        } catch (\Throwable $e) {
            Log::error('Booking reminder failed: '.$e->getMessage());
            $this->fail($e);
        } finally {
            $tenantManager->forget();
        }
    }

    protected function message(Booking $booking): string
    {
        $when = $booking->booking_datetime?->translatedFormat('l d F Y • H:i') ?? '';
        $service = $booking->service?->name ?? 'الموعد';
        $staff = $booking->staffMember?->name ?? 'فريقنا';

        return "تذكير لطيف من جاوبني 🌸\n"
            ."عندك موعد: {$service}\n"
            ."التاريخ: {$when}\n"
            ."مع: {$staff}\n"
            ."إذا بغيتي تأجلي ولا تلغي الموعد، جاوب على هاد الرسالة.";
    }
}
