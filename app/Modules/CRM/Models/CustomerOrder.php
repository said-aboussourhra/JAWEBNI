<?php

namespace App\Modules\CRM\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerOrder extends Model
{
    use HasUuids, BelongsToTenant;

    protected $table = 'customer_orders';

    protected $fillable = [
        'business_id',
        'customer_id',
        'order_number',
        'total_amount',
        'currency',
        'payment_method',
        'status',
        'items',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'items' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}