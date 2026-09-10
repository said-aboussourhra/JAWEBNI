<?php

namespace App\Modules\Billing\Models;

use App\Core\Traits\BelongsToTenant;
use App\Models\User;
use App\Modules\Tenancy\Models\Business;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankTransferPayment extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'plan_id',
        'reference_code',
        'amount',
        'currency',
        'receipt_file_path',
        'status',
        'admin_notes',
        'reviewed_by_user_id',
        'reviewed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'reviewed_at' => 'datetime',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }

    public function reviewedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }
}