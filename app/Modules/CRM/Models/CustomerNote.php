<?php

namespace App\Modules\CRM\Models;

use App\Core\Traits\BelongsToTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerNote extends Model
{
    use HasUuids, BelongsToTenant;

    protected $table = 'customer_notes';

    protected $fillable = [
        'business_id',
        'customer_id',
        'user_id',
        'content',
        'type',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}