<?php

namespace App\Modules\AIEngine\Services;

use App\Modules\Agents\Models\AIAgent;
use App\Modules\AIEngine\Models\AIPersonality;
use App\Modules\Tenancy\Models\Business;

class PromptBuilderService
{
    /**
     * Builds the system prompt injected into every AI reply.
     *
     * @param  array<int, array{content: string, document_title?: string}>  $knowledge
     * @param  array<string, mixed>  $customerMemory
     */
    public function buildSystemPrompt(
        Business $business,
        ?AIPersonality $personality = null,
        ?AIAgent $agent = null,
        array $knowledge = [],
        array $customerMemory = []
    ): string {
        $businessName = $business->name;
        $city = $business->city;
        $langRatio = $personality
            ? "Darija: {$personality->darija_ratio}%, Arabic: {$personality->arabic_ratio}%, French: {$personality->french_ratio}%"
            : 'Darija: 70%, Arabic: 20%, French: 10%';
        $style = $personality ? $personality->communication_style : 'friendly_moroccan';
        $length = $personality->response_length ?? 'short_whatsapp';

        $prompt = <<<PROMPT
أنت "جاوبني" — الموظف الرقمي الذكي الرسمي لنشاط {$businessName} ومقره في {$city}، المغرب.
دورك: الرد الفوري، الودود، والذكي على استفسارات الزبائن عبر واتساب، تحويل المحادثات إلى مبيعات مؤكدة، وتسهيل الحجوزات.

قواعد اللغة والأسلوب:
1. مزيج اللغات المطلوب: {$langRatio}.
2. النبرة المعتمدة: {$style} (ترحيب مغربي حار، احترام، أسلوب تجاري ذكي).
3. طول الرد المطلوب: {$length} (ردود واتساب قصيرة، جملة إلى ثلاث جمل كحد أقصى).
4. أجب بدقة واستعن بقاعدة المعرفة (Q&A والكتالوج).
5. عند وجود شكوى أو طلب استرجاع، حافظ على الهدوء وحوّل المحادثة للموظف البشري.
6. لا تخترع أسعاراً أو عروضاً غير موجودة في قاعدة المعرفة.
7. لا تذكر أبداً أنك نموذج لغوي أو ذكاء اصطناعي.

PROMPT;

        if ($agent) {
            $purpose = $agent->purpose ?? '';
            $instructions = $agent->instructions ?? '';

            $prompt .= <<<AGENT
المهمة الحالية ({$agent->name} — {$agent->type}):
الهدف: {$purpose}
التعليمات الخاصة: {$instructions}

AGENT;
        }

        if ($knowledge !== []) {
            $prompt .= "قاعدة المعرفة المعتمدة (استعملها للإجابة بدقة):\n";

            foreach ($knowledge as $index => $chunk) {
                $title = $chunk['document_title'] ?? 'قاعدة المعرفة';
                $content = $chunk['content'] ?? '';
                $prompt .= '['.($index + 1)."] ({$title}): {$content}\n";
            }

            $prompt .= "\n";
        }

        if ($customerMemory !== []) {
            $prompt .= "ما تعرفه عن هذا الزبون (ذاكرة AI):\n";

            foreach ($customerMemory as $key => $value) {
                if (is_array($value)) {
                    $value = implode('، ', array_map('strval', $value));
                }

                $prompt .= "- {$key}: {$value}\n";
            }

            $prompt .= "\n";
        }

        $prompt .= "التوقيت الحالي: ".now()->format('Y-m-d H:i')." (توقيت المغرب).\n";
        $prompt .= "العملة المعتمدة: ".($business->currency ?: 'MAD')." (الدرهم المغربي).\n";

        return $prompt;
    }
}
