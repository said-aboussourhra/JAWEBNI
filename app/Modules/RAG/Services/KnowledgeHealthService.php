<?php

namespace App\Modules\RAG\Services;

use App\Modules\AIEngine\Models\KnowledgeItem;
use App\Modules\RAG\Models\KnowledgeDocument;

class KnowledgeHealthService
{
    public function calculateHealth(string $businessId): array
    {
        $docsCount = KnowledgeDocument::where('business_id', $businessId)->count();
        $qnaCount = KnowledgeItem::where('business_id', $businessId)->count();

        $baseScore = 70;
        $score = min(100, $baseScore + ($docsCount * 10) + ($qnaCount * 3));

        $checklist = [
            ['title' => 'كتالوج المنتجات والأسعار', 'status' => $docsCount > 0 ? 'complete' : 'missing'],
            ['title' => 'سياسة التوصيل والشحن بالمغرب', 'status' => 'complete'],
            ['title' => 'طرق الدفع عند الاستلام والتحويل', 'status' => 'complete'],
            ['title' => 'شروط الاستبدال واسترجاع المقاس', 'status' => $qnaCount > 2 ? 'complete' : 'warning'],
            ['title' => 'أسئلة الزبائن الشائعة بالدارجة', 'status' => $qnaCount > 0 ? 'complete' : 'missing'],
        ];

        return [
            'score' => $score,
            'status' => $score >= 85 ? 'ممتازة' : 'تحتاج تحسين',
            'checklist' => $checklist,
            'docs_count' => $docsCount,
            'qna_count' => $qnaCount,
        ];
    }
}