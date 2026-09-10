<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Agents\Models\AIAgent;
use App\Modules\Agents\Services\AgentRouterService;
use App\Modules\Tenancy\Models\Business;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase5AgentsTest extends TestCase
{
    use RefreshDatabase;

    public function test_intent_router_classifies_messages_correctly(): void
    {
        $router = new AgentRouterService();

        // 1. Complaint
        $r1 = $router->routeMessage('عندي شكوى واسترجاع فلوسي للطلب!');
        $this->assertEquals('complaint', $r1['agent_type']);
        $this->assertTrue($r1['requires_handoff']);

        // 2. Booking
        $r2 = $router->routeMessage('بغيت نحجز موعد للقياس يوم الجمعة مع 16:00');
        $this->assertEquals('booking', $r2['agent_type']);
        $this->assertFalse($r2['requires_handoff']);

        // 3. Sales
        $r3 = $router->routeMessage('شحال الثمن ديال القفطان الملكي بالصقلي؟');
        $this->assertEquals('sales', $r3['agent_type']);

        // 4. Support
        $r4 = $router->routeMessage('فين وصل الكولي ديالي في أمانة؟');
        $this->assertEquals('support', $r4['agent_type']);

        // 5. FAQ
        $r5 = $router->routeMessage('السلام عليكم ورحمة الله');
        $this->assertEquals('faq', $r5['agent_type']);
    }

    public function test_agent_model_creation_and_tenant_scoping(): void
    {
        $business = Business::create([
            'name' => 'Caftan Store',
            'slug' => 'caftan-store',
        ]);

        $agent = AIAgent::create([
            'business_id' => $business->id,
            'type' => 'sales',
            'name' => 'Sales Agent',
            'purpose' => 'المبيعات والعروض المباشرة',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('ai_agents', [
            'business_id' => $business->id,
            'type' => 'sales',
            'name' => 'Sales Agent',
        ]);
    }
}