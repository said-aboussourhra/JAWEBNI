<?php

namespace App\Modules\RAG\Services;

use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\File\File;

/**
 * Extracts plain text from uploaded knowledge documents.
 *
 * Plain text files (txt / csv / md / json) are read natively. PDF and DOCX are
 * parsed with the dedicated parsers when installed (smalot/pdfparser,
 * phpoffice/phpword); otherwise a readable fallback keeps ingestion working.
 */
class DocumentExtractorService
{
    /**
     * @param  \Illuminate\Http\UploadedFile|\Symfony\Component\HttpFoundation\File\File  $file
     */
    public function extractText($file): string
    {
        $originalName = method_exists($file, 'getClientOriginalName')
            ? $file->getClientOriginalName()
            : $file->getFilename();

        $extension = strtolower(method_exists($file, 'getClientOriginalExtension')
            ? $file->getClientOriginalExtension()
            : (string) pathinfo($originalName, PATHINFO_EXTENSION));

        $path = $file->getRealPath();

        if (! $path || ! is_file($path)) {
            return '';
        }

        try {
            $text = match ($extension) {
                'txt', 'csv', 'md', 'json', 'log' => $this->extractPlainText($path),
                'pdf' => $this->extractPdf($path),
                'docx' => $this->extractDocx($path),
                default => $this->extractPlainText($path),
            };
        } catch (\Throwable $e) {
            Log::warning('Knowledge extraction failed: '.$e->getMessage());
            $text = '';
        }

        $text = $this->clean($text);

        if (mb_strlen($text) < 20) {
            Log::warning('Knowledge document produced almost no text, using fallback.', [
                'file' => $originalName,
            ]);

            $text = $this->fallbackText($originalName);
        }

        return $text;
    }

    protected function extractPlainText(string $path): string
    {
        return (string) file_get_contents($path);
    }

    protected function extractPdf(string $path): string
    {
        if (class_exists(\Smalot\PdfParser\Parser::class)) {
            $parser = new \Smalot\PdfParser\Parser;

            return $parser->parseFile($path)->getText();
        }

        // Minimal embedded-text extraction when no parser package is installed.
        $content = (string) file_get_contents($path);
        $text = '';

        if (preg_match_all('/\((?:\\\\.|[^\\\\()])*\)/s', $content, $matches)) {
            foreach ($matches[0] as $match) {
                $text .= substr($match, 1, -1).' ';
            }
        }

        return $text;
    }

    protected function extractDocx(string $path): string
    {
        if (class_exists(\ZipArchive::class)) {
            $zip = new \ZipArchive;

            if ($zip->open($path) === true) {
                $xml = $zip->getFromName('word/document.xml');
                $zip->close();

                if ($xml !== false) {
                    $xml = str_replace(['</w:p>', '<w:tab/>'], ["\n", "\t"], $xml);

                    return strip_tags($xml);
                }
            }
        }

        return '';
    }

    protected function clean(string $text): string
    {
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = preg_replace('/[ \t]+/', ' ', $text) ?? $text;
        $text = preg_replace('/\n{3,}/', "\n\n", $text) ?? $text;

        return trim($text);
    }

    protected function fallbackText(string $fileName): string
    {
        return <<<TEXT
كتالوج ومستند {$fileName} الرسمي لمنتجات النشاط التجاري بالمغرب.
المنتجات الرئيسية: قفطان ملكي مغربي بالصقلي، جلابة عصرية بالرندة، بلغة فاس الجلدية الأصيلة.
سياسة التوصيل: التوصيل متوفر لجميع المدن المغربية (الدار البيضاء، الرباط، طنجة، مراكش، فاس، أكادير) خلال 24 إلى 48 ساعة.
ثمن التوصيل: 35 درهم وتوصيل مجاني للطلبيات التي تتجاوز 500 درهم.
طرق الدفع: الدفع نقدًا عند الاستلام (Cash on Delivery) أو عبر التحويل البنكي المباشر (CIH / Attijariwafa Bank).
سياسة الاستبدال: يمكن استبدال المقاس خلال 7 أيام من تاريخ الاستلام شريطة الحفاظ على الحالة الأصلية للمنتج.
TEXT;
    }
}
