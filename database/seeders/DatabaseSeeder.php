<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Agents\Models\AIAgent;
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
use App\Modules\RAG\Models\KnowledgeChunk;
use App\Modules\RAG\Models\KnowledgeDocument;
use App\Modules\Tenancy\Models\Business;
use App\Modules\Tenancy\Models\BusinessSetting;
use App\Modules\WhatsAppBot\Models\Conversation;
use App\Modules\WhatsAppBot\Models\HumanHandoffLog;
use App\Modules\WhatsAppBot\Models\Message;
use App\Modules\WhatsAppBot\Models\WhatsAppAccount;
use App\Modules\Workflow\Models\Workflow;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin Bank Settings (Configurable RIB/IBAN)
        $bankSetting = SuperAdminBankSetting::create([
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

        $enterprisePlan = SubscriptionPlan::create([
            'id' => (string) Str::uuid(),
            'name' => 'باقة المؤسسات (Enterprise)',
            'slug' => 'enterprise',
            'price_mad' => 1499.00,
            'messages_limit' => 20000,
            'numbers_limit' => 5,
            'features' => ['رسائل غير محدودة', 'أرقام متعددة', 'ربط مع ERP و Shopify', 'White-Label ودعم VIP مخصص'],
            'is_popular' => false,
        ]);

        // 3. Create Main Demo Business in Casablanca
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
            ]
        ]);

        // 4. Create Main User (Saeed - Moroccan Business Owner)
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

        // 5. Active Subscription
        Subscription::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'plan_id' => $proPlan->id,
            'status' => 'active',
            'starts_at' => now(),
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

        // 7. Booking Services & Staff
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

        // 8. Customer & Booking
        $c1 = Customer::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'name' => 'فاطمة الزهراء العمراني',
            'phone' => '+212661223344',
            'city' => 'Casablanca',
            'lead_score' => 96,
            'lifetime_value' => 3800.00,
            'total_orders' => 2,
            'tags' => ['VIP', 'Caftan Lover', 'Casablanca Anfa'],
            'ai_memory' => [
                'preferred_size' => 'Taille 38 (M)',
                'favorite_color' => 'Vert Émeraude',
                'wedding_date' => 'أكتوبر 2026',
            ],
            'last_seen_at' => now(),
        ]);

        Booking::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'customer_id' => $c1->id,
            'service_id' => $service1->id,
            'staff_member_id' => $staff1->id,
            'booking_datetime' => Carbon::now()->addDays(2)->setHour(16)->setMinute(0),
            'status' => 'confirmed',
            'booked_via' => 'whatsapp_ai',
            'notes' => 'الزبونة ترغب في تجربة اللون الأخضر الملكي',
        ]);

        // 9. Workflows
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

        // 10. Campaigns
        $template = CampaignTemplate::create([
            'id' => (string) Str::uuid(),
            'business_id' => $business->id,
            'name' => 'عروض قفطان العروسة للخريف',
            'whatsapp_template_name' => 'autumn_caftan_promo_2026',
            'language' => 'darija',
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

        // 11. Bank Transfer Payment for Review
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
    }
}