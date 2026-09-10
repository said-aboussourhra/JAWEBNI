<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\CRM\Models\Customer;
use App\Modules\CRM\Models\CustomerNote;
use App\Modules\CRM\Models\CustomerTag;
use App\Modules\Tenancy\Models\Business;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase6CRMTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_creation_and_ai_memory_persistence(): void
    {
        $business = Business::create([
            'name' => 'Morocco Caftan Luxe',
            'slug' => 'morocco-caftan-luxe',
        ]);

        $customer = Customer::create([
            'business_id' => $business->id,
            'name' => 'فاطمة الزهراء',
            'phone' => '+212661001122',
            'city' => 'Casablanca',
            'lead_score' => 95,
            'lifetime_value' => 4500.00,
            'ai_memory' => [
                'preferred_size' => 'Taille 38',
                'favorite_color' => 'Vert Émeraude',
            ],
        ]);

        $this->assertDatabaseHas('customers', [
            'business_id' => $business->id,
            'name' => 'فاطمة الزهراء',
            'city' => 'Casablanca',
        ]);

        $this->assertEquals('Taille 38', $customer->ai_memory['preferred_size']);
    }

    public function test_customer_note_creation(): void
    {
        $business = Business::create([
            'name' => 'Morocco Caftan Luxe',
            'slug' => 'morocco-caftan-luxe',
        ]);

        $customer = Customer::create([
            'business_id' => $business->id,
            'name' => 'كريم العلمي',
            'phone' => '+212662334455',
        ]);

        CustomerNote::create([
            'business_id' => $business->id,
            'customer_id' => $customer->id,
            'content' => 'الزبون يطلب توصيل خاص يوم السبت صباحا',
            'type' => 'staff',
        ]);

        $this->assertDatabaseHas('customer_notes', [
            'business_id' => $business->id,
            'customer_id' => $customer->id,
            'content' => 'الزبون يطلب توصيل خاص يوم السبت صباحا',
        ]);
    }
}