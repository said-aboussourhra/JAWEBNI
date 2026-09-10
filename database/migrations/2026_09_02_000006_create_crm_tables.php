<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->string('name');
            $table->string('color')->default('#0F9D8C');
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->unique(['business_id', 'name']);
        });

        Schema::create('customer_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->uuid('customer_id')->index();
            $table->uuid('user_id')->nullable()->index();
            $table->text('content');
            $table->string('type')->default('staff'); // staff, ai_insight
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('customer_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id')->index();
            $table->uuid('customer_id')->index();
            $table->string('order_number')->unique();
            $table->decimal('total_amount', 10, 2);
            $table->string('currency')->default('MAD');
            $table->string('payment_method')->default('cod'); // cod, bank_transfer, online
            $table->string('status')->default('completed'); // pending, processing, completed, cancelled
            $table->json('items')->nullable();
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_orders');
        Schema::dropIfExists('customer_notes');
        Schema::dropIfExists('customer_tags');
    }
};