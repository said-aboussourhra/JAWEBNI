<?php

namespace App\Modules\RAG\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\IndexKnowledgeDocument;
use App\Modules\RAG\Models\KnowledgeDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RAGDocumentController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'document' => ['required', 'file', 'mimes:pdf,docx,xlsx,csv,txt,md', 'max:20480'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $file = $request->file('document');
        $businessId = (string) auth()->user()->current_business_id;

        $fileName = time().'_'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$file->getClientOriginalExtension();
        $filePath = $file->storeAs('knowledge_docs/'.$businessId, $fileName);

        $doc = KnowledgeDocument::create([
            'id' => (string) Str::uuid(),
            'business_id' => $businessId,
            'title' => $request->input('title') ?: $file->getClientOriginalName(),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'mime_type' => $file->getClientMimeType(),
            'file_size_bytes' => $file->getSize(),
            'pages_count' => 1,
            'chunks_count' => 0,
            'extraction_confidence' => 0,
            'status' => 'processing',
        ]);

        IndexKnowledgeDocument::dispatch($businessId, (string) $doc->id);

        return back()->with('success', 'تم رفع المستند، وسيتم تقسيمه وأرشفته في قاعدة المعرفة تلقائياً.');
    }

    public function destroy(string $id)
    {
        $doc = KnowledgeDocument::findOrFail($id);

        if ($doc->file_path) {
            Storage::disk(config('filesystems.default', 'local'))->delete($doc->file_path);
        }

        $doc->delete();

        return back()->with('success', 'تم حذف المستند وكل المقاطع المرتبطة به.');
    }
}
