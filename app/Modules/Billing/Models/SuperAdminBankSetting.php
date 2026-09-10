<?php

namespace App\Modules\Billing\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SuperAdminBankSetting extends Model
{
    use HasUuids;

    protected $table = 'super_admin_bank_settings';

    protected $fillable = [
        'bank_name',
        'account_holder',
        'rib',
        'iban',
        'swift_bic',
        'instructions',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}