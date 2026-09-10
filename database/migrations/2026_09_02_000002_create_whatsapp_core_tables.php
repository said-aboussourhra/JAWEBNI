<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->string('phone_number');
            $table->string('phone_number_id')->unique();
            $table->string('waba_id')->nullable();
            $table->text('access_token');
            $table->string('verify_token');
            $table->string('app_secret')->nullable();
            $table->string('status')->default('connected'); // connected, disconnected, expired
            $table->string('quality_rating')->default('GREEN');
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->string('name')->nullable();
            $table->string('phone')->index();
            $table->string('city')->nullable();
            $table->string('preferred_language')->default('darija'); // darija, ar, fr, en
            $table->integer('lead_score')->default(50);
            $table->decimal('lifetime_value', 10, 2)->default(0.00);
            $table->integer('total_orders')->default(0);
            $table->json('tags')->nullable();
            $table->json('ai_memory')->nullable(); // Learned preferences, sizes, address
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->unique(['business_id', 'phone']);
        });

        Schema::create('conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->uuid('customer_id')->index();
            $table->uuid('whatsapp_account_id')->nullable()->index();
            $table->string('status')->default('ai_handling'); // ai_handling, human_takeover, waiting_human, closed
            $table->string('intent')->nullable(); // purchase_inquiry, delivery_question, booking_request, complaint, general_faq
            $table->integer('intent_confidence')->default(85);
            $table->string('sentiment')->default('neutral'); // positive, neutral, negative
            $table->string('priority')->default('normal'); // low, normal, high, urgent
            $table->timestamp('window_expires_at')->nullable(); // 24-hour Meta messaging window
            $table->text('last_message_text')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete();
            $table->foreign('whatsapp_account_id')->references('id')->on('whatsapp_accounts')->nullOnDelete();
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->uuid('conversation_id')->index();
            $table->uuid('customer_id')->index();
            $table->string('whatsapp_message_id')->nullable()->unique();
            $table->enum('sender_type', ['customer', 'ai', 'human', 'system'])->default('customer');
            $table->uuid('sent_by_user_id')->nullable()->index(); // If sender_type is human
            $table->string('type')->default('text'); // text, audio, image, document, location, template, interactive
            $table->text('body')->nullable();
            $table->string('media_url')->nullable();
            $table->string('media_mime_type')->nullable();
            $table->integer('media_duration_seconds')->nullable();
            $table->string('status')->default('sent'); // sent, delivered, read, failed
            $table->string('detected_intent')->nullable();
            $table->integer('ai_confidence')->nullable();
            $table->json('ai_metadata')->nullable(); // Agent used, tokens, latency, sources
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('conversation_id')->references('id')->on('conversations')->cascadeOnDelete();
            $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete();
            $table->foreign('sent_by_user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('human_handoff_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->uuid('conversation_id')->index();
            $table->string('reason'); // low_confidence, customer_complaint, human_requested, repeated_failure, sensitive_query
            $table->integer('ai_confidence')->nullable();
            $table->uuid('assigned_user_id')->nullable()->index();
            $table->string('status')->default('pending'); // pending, accepted, resolved
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('conversation_id')->references('id')->on('conversations')->cascadeOnDelete();
            $table->foreign('assigned_user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('human_handoff_logs');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('whatsapp_accounts');
    }
};
