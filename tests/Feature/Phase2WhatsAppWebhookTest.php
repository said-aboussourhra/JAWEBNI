<?php

namespace Tests\Feature;

use App\Modules\CRM\Models\Customer;
use App\Modules\Tenancy\Models\Business;
use App\Modules\WhatsAppBot\Models\Conversation;
use App\Modules\WhatsAppBot\Models\HumanHandoffLog;
use App\Modules\WhatsAppBot\Models\Message;
use App\Modules\WhatsAppBot\Models\WhatsAppAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase2WhatsAppWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_challenge_verification(): void
    {
        $response = $this->get('/api/webhook/whatsapp?hub_mode=subscribe&hub_verify_token=jawebni_webhook_secret_2026&hub_challenge=CHALLENGE_STRING_12345');

        $response->assertStatus(200);
        $this->assertEquals('CHALLENGE_STRING_12345', $response->getContent());
    }

    public function test_inbound_message_creates_customer_and_conversation(): void
    {
        $business = Business::create([
            'name' => 'Morocco Store',
            'slug' => 'morocco-store',
            'phone_number' => '+212661000001',
        ]);

        $account = WhatsAppAccount::create([
            'business_id' => $business->id,
            'phone_number' => '+212661000001',
            'phone_number_id' => 'PHONE_ID_TEST_01',
            'access_token' => 'MOCK_TOKEN',
            'verify_token' => 'jawebni_webhook_secret_2026',
        ]);

        $payload = [
            'entry' => [
                [
                    'changes' => [
                        [
                            'field' => 'messages',
                            'value' => [
                                'metadata' => [
                                    'phone_number_id' => 'PHONE_ID_TEST_01',
                                ],
                                'contacts' => [
                                    ['profile' => ['name' => 'Soukaina Alami']],
                                ],
                                'messages' => [
                                    [
                                        'id' => 'wamid.HBgLMTIzNDU2Nzg5',
                                        'from' => '212661998877',
                                        'type' => 'text',
                                        'text' => ['body' => 'السلام عليكم واش كاين توصيل للرباط؟'],
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/api/webhook/whatsapp', $payload);
        $response->assertStatus(200);

        // Verify customer created
        $this->assertDatabaseHas('customers', [
            'business_id' => $business->id,
            'phone' => '212661998877',
            'name' => 'Soukaina Alami',
        ]);

        // Verify message stored
        $this->assertDatabaseHas('messages', [
            'business_id' => $business->id,
            'body' => 'السلام عليكم واش كاين توصيل للرباط؟',
            'sender_type' => 'customer',
        ]);
    }

    public function test_complaint_triggers_human_handoff(): void
    {
        $business = Business::create([
            'name' => 'Morocco Store',
            'slug' => 'morocco-store',
            'phone_number' => '+212661000001',
        ]);

        WhatsAppAccount::create([
            'business_id' => $business->id,
            'phone_number' => '+212661000001',
            'phone_number_id' => 'PHONE_ID_TEST_01',
            'access_token' => 'MOCK_TOKEN',
            'verify_token' => 'jawebni_webhook_secret_2026',
        ]);

        $payload = [
            'entry' => [
                [
                    'changes' => [
                        [
                            'field' => 'messages',
                            'value' => [
                                'metadata' => [
                                    'phone_number_id' => 'PHONE_ID_TEST_01',
                                ],
                                'contacts' => [
                                    ['profile' => ['name' => 'Karim']],
                                ],
                                'messages' => [
                                    [
                                        'id' => 'wamid.HBgLMTIzNDU2Nzg5OTk',
                                        'from' => '212661112233',
                                        'type' => 'text',
                                        'text' => ['body' => 'عندي شكوى واسترجاع مالي للطلب!'],
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/api/webhook/whatsapp', $payload);
        $response->assertStatus(200);

        // Verify human handoff record created
        $this->assertDatabaseHas('human_handoff_logs', [
            'business_id' => $business->id,
            'reason' => 'customer_complaint',
            'status' => 'pending',
        ]);
    }
}
