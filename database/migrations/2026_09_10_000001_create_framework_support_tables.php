<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tables required by Laravel's default session / password / queue drivers
     * that the Jawebni schema did not ship with.
     */
    public function up(): void
    {
        if (! Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->foreignUuid('user_id')->nullable()->index();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->longText('payload');
                $table->integer('last_activity')->index();
            });
        }

        if (! Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }

        // Indexes that keep the inbox and RAG queries fast as data grows.
        if (Schema::hasTable('messages') && ! Schema::hasColumn('messages', 'id')) {
            // no-op guard
        }

        if (Schema::hasTable('messages')) {
            Schema::table('messages', function (Blueprint $table) {
                try {
                    $table->index(['conversation_id', 'created_at'], 'messages_conversation_created_index');
                } catch (\Throwable $e) {
                    // index already exists
                }
            });
        }

        if (Schema::hasTable('conversations')) {
            Schema::table('conversations', function (Blueprint $table) {
                try {
                    $table->index(['business_id', 'status'], 'conversations_business_status_index');
                } catch (\Throwable $e) {
                    // index already exists
                }
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
