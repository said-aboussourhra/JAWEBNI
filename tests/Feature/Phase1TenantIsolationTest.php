<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Tenancy\Models\Business;
use App\Modules\Tenancy\Models\BusinessSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase1TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_scope_prevents_cross_tenant_data_leakage(): void
    {
        // 1. Create Tenant A
        $businessA = Business::create([
            'name' => 'Moroccan Caftan Luxury',
            'slug' => 'moroccan-caftan',
            'phone_number' => '+212661000001',
            'city' => 'Casablanca',
        ]);
        $userA = User::create([
            'name' => 'Owner A',
            'email' => 'ownerA@caftan.ma',
            'password' => bcrypt('password123'),
            'current_business_id' => $businessA->id,
        ]);
        $userA->businesses()->attach($businessA->id, ['role' => 'owner']);

        // Setting belonging to Tenant A
        BusinessSetting::create([
            'business_id' => $businessA->id,
            'key' => 'secret_meta_token',
            'value' => 'TOKEN_FOR_BUSINESS_A',
        ]);

        // 2. Create Tenant B
        $businessB = Business::create([
            'name' => 'Marrakech Spice House',
            'slug' => 'marrakech-spice',
            'phone_number' => '+212662000002',
            'city' => 'Marrakech',
        ]);
        $userB = User::create([
            'name' => 'Owner B',
            'email' => 'ownerB@spice.ma',
            'password' => bcrypt('password123'),
            'current_business_id' => $businessB->id,
        ]);
        $userB->businesses()->attach($businessB->id, ['role' => 'owner']);

        // Setting belonging to Tenant B
        BusinessSetting::create([
            'business_id' => $businessB->id,
            'key' => 'secret_meta_token',
            'value' => 'TOKEN_FOR_BUSINESS_B',
        ]);

        // 3. Authenticate as User A and query BusinessSetting
        $this->actingAs($userA);

        $settingsForA = BusinessSetting::all();
        $this->assertCount(1, $settingsForA);
        $this->assertEquals('TOKEN_FOR_BUSINESS_A', $settingsForA->first()->value);

        // 4. Authenticate as User B and query BusinessSetting
        $this->actingAs($userB);

        $settingsForB = BusinessSetting::all();
        $this->assertCount(1, $settingsForB);
        $this->assertEquals('TOKEN_FOR_BUSINESS_B', $settingsForB->first()->value);
    }

    public function test_user_cannot_switch_to_unauthorized_tenant(): void
    {
        $businessA = Business::create([
            'name' => 'Shop A',
            'slug' => 'shop-a',
        ]);
        $businessB = Business::create([
            'name' => 'Shop B',
            'slug' => 'shop-b',
        ]);

        $userA = User::create([
            'name' => 'User A',
            'email' => 'userA@test.ma',
            'password' => bcrypt('password'),
            'current_business_id' => $businessA->id,
            'is_super_admin' => false,
        ]);
        $userA->businesses()->attach($businessA->id, ['role' => 'owner']);

        $this->actingAs($userA);

        // Attempt switching to Business B without membership
        $response = $this->post(route('tenant.switch'), [
            'business_id' => $businessB->id,
        ]);

        $response->assertStatus(403);
    }
}
