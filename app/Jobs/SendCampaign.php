<?php

namespace App\Jobs;

use App\Core\Tenancy\TenantManager;
use App\Modules\Campaigns\Models\Campaign;
use App\Modules\CRM\Models\Customer;
use App\Modules\WhatsAppBot\Models\WhatsAppAccount;
use App\Modules\WhatsAppBot\Services\WhatsAppDeliveryService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Sends a WhatsApp campaign to the targeted customer segment.
 */
class SendCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public int $timeout = 600;

    public function __construct(
        public string $businessId,
        public string $campaignId
    ) {
    }

    public function handle(TenantManager $tenantManager, WhatsAppDeliveryService $delivery): void
    {
        $tenantManager->setTenant($this->businessId);

        $campaign = Campaign::withoutTenantScope()->find($this->campaignId);

        if (! $campaign) {
            $tenantManager->forget();

            return;
        }

        try {
            $recipients = $this->recipients($campaign);
            $account = WhatsAppAccount::withoutTenantScope()
                ->where('business_id', $this->businessId)
                ->where('status', 'connected')
                ->first();

            $campaign->update([
                'status' => 'sending',
                'total_recipients' => $recipients->count(),
            ]);

            $delivered = 0;
            $provider = $delivery->provider($account);

            if (! $provider) {
                Log::info('Campaign sending skipped: no live WhatsApp account connected.', [
                    'campaign_id' => $campaign->id,
                ]);

                $campaign->update([
                    'status' => 'scheduled',
                    'delivered_count' => 0,
                ]);

                return;
            }

            foreach ($recipients as $customer) {
                $body = $this->renderBody($campaign, $customer);

                $response = $campaign->template
                    ? $provider->sendTemplateMessage(
                        (string) $customer->phone,
                        (string) $campaign->template->whatsapp_template_name,
                        $campaign->template->language ?: 'ar',
                        $this->templateComponents($campaign, $customer)
                      )
                    : $provider->sendTextMessage((string) $customer->phone, $body);

                if (! empty($response['success'])) {
                    $delivered++;
                }
            }

            $campaign->update([
                'status' => 'completed',
                'delivered_count' => $delivered,
                'read_count' => 0,
                'replied_count' => 0,
            ]);
        } catch (\Throwable $e) {
            Log::error('Campaign sending failed: '.$e->getMessage());

            $campaign->update(['status' => 'failed']);

            $this->fail($e);
        } finally {
            $tenantManager->forget();
        }
    }

    protected function recipients(Campaign $campaign)
    {
        $query = Customer::withoutTenantScope()->where('business_id', $this->businessId);

        switch ($campaign->target_segment) {
            case 'vip_customers':
                $query->where('lead_score', '>=', 70);
                break;
            case 'all_customers':
                break;
            case 'recent_customers':
                $query->where('last_seen_at', '>=', now()->subDays(30));
                break;
            case 'inactive_customers':
                $query->where(function ($q) {
                    $q->whereNull('last_seen_at')->orWhere('last_seen_at', '<', now()->subDays(60));
                });
                break;
            case 'casablanca':
                $query->where('city', 'Casablanca');
                break;
        }

        return $query->get();
    }

    protected function renderBody(Campaign $campaign, Customer $customer): string
    {
        $body = (string) ($campaign->template->body_text ?? '');

        return str_replace(['{{1}}', '{name}'], [$customer->name, $customer->name], $body);
    }

    protected function templateComponents(Campaign $campaign, Customer $customer): array
    {
        return [
            [
                'type' => 'body',
                'parameters' => [
                    ['type' => 'text', 'text' => (string) $customer->name],
                ],
            ],
        ];
    }

}
