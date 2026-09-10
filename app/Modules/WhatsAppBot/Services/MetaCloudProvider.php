<?php

namespace App\Modules\WhatsAppBot\Services;

use App\Core\Contracts\WhatsAppProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaCloudProvider implements WhatsAppProviderInterface
{
    protected string $phoneNumberId;
    protected string $accessToken;
    protected string $apiVersion;

    public function __construct(string $phoneNumberId = '', string $accessToken = '', string $apiVersion = 'v20.0')
    {
        $this->phoneNumberId = $phoneNumberId ?: (string) config('services.whatsapp.phone_number_id', '');
        $this->accessToken = $accessToken ?: (string) config('services.whatsapp.access_token', '');
        $this->apiVersion = $apiVersion;
    }

    public function sendTextMessage(string $to, string $message, array $options = []): array
    {
        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $this->cleanPhoneNumber($to),
            'type' => 'text',
            'text' => [
                'preview_url' => $options['preview_url'] ?? false,
                'body' => $message,
            ],
        ];

        return $this->executeRequest($payload);
    }

    public function sendTemplateMessage(string $to, string $templateName, string $languageCode, array $components = []): array
    {
        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $this->cleanPhoneNumber($to),
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => [
                    'code' => $languageCode,
                ],
                'components' => $components,
            ],
        ];

        return $this->executeRequest($payload);
    }

    public function sendMediaMessage(string $to, string $mediaType, string $mediaUrl, ?string $caption = null): array
    {
        $mediaData = ['link' => $mediaUrl];
        if ($caption && in_array($mediaType, ['image', 'document', 'video'])) {
            $mediaData['caption'] = $caption;
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $this->cleanPhoneNumber($to),
            'type' => $mediaType,
            $mediaType => $mediaData,
        ];

        return $this->executeRequest($payload);
    }

    protected function executeRequest(array $payload): array
    {
        $url = "https://graph.facebook.com/{$this->apiVersion}/{$this->phoneNumberId}/messages";

        try {
            $response = Http::withToken($this->accessToken)
                ->timeout(10)
                ->post($url, $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            Log::error('Meta WhatsApp API Error', [
                'status' => $response->status(),
                'body' => $response->json(),
                'payload' => $payload,
            ]);

            return [
                'success' => false,
                'error' => $response->json(),
                'status' => $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('Meta WhatsApp Connection Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    protected function cleanPhoneNumber(string $phone): string
    {
        return preg_replace('/[^0-9]/', '', $phone);
    }
}