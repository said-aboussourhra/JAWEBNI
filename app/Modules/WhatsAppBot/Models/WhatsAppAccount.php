<?php

namespace App\Modules\WhatsAppBot\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WhatsAppAccount extends Model
{
    use HasUuids, BelongsToTenant;

    protected $table = 'whatsapp_accounts';

    protected $fillable = [
        'business_id',
        'phone_number',
        'phone_number_id',
        'waba_id',
        'access_token',
        'verify_token',
        'app_secret',
        'status',
        'quality_rating',
    ];

    protected $hidden = [
        'access_token',
        'app_secret',
    ];

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'whatsapp_account_id');
    }
}