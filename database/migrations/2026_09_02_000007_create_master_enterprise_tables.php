<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. BOOKINGS MODULE
        Schema::create('services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->integer('duration_minutes')->default(30);
            $table->string('color')->default('#0F9D8C');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
        });

        Schema::create('staff_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->uuid('user_id')->nullable()->index();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('role_title')->default('Styliste / Conseillère');
            $table->json('working_hours')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->uuid('customer_id')->index();
            $table->uuid('service_id')->nullable()->index();
            $table->uuid('staff_member_id')->nullable()->index();
            $table->dateTime('booking_datetime');
            $table->string('status')->default('confirmed'); // confirmed, completed, cancelled, no_show
            $table->string('booked_via')->default('whatsapp_ai'); // whatsapp_ai, manual, web
            $table->text('notes')->nullable();
            $table->boolean('reminder_sent')->default(false);
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete();
            $table->foreign('service_id')->references('id')->on('services')->nullOnDelete();
            $table->foreign('staff_member_id')->references('id')->on('staff_members')->nullOnDelete();
        });

        // 2. WORKFLOW AUTOMATION MODULE
        Schema::create('workflows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('trigger_type')->default('new_message'); // new_message, purchase_intent, booking_created, human_handoff
            $table->json('nodes')->nullable(); // React Flow nodes structure
            $table->json('edges')->nullable(); // React Flow edges structure
            $table->boolean('is_active')->default(true);
            $table->integer('execution_count')->default(0);
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
        });

        // 3. CAMPAIGNS MISSION CONTROL MODULE
        Schema::create('campaign_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->string('name');
            $table->string('whatsapp_template_name');
            $table->string('language')->default('darija');
            $table->string('category')->default('marketing');
            $table->string('status')->default('approved'); // approved, pending, rejected
            $table->text('body_text');
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
        });

        Schema::create('campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->uuid('template_id')->nullable()->index();
            $table->string('name');
            $table->string('target_segment')->default('all_customers');
            $table->dateTime('scheduled_at')->nullable();
            $table->string('status')->default('draft'); // draft, scheduled, sending, completed
            $table->integer('total_recipients')->default(0);
            $table->integer('delivered_count')->default(0);
            $table->integer('read_count')->default(0);
            $table->integer('replied_count')->default(0);
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('template_id')->references('id')->on('campaign_templates')->nullOnDelete();
        });

        // 4. BILLING & MANUAL BANK TRANSFER MODULE
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('price_mad', 10, 2);
            $table->integer('messages_limit');
            $table->integer('numbers_limit')->default(1);
            $table->json('features')->nullable();
            $table->boolean('is_popular')->default(false);
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->uuid('plan_id')->index();
            $table->string('status')->default('active'); // active, pending_payment, past_due, cancelled
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('plan_id')->references('id')->on('subscription_plans')->cascadeOnDelete();
        });

        Schema::create('bank_transfer_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->uuid('plan_id')->index();
            $table->string('reference_code')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('MAD');
            $table->string('receipt_file_path')->nullable();
            $table->string('status')->default('pending_review'); // pending_review, approved, rejected
            $table->text('admin_notes')->nullable();
            $table->uuid('reviewed_by_user_id')->nullable()->index();
            $table->dateTime('reviewed_at')->nullable();
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('plan_id')->references('id')->on('subscription_plans')->cascadeOnDelete();
            $table->foreign('reviewed_by_user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('super_admin_bank_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('bank_name')->default('Attijariwafa Bank');
            $table->string('account_holder')->default('JAWEBNI SARL AU');
            $table->string('rib')->default('007 780 0001234567890123 45');
            $table->string('iban')->default('MA64 007 780 0001234567890123 45');
            $table->string('swift_bic')->default('BCMAMAMC');
            $table->text('instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('super_admin_bank_settings');
        Schema::dropIfExists('bank_transfer_payments');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('subscription_plans');
        Schema::dropIfExists('campaigns');
        Schema::dropIfExists('campaign_templates');
        Schema::dropIfExists('workflows');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('staff_members');
        Schema::dropIfExists('services');
    }
};