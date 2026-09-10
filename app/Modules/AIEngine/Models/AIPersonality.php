<?php

namespace App\Modules\AIEngine\Models;

use App\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AIPersonality extends Model
{
    use HasUuids, BelongsToTenant;

    protected $table = 'ai_personalities';

    protected $fillable = [
        'business_id',
        'communication_style',
        'darija_ratio',
        'arabic_ratio',
        'french_ratio',
        'response_length',
        'trait_helpfulness',
        'trait_persuasiveness',
        'trait_friendliness',
        'custom_instructions',
    ];

    protected $casts = [
        'darija_ratio' => 'integer',
        'arabic_ratio' => 'integer',
        'french_ratio' => 'integer',
        'trait_helpfulness' => 'integer',
        'trait_persuasiveness' => 'integer',
        'trait_friendliness' => 'integer',
    ];
}