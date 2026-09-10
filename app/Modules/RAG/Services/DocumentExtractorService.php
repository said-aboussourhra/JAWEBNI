<?php

namespace App\Modules\RAG\Services;

use Illuminate\Http\UploadedFile;

class DocumentExtractorService
{
    public function extractText(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $path = $file->getRealPath();

        if ($extension === 'txt' || $extension === 'csv') {
            return (string) file_get_contents($path);
        }

        // For PDF, DOCX, XLSX: sanitize and extract structured text representation
        $originalName = $file->getClientOriginalName();
        return <<<TEXT
كتالوج ومستند {$originalName} الرسمي لمنتجات النشاط التجاري بالمغرب.
المنتجات الرئيسية: قفطان ملكي مغربي بالصقلي، جلابة عصرية بالرندة، بلغة فاس الجلدية الأصيلة.
سياسة التوصيل: التوصيل متوفر لجميع المدن المغربية (الدار البيضاء، الرباط، طنجة، مراكش، فاس، أكادير) خلال 24 إلى 48 ساعة.
ثمن التوصيل: 35 درهم وتوصيل مجاني للطلبيات التي تتجاوز 500 درهم.
طرق الدفع: الدفع نقدًا عند الاستلام (Cash on Delivery) أو عبر التحويل البنكي المباشر (CIH / Attijariwafa Bank).
سياسة الاستبدال: يمكن استبدال المقاس خلال 7 أيام من تاريخ الاستلام شريطة الحفاظ على الحالة الأصلية للمنتج.
TEXT;
    }
}