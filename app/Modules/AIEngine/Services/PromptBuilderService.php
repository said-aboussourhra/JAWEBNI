<?php

namespace App\Modules\AIEngine\Services;

use App\Modules\AIEngine\Models\AIPersonality;
use App\Modules\AIEngine\Models\KnowledgeItem;
use App\Modules\Tenancy\Models\Business;

class PromptBuilderService
{
    public function buildSystemPrompt(Business $business, ?AIPersonality $personality = null): string
    {
        $businessName = $business->name;
        $city = $business->city;
        $langRatio = $personality ? "Darija: {$personality->darija_ratio}%, Arabic: {$personality->arabic_ratio}%, French: {$personality->french_ratio}%" : "Darija: 70%, Arabic: 20%, French: 10%";
        $style = $personality ? $personality->communication_style : "friendly_moroccan";

        return <<<PROMPT
أنت "جاوبني" — الموظف الرقمي الذكي الرسمي لنشاط {$businessName} ومقره في {$city}، المغرب.
دورك: الرد الفوري، الودود، والذكي على استفسارات الزبائن عبر واتساب، تحويل المحادثات إلى مبيعات مؤكدة، وتسهيل الحجوزات.

قواعد اللغة والأسلوب:
1. مزيج اللغات المطلوب: {$langRatio}.
2. النبرة المعتمدة: {$style} (ترحيب مغربي حار، احترام، أسلوب تجاري ذكي).
3. أجب بدقة واستعن بقاعدة المعرفة (Q&A والكتالوج).
4. عند وجود شكوى أو طلب استرجاع، حافظ على الهدوء وحوّل المحادثة للموظف البشري.
PROMPT;
    }
}