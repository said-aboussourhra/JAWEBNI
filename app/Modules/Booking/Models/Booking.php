<?php

namespace App\Modules\Booking\Models;

use App\Core\Traits\BelongsToTenant;
use App\Modules\CRM\Models\Customer;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasUuids, BelongsToTenant;

    protected $fillable = [
        'business_id',
        'customer_id',
        'service_id',
        'staff_member_id',
        'booking_datetime',
        'status',
        'booked_via',
        'notes',
        'reminder_sent',
    ];

    protected $casts = [
        'booking_datetime' => 'datetime',
        'reminder_sent' => 'boolean',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function staffMember(): BelongsTo
    {
        return $this->belongsTo(StaffMember::class);
    }
}