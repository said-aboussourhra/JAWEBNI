<?php

namespace App\Modules\WhatsAppBot\Services;

use App\Modules\WhatsAppBot\Models\Conversation;
use App\Modules\WhatsAppBot\Models\WhatsAppAccount;
use Illuminate\Support\Facades\Log;

/**
 * Single entry point for outbound WhatsApp traffic.
 *
 * It resolves the tenant's connected Meta Cloud account, builds the provider
 * and safely degrades to a "skipped" result when credentials are missing or
 * mocked (local development, CI, demo mode).
 */
class WhatsAppDeliveryService
{
    public function resolveAccount(string $businessId, ?string $accountId = null): ?WhatsAppAccount
    {
        $query = WhatsAppAccount::withoutTenantScope()
            ->where('business_id', $businessId)
            ->where('status', 'connected');

        if ($accountId) {
            $account = (clone $query)->where('id', $accountId)->first();

            if ($account) {
                return $account;
            }
        }

        return $query->first();
    }

    public function provider(?WhatsAppAccount $account): ?MetaCloudProvider
    {
        if (! $account || $this->isDisabled($account)) {
            return null;
        }

        return new MetaCloudProvider(
            (string) $account->phone_number_id,
            (string) $account->access_token,
            (string) config('services.whatsapp.api_version', 'v20.0')
        );
    }

    public function isDisabled(?WhatsAppAccount $account): bool
    {
        if (! $account) {
            return true;
        }

        if (app()->runningUnitTests()) {
            return true;
        }

        $token = (string) $account->access_token;

        return $token === '' || str_contains($token, 'MOCK');
    }

    /**
     * Send a free-form text message inside an existing conversation.
     *
     * @return array{success: bool, reason?: string, response?: array}
     */
    public function sendText(Conversation $conversation, string $body, ?string $accountId = null): array
    {
        $phone = $conversation->customer?->phone;

        if (empty($phone)) {
            return ['success' => false, 'reason' => 'missing_phone'];
        }

        $account = $this->resolveAccount((string) $conversation->business_id, $accountId ?? $conversation->whatsapp_account_id);

        if (! $account) {
            return ['success' => false, 'reason' => 'no_whatsapp_account'];
        }

        if ($this->isDisabled($account)) {
            return ['success' => false, 'reason' => 'delivery_disabled'];
        }

        try {
            $response = $this->provider($account)?->sendTextMessage($phone, $body) ?? ['success' => false];

            return [
                'success' => (bool) ($response['success'] ?? false),
                'reason' => ($response['success'] ?? false) ? null : 'api_error',
                'response' => $response,
            ];
        } catch (\Throwable $e) {
            Log::error('WhatsApp delivery failed: '.$e->getMessage());

            return ['success' => false, 'reason' => 'exception'];
        }
    }
}
