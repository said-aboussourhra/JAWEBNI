<?php

namespace Database\Seeders;

use App\Modules\AIEngine\Models\AIPersonality;
use App\Modules\AIEngine\Models\AITestRun;
use App\Modules\AIEngine\Models\KnowledgeItem;
use App\Modules\AIEngine\Services\EmbeddingService;
use App\Modules\Agents\Models\AIAgent;
use App\Modules\Agents\Models\AgentExecutionLog;
use App\Modules\Billing\Models\BankTransferPayment;
use App\Modules\Billing\Models\Subscription;
use App\Modules\Billing\Models\SubscriptionPlan;
use App\Modules\Billing\Models\SuperAdminBankSetting;
use App\Modules\Booking\Models\Booking;
use App\Modules\Booking\Models\Service;
use App\Modules\Booking\Models\StaffMember;
use App\Modules\Campaigns\Models\Campaign;
use App\Modules\Campaigns\Models\CampaignTemplate;
use App\Modules\CRM\Models\Customer;
use App\Modules\CRM\Models\CustomerNote;
use App\Modules\RAG\Models\KnowledgeChunk;
use App\Modules\RAG\Models\KnowledgeDocument;
use App\Modules\Tenancy\Models\Business;
use App\Modules\Tenancy\Models\BusinessSetting;
use App\Modules\WhatsAppBot\Models\Conversation;
use App\Modules\WhatsAppBot\Models\HumanHandoffLog;
use App\Modules\WhatsAppBot\Models\Message;
use App\Modules\WhatsAppBot\Models\WhatsAppAccount;
use App\Modules\Workflow\Models\Workflow;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin Bank Settings (Configurable RIB/IBAN)
        SuperAdminBankSetting::create([
            'id' => (string) Str::uuid(),
            'bank_name' => 'Attijariwafa Bank (التجاري وفا بنك)',
            'account_holder' => 'JAWEBNI MOROCCO SARL AU',
            'rib' => '007 780 0001234567890123 45',
            'iban' => 'MA64 007 780 0001234567890123 45',
            'swift_bic' => 'BCMAMAMC',
            'instructions' => 'يرجى إرسال التحويل البنكي وإدراج رمز المرجع (Payment Reference) في خانة الملاحظات، ثم رفع صورة التوصيل لتفعيل الاشتراك تلقائياً.',
            'is_active' => true,
        ]);

        // 2. Subscription Plans
        $basicPlan = SubscriptionPlan::create([
            'id' => (string) Str::uuid(),
            'name' => 'الباقة الأساسية (Basic)',
            'slug' => 'basic',
            'price_mad' => 199.00,
            'messages_limit' => 500,
            'numbers_limit' => 1,
            'features' => ['رقم واتساب واحد معتمد', '500 رسالة ذكية شهرياً', 'قاعدة المعرفة بالدارجة', 'دعم فني سريع'],
            'is_popular' => false,
        ]);

        $proPlan = SubscriptionPlan::create([
            'id' => (string) Str::uuid(),
            'name' => 'الباقة الاحترافية (Professional)',
            'slug' => 'professional',
            'price_mad' => 499.00,
            'messages_limit' => 3000,
            'numbers_limit' => 1,
            'features' => ['3,000 رسالة ذكية شهرياً', 'رفع الكتالوجات والمستندات RAG', 'نظام المواعيد والحجوزات', 'مسارات الأتمتة التفاعلية', 'إطلاق الحملات التسويقية'],
            'is_popular' => true,
        ]);

        SubscriptionPlan::create([
            'id' => (string) Str::uuid(),
            'name' => 'باقة المؤسسات (Enterprise)',
            'slug' => 'enterprise',
            'price_mad' => 1499.00,
            'messages_limit' => 20000,
            'numbers_limit' => 5,
            'features' => ['رسائل غير محدودة', 'أرقام متعددة', 'ربط مع ERP و Shopify', 'White-Label ودعم VIP مخصص'],
            'is_popular' => false,
        ]);

        // 3. Main Demo Business in Casablanca
        $business = Business::create([
            'id' => (string) Str::uuid(),
            'name' => 'Artisanat Marocain & Caftan Luxe',
            'slug' => 'artisanat-marocain',
            'phone_number' => '+212661000001',
            'city' => 'Casablanca',
            'country' => 'Morocco',
            'currency' => 'MAD',
            'default_language' => 'darija',
            'primary_color' => '#0F9D8C',
            'status' => 'active',
            'onboarding_completed' => true,
            'onboarding_step' => 5,
            'ai_readiness_score' => 96,
            'onboarding_data' => [
                'business_type' => 'retail_ecommerce',
                'products' => ['Caftan Royal Zellige', 'Djellaba Moderne Soie', 'Babouches Cuir Fès'],
                'delivery_cities' => ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir'],
                'delivery_price' => '35 MAD (Gratuit à partir de 500 MAD)',
                'payment_methods' => ['Cash on Delivery (Paiement à la livraison)', 'Virement Bancaire (CIH / Attijariwafa)'],
            ],
        ]);

        BusinessSetting::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'key' => 'ai_provider',
            'value' => config('ai.default_provider', 'openai'),
        ]);

        BusinessSetting::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'key' => 'working_hours',
            'value' => 'Lundi - Samedi • 10:00 - 19:00',
        ]);

        // 4. Main User (Saeed - Moroccan Business Owner)
        $user = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'سعيد المنصوري (Saeed)',
            'email' => 'said@jawebni.ma',
            'phone' => '+212661000001',
            'password' => Hash::make('password123'),
            'current_business_id' => $business->id,
            'role' => 'owner',
            'is_super_admin' => true,
            'preferred_locale' => 'ar',
            'two_factor_enabled' => false,
        ]);
        $user->businesses()->attach($business->id, ['role' => 'owner']);

        // Demo agent account (non-admin) to showcase role separation
        $agent = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'سارة التازي (Conseillère)',
            'email' => 'sara@jawebni.ma',
            'phone' => '+212661889900',
            'password' => Hash::make('password123'),
            'current_business_id' => $business->id,
            'role' => 'agent',
            'is_super_admin' => false,
            'preferred_locale' => 'ar',
        ]);
        $agent->businesses()->attach($business->id, ['role' => 'agent']);

        // 5. Active Subscription
        Subscription::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'plan_id' => $proPlan->id,
            'status' => 'active',
            'starts_at' => now()->startOfMonth(),
            'ends_at' => now()->addMonths(1),
        ]);

        // 6. WhatsApp Account
        $waAccount = WhatsAppAccount::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'phone_number' => '+212661000001',
            'phone_number_id' => 'PHONE_NUM_ID_CASABLANCA',
            'waba_id' => 'WABA_ID_JAWEBNI_01',
            'access_token' => 'EAAG_MOCK_TOKEN_MOROCCO',
            'verify_token' => 'jawebni_webhook_secret_2026',
            'status' => 'connected',
            'quality_rating' => 'GREEN',
        ]);

        // 7. AI Personality
        AIPersonality::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'communication_style' => 'friendly_moroccan',
            'darija_ratio' => 70,
            'arabic_ratio' => 20,
            'french_ratio' => 10,
            'response_length' => 'short_whatsapp',
            'trait_helpfulness' => 92,
            'trait_persuasiveness' => 80,
            'trait_friendliness' => 95,
            'custom_instructions' => 'استعمل دائماً لهجة مغربية محترمة، واقترح الدفع عند الاستلام عند تأكيد الطلبية.',
        ]);

        // 8. Specialised Agents
        $agents = [];
        foreach ($this->defaultAgents() as $definition) {
            $agents[$definition['type']] = AIAgent::create(array_merge($definition, [
                'id' => (string) Str::uuid(),
                'business_id' => $business->id,
                'status' => 'active',
            ]));
        }

        // 9. Knowledge base (Q&A) + RAG document with real embeddings
        foreach ($this->knowledgeItems() as $item) {
            KnowledgeItem::create(array_merge($item, [
                'id' => (string) Str::uuid(),
                'business_id' => $business->id,
                'source' => 'manual',
                'confidence_score' => 98,
            ]));
        }

        $this->seedKnowledgeDocument($business->id);

        // 10. Booking Services & Staff
        $service1 = Service::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'name' => 'جلسة قياس واستشارة قفطان العروسة',
            'description' => 'جلسة خاصة لتحديد المقاسات واختيار الأثواب والتطريز الصقلي الحر',
            'price' => 0.00,
            'duration_minutes' => 45,
            'color' => '#0F9D8C',
        ]);

        $service2 = Service::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'name' => 'استلام وتجربة الطلبية في المحل',
            'description' => 'تجربة القفطان والتأكد من المقاس النهائي قبل الاستلام',
            'price' => 0.00,
            'duration_minutes' => 30,
            'color' => '#6C63FF',
        ]);

        $staff1 = StaffMember::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'name' => 'سارة التازي (Styliste)',
            'phone' => '+212661889900',
            'role_title' => 'مستشارة أزياء وتصميم',
            'is_active' => true,
        ]);

        // 11. Customers
        $customers = [];
        foreach ($this->customers() as $data) {
            $customers[] = Customer::create(array_merge($data, [
                'id' => (string) Str::uuid(),
                'business_id' => $business->id,
                'last_seen_at' => now()->subMinutes(rand(5, 500)),
            ]));
        }

        CustomerNote::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'customer_id' => $customers[0]->id,
            'user_id' => $user->id,
            'content' => 'الزبونة تفضل القفطان الملكي بالأخضر الزمردي، ومقاسها 38 (M).',
            'type' => 'staff',
        ]);

        // 12. Conversations & Messages (AI + customer turns)
        $this->seedConversations($business->id, $waAccount->id, $customers, $agents, $user->id);

        // 13. Bookings
        Booking::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'customer_id' => $customers[0]->id,
            'service_id' => $service1->id,
            'staff_member_id' => $staff1->id,
            'booking_datetime' => Carbon::now()->addDays(2)->setHour(16)->setMinute(0),
            'status' => 'confirmed',
            'booked_via' => 'whatsapp_ai',
            'notes' => 'الزبونة ترغب في تجربة اللون الأخضر الملكي',
        ]);

        Booking::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'customer_id' => $customers[1]->id,
            'service_id' => $service2->id,
            'staff_member_id' => $staff1->id,
            'booking_datetime' => Carbon::now()->addDays(1)->setHour(11)->setMinute(30),
            'status' => 'confirmed',
            'booked_via' => 'manual',
            'notes' => 'استلام الطلبية رقم 2026-104',
        ]);

        // 14. Workflows
        Workflow::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'name' => 'متابعة نية الشراء الفورية (Hot Leads Follow-up)',
            'description' => 'عندما يكتشف AI نية شراء عالية، يتم إرسال رابط الدفع المباشر وتنبيه فريق المبيعات',
            'trigger_type' => 'purchase_intent',
            'is_active' => true,
            'execution_count' => 84,
        ]);

        Workflow::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'name' => 'تأكيد الحجز وتذكير WhatsApp تلقائياً',
            'description' => 'إرسال رسالة تذكير للزبون قبل 24 ساعة من موعد جلسة القياس في المحل',
            'trigger_type' => 'booking_created',
            'is_active' => true,
            'execution_count' => 42,
        ]);

        // 15. Campaigns
        $template = CampaignTemplate::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'name' => 'عروض قفطان العروسة للخريف',
            'whatsapp_template_name' => 'autumn_caftan_promo_2026',
            'language' => 'ar',
            'category' => 'marketing',
            'status' => 'approved',
            'body_text' => 'مرحباً {{1}} 🌸 بمناسبة الموسم الجديد، استمتعي بخصم 15% على تشكيلة القفطان الملكي مع شحن مجاني لكافة المدن!',
        ]);

        Campaign::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'template_id' => $template->id,
            'name' => 'حملة زبائن كازا والرباط VIP',
            'target_segment' => 'vip_customers',
            'status' => 'completed',
            'total_recipients' => 180,
            'delivered_count' => 176,
            'read_count' => 152,
            'replied_count' => 48,
        ]);

        // 16. Bank Transfer Payment for Review
        BankTransferPayment::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'plan_id' => $proPlan->id,
            'reference_code' => 'JW-CAFTAN99',
            'amount' => 499.00,
            'currency' => 'MAD',
            'status' => 'pending_review',
            'created_at' => now()->subHours(2),
        ]);

        // 17. AI Test Lab history
        AITestRun::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'user_id' => $user->id,
            'input_prompt' => 'شحال ثمن القفطان الملكي وواش كاين التوصيل للرباط؟',
            'output_response' => 'أهلاً وسهلاً! أثمنة القفطان الملكي بالصقلي كتبدا من 1,850 درهم، والتوصيل للرباط متوفر خلال 24 ساعة بـ35 درهم فقط.',
            'detected_intent' => 'purchase_inquiry',
            'selected_agent' => 'Sales Agent (وكيل المبيعات والعروض)',
            'knowledge_source' => 'كتالوج الأسعار 2026 (PDF) • سياسة التوصيل',
            'confidence_score' => 96,
            'suggested_action' => 'عرض الأسعار وإمكانية الطلب المباشر',
        ]);

        // 18. Second demo tenant (shows tenant switching)
        $this->seedSecondTenant($user->id);
    }

    protected function defaultAgents(): array
    {
        return [
            ['type' => 'sales', 'name' => 'Sales Agent', 'purpose' => 'تحويل الاستفسارات إلى مبيعات مؤكدة واقتراح المقاسات وروابط الدفع', 'instructions' => 'الترحيب الحار بالدارجة المغربية، عرض الأسعار من الكتالوج، واقتراح تأكيد الطلبية فورا مع الدفع عند الاستلام.', 'conversations_handled' => 142, 'success_rate' => 96, 'handoff_rate' => 4],
            ['type' => 'booking', 'name' => 'Booking Agent', 'purpose' => 'حجز وإدارة مواعيد القياس في المحل مع الزبائن', 'instructions' => 'اقتراح المواعيد المتاحة من الإثنين إلى السبت من 10:00 إلى 19:00 وتأكيد الموعد برسالة واتساب.', 'conversations_handled' => 68, 'success_rate' => 94, 'handoff_rate' => 6],
            ['type' => 'support', 'name' => 'Support Agent', 'purpose' => 'تتبع الشحنات وأوقات العمل ومساعدة الزبائن', 'instructions' => 'تزويد الزبون برقم تتبع الإرسالية مع شركة أمانة إكسبريس ومدة التوصيل المتبقية.', 'conversations_handled' => 51, 'success_rate' => 91, 'handoff_rate' => 9],
            ['type' => 'complaint', 'name' => 'Complaint Agent', 'purpose' => 'التهدئة والتحويل الفوري للتدخل البشري عند وجود شكوى أو طلب استرجاع', 'instructions' => 'الاعتذار اللبق للزبون وتحويل المحادثة فورا للمسؤول البشري مع وضع علامة عاجل.', 'conversations_handled' => 17, 'success_rate' => 88, 'handoff_rate' => 85],
            ['type' => 'faq', 'name' => 'FAQ Agent', 'purpose' => 'الإجابة على الأسئلة العامة والعناوين وطرق التواصل', 'instructions' => 'تقديم معلومات المتجر والمدينة وأوقات العمل بدقة.', 'conversations_handled' => 96, 'success_rate' => 97, 'handoff_rate' => 3],
        ];
    }

    protected function knowledgeItems(): array
    {
        return [
            ['question' => 'واش كاين التوصيل للرباط ومراكش؟', 'answer' => 'نعم، التوصيل متوفر لجميع المدن المغربية خلال 24 إلى 48 ساعة.', 'category' => 'delivery', 'language' => 'darija'],
            ['question' => 'شحال ثمن التوصيل؟', 'answer' => 'ثمن التوصيل 35 درهم، ومجاني للطلبيات التي تفوق 500 درهم.', 'category' => 'delivery', 'language' => 'darija'],
            ['question' => 'كيفاش كنخلص؟', 'answer' => 'الدفع نقداً عند الاستلام (Cash on Delivery) أو تحويل بنكي CIH / Attijariwafa.', 'category' => 'payment', 'language' => 'darija'],
            ['question' => 'واش نقدر نبدل المقاس؟', 'answer' => 'نعم، يمكن استبدال المقاس خلال 7 أيام من تاريخ الاستلام بشرط الحفاظ على الحالة الأصلية.', 'category' => 'returns', 'language' => 'darija'],
            ['question' => 'شحال ثمن القفطان الملكي؟', 'answer' => 'أثمنة القفطان الملكي بالصقلي كتبدا من 1,850 درهم حسب التطريز والثوب.', 'category' => 'pricing', 'language' => 'darija'],
            ['question' => 'شحال ثمن الجلابة العصرية؟', 'answer' => 'الجلابة العصرية بالرندة كتبدا من 650 درهم.', 'category' => 'pricing', 'language' => 'darija'],
            ['question' => 'واش كاين توصيل لبرّا المغرب؟', 'answer' => 'حالياً التوصيل داخل المغرب فقط، والتوصيل الدولي متاح قريباً إن شاء الله.', 'category' => 'delivery', 'language' => 'darija'],
            ['question' => 'أشنو هي أوقات العمل ديال المحل؟', 'answer' => 'المحل مفتوح من الإثنين إلى السبت، من 10:00 صباحاً إلى 19:00 مساءً.', 'category' => 'general', 'language' => 'darija'],
        ];
    }

    protected function customers(): array
    {
        return [
            [
                'name' => 'فاطمة الزهراء العمراني',
                'phone' => '+212661223344',
                'city' => 'Casablanca',
                'preferred_language' => 'darija',
                'lead_score' => 96,
                'lifetime_value' => 3800.00,
                'total_orders' => 2,
                'tags' => ['VIP', 'Caftan Lover', 'Casablanca Anfa'],
                'ai_memory' => [
                    'preferred_size' => 'Taille 38 (M)',
                    'favorite_color' => 'Vert Émeraude',
                    'wedding_date' => 'أكتوبر 2026',
                ],
            ],
            [
                'name' => 'أحمد الإدريسي',
                'phone' => '+212663998877',
                'city' => 'Rabat',
                'preferred_language' => 'darija',
                'lead_score' => 82,
                'lifetime_value' => 1850.00,
                'total_orders' => 1,
                'tags' => ['Rabat', 'Caftan Lover'],
                'ai_memory' => ['preferred_size' => 'Taille 40 (L)', 'favorite_color' => 'Bleu Majorelle'],
            ],
            [
                'name' => 'ياسمين بناني',
                'phone' => '+212664556677',
                'city' => 'Marrakech',
                'preferred_language' => 'fr',
                'lead_score' => 74,
                'lifetime_value' => 1200.00,
                'total_orders' => 1,
                'tags' => ['Marrakech', 'Djellaba'],
                'ai_memory' => ['preferred_size' => 'Taille 36 (S)', 'favorite_color' => 'Rose poudré'],
            ],
            [
                'name' => 'محمد العلمي',
                'phone' => '+212660112233',
                'city' => 'Tanger',
                'preferred_language' => 'darija',
                'lead_score' => 41,
                'lifetime_value' => 650.00,
                'total_orders' => 1,
                'tags' => ['Needs Attention', 'Tanger'],
                'ai_memory' => ['last_issue' => 'تأخير في التوصيل'],
            ],
            [
                'name' => 'ليلى العمراني',
                'phone' => '+212662334455',
                'city' => 'Casablanca',
                'preferred_language' => 'fr',
                'lead_score' => 88,
                'lifetime_value' => 7400.00,
                'total_orders' => 4,
                'tags' => ['VIP', 'Casablanca'],
                'ai_memory' => ['preferred_size' => 'Taille 38 (M)', 'favorite_color' => 'Or'],
            ],
            [
                'name' => 'ياسين الفاسي',
                'phone' => '+212667889900',
                'city' => 'Fès',
                'preferred_language' => 'darija',
                'lead_score' => 92,
                'lifetime_value' => 0.00,
                'total_orders' => 0,
                'tags' => ['Fès', 'Hot Lead'],
                'ai_memory' => ['interest' => 'قفطان عروسة + بلغة فاس'],
            ],
        ];
    }

    protected function seedKnowledgeDocument(string $businessId): void
    {
        $document = KnowledgeDocument::create([
            'id' => (string) Str::uuid(),
            'business_id' => $businessId,
            'title' => 'كتالوج الأسعار 2026 — Caftan & Djellaba',
            'file_name' => 'catalogue-2026.txt',
            'file_path' => 'knowledge_docs/'.$businessId.'/catalogue-2026.txt',
            'mime_type' => 'text/plain',
            'file_size_bytes' => 2048,
            'pages_count' => 3,
            'chunks_count' => 0,
            'extraction_confidence' => 96,
            'status' => 'indexed',
        ]);

        $embeddings = app(EmbeddingService::class);

        foreach ($this->catalogueChunks() as $index => $chunk) {
            KnowledgeChunk::create([
                'id' => (string) Str::uuid(),
                'business_id' => $businessId,
                'document_id' => $document->id,
                'chunk_index' => $index,
                'content' => $chunk,
                'token_count' => count(preg_split('/\s+/u', trim($chunk)) ?: []),
                'embedding' => $embeddings->embed($chunk),
                'metadata' => ['source_file' => 'catalogue-2026.txt', 'chunk_num' => $index + 1],
            ]);
        }

        $document->update(['chunks_count' => count($this->catalogueChunks())]);
    }

    protected function catalogueChunks(): array
    {
        return [
            'كتالوج 2026 — القفطان الملكي: قفطان ملكي بالصقلي الحر والزليج الفاسي يبدأ من 1,850 درهم حسب التطريز ونوع الثوب. قفطان العروسة الفاخر يبدأ من 2,600 درهم مع طرز يدوي كامل.',
            'الجلابة العصرية بالرندة تبدأ من 650 درهم، والجلابة الفاسية المطرزة تبدأ من 890 درهم. المقاسات المتوفرة من S إلى XL مع إمكانية التفصيل حسب المقاس.',
            'البلغة الفاسية الجلدية الأصيلة بـ290 درهم، والشربيل المطرز بـ340 درهم. الطلبات التي تفوق 500 درهم يستفيد أصحابها من التوصيل المجاني لكافة المدن.',
        ];
    }

    protected function seedConversations(string $businessId, string $accountId, array $customers, array $agents, string $userId): void
    {
        $threads = [
            [
                'customer' => 0,
                'status' => 'ai_handling',
                'intent' => 'purchase_inquiry',
                'intent_confidence' => 96,
                'sentiment' => 'positive',
                'priority' => 'normal',
                'agent' => 'sales',
                'messages' => [
                    ['sender_type' => 'customer', 'body' => 'السلام عليكم، شحال ثمن القفطان الملكي بالصقلي؟'],
                    ['sender_type' => 'ai', 'body' => 'وعليكم السلام أهلاً وسهلاً! أثمنة القفطان الملكي بالصقلي كتبدا من 1,850 درهم، والتوصيل مجاني لكازا. واش بغيتي نحجزو ليك مقاس؟'],
                    ['sender_type' => 'customer', 'body' => 'واش كاين اللون الأخضر الزمردي والمقاس 38؟'],
                    ['sender_type' => 'ai', 'body' => 'نعم متوفر اللون الأخضر الزمردي والمقاس 38 (M). نقدرو نحضروها ليك وتوصلوك خلال 24 ساعة بالدفع عند الاستلام.'],
                ],
            ],
            [
                'customer' => 1,
                'status' => 'ai_handling',
                'intent' => 'appointment_booking',
                'intent_confidence' => 98,
                'sentiment' => 'positive',
                'priority' => 'normal',
                'agent' => 'booking',
                'messages' => [
                    ['sender_type' => 'customer', 'body' => 'بغيت نحجز موعد للقياس يوم الجمعة مع 16:00'],
                    ['sender_type' => 'ai', 'body' => 'مرحباً بك! كاين إمكانية الجمعة مع 16:00 في محل كازا. كنأكدو ليك الموعد وغتوصلوك رسالة تذكير قبل 24 ساعة.'],
                ],
            ],
            [
                'customer' => 3,
                'status' => 'waiting_human',
                'intent' => 'complaint_escalation',
                'intent_confidence' => 45,
                'sentiment' => 'negative',
                'priority' => 'urgent',
                'agent' => 'complaint',
                'messages' => [
                    ['sender_type' => 'customer', 'body' => 'طلبي ما وصلش في الوقت المحدد وبغيت استرجاع فلوسي'],
                    ['sender_type' => 'system', 'body' => 'نعتذر لك على هذا الإزعاج 🙏 تم تحويل محادثتك إلى المسؤول وسيتواصل معك مباشرة على هذا الرقم.'],
                ],
            ],
            [
                'customer' => 4,
                'status' => 'human_handling',
                'intent' => 'order_support',
                'intent_confidence' => 93,
                'sentiment' => 'neutral',
                'priority' => 'high',
                'agent' => 'support',
                'messages' => [
                    ['sender_type' => 'customer', 'body' => 'فين وصلت الطلبية ديالي رقم 2026-104؟'],
                    ['sender_type' => 'ai', 'body' => 'الطلبية ديالك تسلمت لشركة أمانة إكسبريس وغتوصلك غدا إن شاء الله. نرسالو ليك رقم التتبع دابا.'],
                    ['sender_type' => 'human', 'body' => 'أهلاً ليلى، الطلبية وصلات لمراكش وغتوصلك غدا قبل 18:00. متشكرين على صبرك!'],
                ],
            ],
            [
                'customer' => 5,
                'status' => 'ai_handling',
                'intent' => 'general_faq',
                'intent_confidence' => 90,
                'sentiment' => 'positive',
                'priority' => 'normal',
                'agent' => 'faq',
                'messages' => [
                    ['sender_type' => 'customer', 'body' => 'أشنو هي أوقات العمل ديالكم وفين كاين المحل؟'],
                    ['sender_type' => 'ai', 'body' => 'المحل كاين في الدار البيضاء – أنفا، ومفتوح من الإثنين للسبت من 10:00 حتى 19:00. مرحباً بك!'],
                ],
            ],
        ];

        foreach ($threads as $thread) {
            $customer = $customers[$thread['customer']] ?? $customers[0];

            $conversation = Conversation::create([
                'id' => (string) Str::uuid(),
                'business_id' => $businessId,
                'customer_id' => $customer->id,
                'whatsapp_account_id' => $accountId,
                'status' => $thread['status'],
                'intent' => $thread['intent'],
                'intent_confidence' => $thread['intent_confidence'],
                'sentiment' => $thread['sentiment'],
                'priority' => $thread['priority'],
                'window_expires_at' => now()->addHours(24),
                'last_message_text' => end($thread['messages'])['body'] ?? '',
                'last_message_at' => now()->subMinutes(rand(2, 90)),
            ]);

            foreach ($thread['messages'] as $index => $message) {
                Message::create([
                    'id' => (string) Str::uuid(),
                    'business_id' => $businessId,
                    'conversation_id' => $conversation->id,
                    'customer_id' => $customer->id,
                    'sender_type' => $message['sender_type'],
                    'type' => 'text',
                    'body' => $message['body'],
                    'status' => $message['sender_type'] === 'customer' ? 'delivered' : 'sent',
                    'sent_by_user_id' => $message['sender_type'] === 'human' ? $userId : null,
                    'detected_intent' => $thread['intent'],
                    'ai_confidence' => $thread['intent_confidence'],
                    'created_at' => now()->subMinutes((count($thread['messages']) - $index) * 3),
                ]);
            }

            if ($thread['status'] === 'waiting_human') {
                HumanHandoffLog::create([
                    'id' => (string) Str::uuid(),
                    'business_id' => $businessId,
                    'conversation_id' => $conversation->id,
                    'reason' => 'customer_complaint',
                    'ai_confidence' => 45,
                    'status' => 'pending',
                ]);
            }

            if (isset($agents[$thread['agent']])) {
                AgentExecutionLog::create([
                    'id' => (string) Str::uuid(),
                    'business_id' => $businessId,
                    'agent_id' => $agents[$thread['agent']]->id,
                    'conversation_id' => $conversation->id,
                    'detected_intent' => $thread['intent'],
                    'confidence_score' => $thread['intent_confidence'],
                    'latency_ms' => rand(280, 900),
                    'handoff_triggered' => $thread['status'] === 'waiting_human',
                ]);
            }
        }
    }

    protected function seedSecondTenant(string $adminUserId): void
    {
        $business = Business::create([
            'id' => (string) Str::uuid(),
            'name' => 'Café & Pâtisserie Jnane — Marrakech',
            'slug' => 'jnane-marrakech',
            'phone_number' => '+212662000222',
            'city' => 'Marrakech',
            'country' => 'Morocco',
            'currency' => 'MAD',
            'default_language' => 'darija',
            'primary_color' => '#FF7A59',
            'status' => 'trial',
            'onboarding_completed' => false,
            'onboarding_step' => 2,
            'ai_readiness_score' => 38,
        ]);

        $owner = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'مريم بنصالح',
            'email' => 'mariam@jnane.ma',
            'phone' => '+212662000222',
            'password' => Hash::make('password123'),
            'current_business_id' => $business->id,
            'role' => 'owner',
            'is_super_admin' => false,
            'preferred_locale' => 'ar',
        ]);

        $owner->businesses()->attach($business->id, ['role' => 'owner']);

        // The platform admin can switch into this tenant as well.
        $admin = User::find($adminUserId);

        if ($admin) {
            $admin->businesses()->attach($business->id, ['role' => 'admin']);
        }
    }
}
