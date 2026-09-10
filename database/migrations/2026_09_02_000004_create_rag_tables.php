<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->string('title');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime_type');
            $table->integer('file_size_bytes');
            $table->integer('pages_count')->default(1);
            $table->integer('chunks_count')->default(0);
            $table->integer('extraction_confidence')->default(95);
            $table->string('status')->default('indexed'); // processing, indexed, failed
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
        });

        Schema::create('knowledge_chunks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->uuid('document_id')->index();
            $table->integer('chunk_index');
            $table->text('content');
            $table->integer('token_count')->default(0);
            $table->json('embedding')->nullable(); // Vector embedding representation
            $table->json('metadata')->nullable(); // Page number, section header
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('document_id')->references('id')->on('knowledge_documents')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_chunks');
        Schema::dropIfExists('knowledge_documents');
    }
};