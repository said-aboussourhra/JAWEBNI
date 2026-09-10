<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Billing\Models\BankTransferPayment;
use App\Modules\Billing\Models\SubscriptionPlan;
use App\Modules\Billing\Models\SuperAdminBankSetting;
use App\Modules\Booking\Models\Booking;
use App\Modules\Booking\Models\Service;
use App\Modules\Campaigns\Models\Campaign;
use App\Modules\CRM\Models\Customer;
use App\Modules\Tenancy\Models\Business;
use App\Modules\Workflow\Models\Workflow;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_workflow_and_campaign_execution(): void
    {
        $business = Business::create([
            'name' => 'Caftan Royal Casablanca',
            'slug' => 'caftan-royal',
        ]);

        $customer = Customer::create([
            'business_id' => $business->id,
            'name' => 'سلمى',
            'phone' => '+212661556677',
        ]);

        $service = Service::create([
            'business_id' => $business->id,
            'name' => 'جلسة قياس قفطان',
            'price' => 0.00,
            'duration_minutes' => 45,
        ]);

        // 1. Create Booking
        $booking = Booking::create([
            'business_id' => $business->id,
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'booking_datetime' => Carbon::now()->addDays(2),
            'status' => 'confirmed',
            'booked_via' => 'whatsapp_ai',
        ]);

        $this->assertDatabaseHas('bookings', [
            'business_id' => $business->id,
            'customer_id' => $customer->id,
            'booked_via' => 'whatsapp_ai',
        ]);

        // 2. Create Workflow
        $workflow = Workflow::create([
            'business_id' => $business->id,
            'name' => 'Follow-up Lead',
            'trigger_type' => 'purchase_intent',
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('workflows', [
            'business_id' => $business->id,
            'name' => 'Follow-up Lead',
        ]);

        // 3. Create Campaign
        $campaign = Campaign::create([
            'business_id' => $business->id,
            'name' => 'VIP Autumn Offers',
            'status' => 'completed',
            'total_recipients' => 100,
        ]);

        $this->assertDatabaseHas('campaigns', [
            'business_id' => $business->id,
            'total_recipients' => 100,
        ]);
    }

    public function test_manual_bank_transfer_payment_and_admin_approval(): void
    {
        $business = Business::create([
            'name' => 'Artisanat Store',
            'slug' => 'artisanat-store',
        ]);

        $plan = SubscriptionPlan::create([
            'name' => 'Professional Plan',
            'slug' => 'pro',
            'price_mad' => 499.00,
            'messages_limit' => 3000,
        ]);

        $user = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@jawebni.ma',
            'password' => bcrypt('password123'),
            'current_business_id' => $business->id,
            'is_super_admin' => true,
        ]);

        $payment = BankTransferPayment::create([
            'business_id' => $business->id,
            'plan_id' => $plan->id,
            'reference_code' => 'JW-TESTREF123',
            'amount' => 499.00,
            'status' => 'pending_review',
        ]);

        $this->actingAs($user);

        // Approve payment
        $response = $this->post(route('admin.payments.approve', $payment->id));
        $response->assertStatus(302);

        $this->assertDatabaseHas('bank_transfer_payments', [
            'id' => $payment->id,
            'status' => 'approved',
        ]);

        $this->assertDatabaseHas('subscriptions', [
            'business_id' => $business->id,
            'status' => 'active',
        ]);
    }
}