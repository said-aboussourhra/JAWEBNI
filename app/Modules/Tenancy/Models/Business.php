<?php

namespace App\Modules\Tenancy\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Business extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'phone_number',
        'city',
        'country',
        'currency',
        'default_language',
        'primary_color',
        'status',
        'onboarding_completed',
        'onboarding_step',
        'ai_readiness_score',
        'onboarding_data',
    ];

    protected $casts = [
        'onboarding_completed' => 'boolean',
        'onboarding_step' => 'integer',
        'ai_readiness_score' => 'integer',
        'onboarding_data' => 'array',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'business_user')->withPivot('role')->withTimestamps();
    }

    public function settings(): HasMany
    {
        return $this->hasMany(BusinessSetting::class);
    }

    public function getSetting(string $key, $default = null)
    {
        $setting = $this->settings()->where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }
}
