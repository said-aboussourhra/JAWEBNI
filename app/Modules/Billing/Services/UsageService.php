<?php

namespace App\Modules\Billing\Services;

use App\Modules\Billing\Models\Subscription;
use App\Modules\Billing\Models\SubscriptionPlan;
use App\Modules\WhatsAppBot\Models\Message;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * Tracks plan limits and monthly AI message consumption per tenant.
 */
class UsageService
{
    public function activeSubscription(string $businessId): ?Subscription
    {
        return Subscription::where('business_id', $businessId)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->latest('starts_at')
            ->first();
    }

    public function hasActiveSubscription(string $businessId): bool
    {
        return Cache::remember("subscription:active:{$businessId}", 60, function () use ($businessId) {
            return $this->activeSubscription($businessId) !== null;
        });
    }

    public function plan(string $businessId): ?SubscriptionPlan
    {
        return $this->activeSubscription($businessId)?->plan;
    }

    public function periodStart(string $businessId): Carbon
    {
        $subscription = $this->activeSubscription($businessId);

        if ($subscription && $subscription->starts_at) {
            $start = $subscription->starts_at->copy();

            // Roll the billing anchor forward to the current cycle.
            while ($start->copy()->addMonth()->lessThanOrEqualTo(now())) {
                $start->addMonth();
            }

            return $start->startOfDay();
        }

        return now()->startOfMonth();
    }

    public function limit(string $businessId): int
    {
        $plan = $this->plan($businessId);

        return $plan ? (int) $plan->messages_limit : 0;
    }

    public function messagesUsed(string $businessId): int
    {
        return (int) Cache::remember("usage:{$businessId}:".$this->periodStart($businessId)->format('Y-m-d'), 60, function () use ($businessId) {
            return Message::where('business_id', $businessId)
                ->where('sender_type', 'ai')
                ->where('created_at', '>=', $this->periodStart($businessId))
                ->count();
        });
    }

    public function remaining(string $businessId): int
    {
        return max(0, $this->limit($businessId) - $this->messagesUsed($businessId));
    }

    public function hasQuota(string $businessId): bool
    {
        if (! $this->hasActiveSubscription($businessId)) {
            return false;
        }

        return $this->remaining($businessId) > 0;
    }

    public function increment(string $businessId, int $by = 1): void
    {
        $key = "usage:{$businessId}:".$this->periodStart($businessId)->format('Y-m-d');

        if (Cache::has($key)) {
            Cache::increment($key, $by);
        }
    }

    public function summary(string $businessId): array
    {
        $limit = $this->limit($businessId);
        $used = $this->messagesUsed($businessId);

        return [
            'plan' => $this->plan($businessId)?->name,
            'limit' => $limit,
            'used' => $used,
            'remaining' => max(0, $limit - $used),
            'percentage' => $limit > 0 ? (int) round(($used / $limit) * 100) : 0,
            'period_start' => $this->periodStart($businessId)->toDateString(),
            'active' => $this->hasActiveSubscription($businessId),
        ];
    }
}
