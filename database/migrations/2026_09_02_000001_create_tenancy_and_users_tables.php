<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('phone_number')->nullable();
            $table->string('city')->default('Casablanca');
            $table->string('country')->default('Morocco');
            $table->string('currency')->default('MAD');
            $table->string('default_language')->default('darija'); // darija, ar, fr, en
            $table->string('primary_color')->default('#0F9D8C');
            $table->string('status')->default('active'); // active, trial, suspended
            
            // Onboarding Progress State
            $table->boolean('onboarding_completed')->default(false);
            $table->integer('onboarding_step')->default(1);
            $table->integer('ai_readiness_score')->default(20);
            $table->json('onboarding_data')->nullable();

            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('current_business_id')->nullable()->index();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('phone')->nullable();
            $table->string('password');
            $table->string('role')->default('owner'); // owner, manager, agent, superadmin
            $table->boolean('is_super_admin')->default(false);
            $table->string('preferred_locale')->default('ar'); // ar, fr, en
            $table->boolean('two_factor_enabled')->default(false);
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('current_business_id')->references('id')->on('businesses')->nullOnDelete();
        });

        Schema::create('business_user', function (Blueprint $table) {
            $table->id();
            $table->uuid('business_id');
            $table->uuid('user_id');
            $table->string('role')->default('member'); // owner, admin, agent
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unique(['business_id', 'user_id']);
        });

        Schema::create('business_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->string('key');
            $table->text('value')->nullable();
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->unique(['business_id', 'key']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->nullable()->index();
            $table->uuid('user_id')->nullable()->index();
            $table->string('action');
            $table->string('ip_address')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('business_settings');
        Schema::dropIfExists('business_user');
        Schema::dropIfExists('users');
        Schema::dropIfExists('businesses');
    }
};
