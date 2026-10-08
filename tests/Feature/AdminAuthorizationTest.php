<?php

namespace Tests\Feature;

use App\Modules\Billing\Models\BankTransferPayment;
use App\Modules\Billing\Models\SubscriptionPlan;
use App\Modules\Tenancy\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function makeUser(Business $business, bool $superAdmin): User
    {
        $user = User::create([
            'name' => $superAdmin ? 'Super Admin' : 'Shop Owner',
            'email' => ($superAdmin ? 'admin' : 'owner').'@jawebni.ma',
            'password' => bcrypt('password123'),
            'current_business_id' => $business->id,
            'is_super_admin' => $superAdmin,
        ]);

        $user->businesses()->attach($business->id, ['role' => 'owner']);

        return $user;
    }

    public function test_regular_user_cannot_open_super_admin_hub(): void
    {
        $business = Business::create(['name' => 'Caftan Shop', 'slug' => 'caftan-shop']);

        $this->actingAs($this->makeUser($business, false))
            ->get('/admin')
            ->assertStatus(403);
    }

    public function test_super_admin_can_open_super_admin_hub_and_approve_payment(): void
    {
        $business = Business::create(['name' => 'Caftan Shop', 'slug' => 'caftan-shop']);

        $plan = SubscriptionPlan::create([
            'name' => 'Professional',
            'slug' => 'professional',
            'price_mad' => 499,
            'messages_limit' => 3000,
        ]);

        $payment = BankTransferPayment::create([
            'business_id' => $business->id,
            'plan_id' => $plan->id,
            'reference_code' => 'JW-AUTH-TEST',
            'amount' => 499,
            'currency' => 'MAD',
            'status' => 'pending_review',
        ]);

        $this->actingAs($this->makeUser($business, true))
            ->get('/admin')
            ->assertStatus(200);

        $this->post(route('admin.payments.approve', $payment->id))
            ->assertStatus(302);

        $this->assertDatabaseHas('bank_transfer_payments', [
            'id' => $payment->id,
            'status' => 'approved',
        ]);

        $this->assertDatabaseHas('subscriptions', [
            'business_id' => $business->id,
            'status' => 'active',
        ]);
    }

    public function test_regular_user_cannot_approve_payments(): void
    {
        $business = Business::create(['name' => 'Caftan Shop', 'slug' => 'caftan-shop']);

        $plan = SubscriptionPlan::create([
            'name' => 'Basic',
            'slug' => 'basic',
            'price_mad' => 199,
            'messages_limit' => 500,
        ]);

        $payment = BankTransferPayment::create([
            'business_id' => $business->id,
            'plan_id' => $plan->id,
            'reference_code' => 'JW-DENY-TEST',
            'amount' => 199,
            'currency' => 'MAD',
            'status' => 'pending_review',
        ]);

        $this->actingAs($this->makeUser($business, false))
            ->post(route('admin.payments.approve', $payment->id))
            ->assertStatus(403);

        $this->assertDatabaseHas('bank_transfer_payments', [
            'id' => $payment->id,
            'status' => 'pending_review',
        ]);
    }
}
