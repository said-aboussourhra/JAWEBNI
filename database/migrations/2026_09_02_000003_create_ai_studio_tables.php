<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->string('question');
            $table->text('answer');
            $table->string('category')->default('general'); // delivery, pricing, products, returns, hours, general
            $table->string('language')->default('darija'); // darija, ar, fr, en
            $table->string('source')->default('manual'); // manual, learned_from_chat, document, suggestion
            $table->integer('usage_count')->default(0);
            $table->integer('confidence_score')->default(95);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
        });

        Schema::create('ai_personalities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->unique();
            $table->string('communication_style')->default('friendly_moroccan'); // friendly_moroccan, professional_arabic, luxury_french, casual
            $table->integer('darija_ratio')->default(70);
            $table->integer('arabic_ratio')->default(20);
            $table->integer('french_ratio')->default(10);
            $table->string('response_length')->default('balanced'); // short, balanced, detailed
            $table->integer('trait_helpfulness')->default(90);
            $table->integer('trait_persuasiveness')->default(80);
            $table->integer('trait_friendliness')->default(95);
            $table->text('custom_instructions')->nullable();
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
        });

        Schema::create('ai_test_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->uuid('user_id')->nullable()->index();
            $table->text('input_prompt');
            $table->text('output_response');
            $table->string('detected_intent');
            $table->string('selected_agent');
            $table->string('knowledge_source')->nullable();
            $table->integer('confidence_score');
            $table->string('suggested_action')->nullable();
            $table->string('feedback')->nullable(); // thumbs_up, thumbs_down
            $table->text('feedback_notes')->nullable();
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_test_runs');
        Schema::dropIfExists('ai_personalities');
        Schema::dropIfExists('knowledge_items');
    }
};