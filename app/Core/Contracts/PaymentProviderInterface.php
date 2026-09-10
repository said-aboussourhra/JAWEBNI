<?php

namespace App\Core\Contracts;

interface PaymentProviderInterface
{
    public function processPayment(array $payload): array;
    public function verifyPayment(string $reference): array;
}
