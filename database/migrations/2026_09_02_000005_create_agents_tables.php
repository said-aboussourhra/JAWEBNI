<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_agents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->string('type'); // sales, booking, support, complaint, faq
            $table->string('name');
            $table->string('purpose');
            $table->text('instructions')->nullable();
            $table->integer('conversations_handled')->default(0);
            $table->integer('success_rate')->default(95);
            $table->integer('handoff_rate')->default(5);
            $table->string('status')->default('active'); // active, paused
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->unique(['business_id', 'type']);
        });

        Schema::create('agent_execution_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->uuid('agent_id')->index();
            $table->uuid('conversation_id')->nullable()->index();
            $table->string('detected_intent');
            $table->integer('confidence_score');
            $table->integer('latency_ms')->default(320);
            $table->boolean('handoff_triggered')->default(false);
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('agent_id')->references('id')->on('ai_agents')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_execution_logs');
        Schema::dropIfExists('ai_agents');
    }
};