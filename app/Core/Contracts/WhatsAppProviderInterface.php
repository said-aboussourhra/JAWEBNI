<?php

namespace App\Core\Contracts;

interface WhatsAppProviderInterface
{
    public function sendTextMessage(string $to, string $message, array $options = []): array;
    public function sendTemplateMessage(string $to, string $templateName, string $languageCode, array $components = []): array;
    public function sendMediaMessage(string $to, string $mediaType, string $mediaUrl, ?string $caption = null): array;
}
