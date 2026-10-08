<?php

namespace Tests\Feature;

use App\Modules\Billing\Models\Subscription;
use App\Modules\Billing\Models\SubscriptionPlan;
use App\Modules\Tenancy\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceModulesTest extends TestCase
{
    use RefreshDatabase;

    protected Business $business;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->business = Business::create([
            'name' => 'Caftan Royal',
            'slug' => 'caftan-royal',
            'city' => 'Casablanca',
            'status' => 'active',
        ]);

        $plan = SubscriptionPlan::create([
            'name' => 'Professional',
            'slug' => 'professional',
            'price_mad' => 499,
            'messages_limit' => 3000,
        ]);

        Subscription::create([
            'business_id' => $this->business->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        $this->user = User::create([
            'name' => 'Owner',
            'email' => 'owner@jawebni.ma',
            'password' => bcrypt('password123'),
            'current_business_id' => $this->business->id,
        ]);

        $this->user->businesses()->attach($this->business->id, ['role' => 'owner']);
    }

    public function test_all_workspace_pages_render(): void
    {
        $this->actingAs($this->user);

        foreach (['/pulse', '/inbox', '/ai-studio', '/agents', '/customers', '/booking', '/automation', '/campaigns', '/analytics', '/settings'] as $uri) {
            $this->get($uri)->assertStatus(200);
        }
    }

    public function test_owner_can_create_a_booking_with_service_and_staff(): void
    {
        $this->actingAs($this->user);

        $this->post('/booking/services', [
            'name' => 'جلسة قياس',
            'price' => 0,
            'duration_minutes' => 45,
        ])->assertStatus(302);

        $this->post('/booking/staff', [
            'name' => 'سارة',
            'role_title' => 'Styliste',
        ])->assertStatus(302);

        $this->post('/booking/store', [
            'customer_name' => 'فاطمة الزهراء',
            'customer_phone' => '+212661223344',
            'booking_datetime' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'notes' => 'تجربة القفطان الأخضر',
        ])->assertStatus(302);

        $this->assertDatabaseHas('bookings', [
            'business_id' => $this->business->id,
            'status' => 'confirmed',
        ]);

        $this->assertDatabaseHas('customers', [
            'business_id' => $this->business->id,
            'phone' => '+212661223344',
        ]);
    }

    public function test_campaign_can_be_created_and_launched(): void
    {
        $this->actingAs($this->user);

        $this->post('/campaigns/templates', [
            'name' => 'عرض الخريف',
            'whatsapp_template_name' => 'autumn_promo_2026',
            'language' => 'ar',
            'body_text' => 'مرحباً {{1}} خصم 15% فقط هذا الأسبوع!',
        ])->assertStatus(302);

        $this->post('/campaigns/store', [
            'name' => 'حملة زبناء كازا',
            'target_segment' => 'all_customers',
        ])->assertStatus(302);

        $this->assertDatabaseHas('campaigns', [
            'business_id' => $this->business->id,
            'name' => 'حملة زبناء كازا',
            'status' => 'scheduled',
        ]);

        $campaign = \App\Modules\Campaigns\Models\Campaign::first();

        $this->post("/campaigns/{$campaign->id}/launch")->assertStatus(302);

        // No live WhatsApp account is connected in tests: the campaign stays scheduled.
        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'status' => 'scheduled',
        ]);
    }

    public function test_workflow_can_be_created_toggled_and_deleted(): void
    {
        $this->actingAs($this->user);

        $this->post('/automation/store', [
            'name' => 'متابعة الزبناء الساكتين',
            'trigger_type' => 'inactive_7d',
        ])->assertStatus(302);

        $workflow = \App\Modules\Workflow\Models\Workflow::first();
        $this->assertTrue((bool) $workflow->is_active);

        $this->post("/automation/{$workflow->id}/toggle")->assertStatus(302);
        $this->assertFalse((bool) $workflow->fresh()->is_active);

        $this->delete("/automation/{$workflow->id}")->assertStatus(302);
        $this->assertDatabaseMissing('workflows', ['id' => $workflow->id]);
    }

    public function test_agents_control_room_updates_agent_instructions(): void
    {
        $this->actingAs($this->user)
            ->get('/agents')
            ->assertStatus(200);

        $this->assertDatabaseHas('ai_agents', [
            'business_id' => $this->business->id,
            'type' => 'sales',
        ]);

        $agent = \App\Modules\Agents\Models\AIAgent::where('business_id', $this->business->id)
            ->where('type', 'sales')
            ->first();

        $this->post("/agents/{$agent->id}", [
            'instructions' => 'ركز على الدفع عند الاستلام واقترح المقاس المناسب.',
            'status' => 'paused',
        ])->assertStatus(302);

        $this->assertDatabaseHas('ai_agents', [
            'id' => $agent->id,
            'status' => 'paused',
        ]);
    }

    public function test_settings_page_shows_plans_and_usage(): void
    {
        $this->actingAs($this->user)
            ->get('/settings')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Settings/Index')
                ->has('plans')
                ->has('usage')
            );
    }
}
