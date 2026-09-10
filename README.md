<p align="center">
  <strong style="font-size: 26px;">جاوبني — Jawebni</strong><br/>
  <em>موظفك الرقمي الذكي على واتساب للمقاولات المغربية</em><br/>
  <em>Votre employé IA sur WhatsApp pour les entreprises marocaines</em>
</p>

---

## ما هو جاوبني؟ | Qu'est-ce que Jawebni ?

**جاوبني (Jawebni)** هي منصة SaaS مغربية متعددة المستأجرين (Multi-tenant) تحوّل واتساب إلى **موظف رقمي ذكي**
يجاوب الزبناء بالدارجة المغربية، يحوّل المحادثات إلى مبيعات، يحجز المواعيد، ويطلق الحملات التسويقية — 24/7.

مبنية على **Laravel 12** (الباكند) و **React 19 + Inertia 2 + Tailwind 4** (الفرونتند)، مع محرك ذكاء اصطناعي
متعدد المزودين (OpenAI / Claude / Gemini) ونظام RAG لقاعدة المعرفة.

### الوحدات الأساسية | Modules

| الوحدة | المسار | الوصف |
|---|---|---|
| Business Pulse | `/pulse` | لوحة القيادة الحية: قصة اليوم، فرص البيع، نشاط الذكاء الاصطناعي |
| Inbox | `/inbox` | صندوق محادثات بثلاث لوحات مع تحديث تلقائي كل 5 ثوانٍ |
| AI Studio | `/ai-studio` | شخصية الموظف الذكي، قاعدة المعرفة (Q&A + مستندات)، مختبر الاختبار |
| Agents | `/agents` | غرفة تحكم الوكلاء الخمسة (مبيعات، حجوزات، دعم، شكاوى، أسئلة شائعة) |
| Customers | `/customers` | ذكاء العملاء وذاكرة الذكاء الاصطناعي لكل زبون |
| Booking | `/booking` | المواعيد، الخدمات، وفريق العمل |
| Automation | `/automation` | مسارات الأتمتة والمشغّلات |
| Campaigns | `/campaigns` | حملات واتساب، القوالب، وشرائح الزبناء |
| Analytics | `/analytics` | تحليلات حقيقية: حجم الرسائل، النوايا، أداء الوكلاء |
| Settings | `/settings` | الباقات، الاشتراك، التحويل البنكي (RIB / IBAN) |
| Admin | `/admin` | مركز تحكم السوبر أدمن (محمي بـ `super.admin`) |

---

## المتطلبات | Prérequis

* PHP 8.2+ مع امتدادات: `pdo_sqlite` (أو `pdo_mysql`)، `mbstring`، `zip`، `curl`
* Composer 2.x و Node.js 20+ (npm)
* حساب [Meta WhatsApp Cloud API](https://developers.facebook.com/apps) (اختياري للتجربة)
* مفتاح AI من OpenAI أو Anthropic أو Google (اختياري — يعمل النظام بدونه في الوضع التجريبي)

## التشغيل السريع | Démarrage rapide

```bash
git clone <repo> JAWEBNI && cd JAWEBNI

composer install
cp .env.example .env
php artisan key:generate

touch database/database.sqlite          # أو اضبط MySQL في .env
php artisan migrate --seed              # يزرع بيانات عرض مغربية كاملة

npm install && npm run build            # أو: npm run dev أثناء التطوير

php artisan serve                       # http://localhost:8000
php artisan queue:work                  # معالجة ردود الذكاء الاصطناعي والحملات
php artisan schedule:work               # تذكيرات المواعيد (24 ساعة قبل)
```

أو استعمال سكربت الإعداد الجاهز:

```bash
composer setup      # install + key + migrate + seed + npm build
composer dev        # يرفع السيرفر + الـ queue + السجلات + Vite معاً
```

**حساب الدخول التجريبي بعد `db:seed`:** `said@jawebni.ma` / `password123` (سوبر أدمن)
و `sara@jawebni.ma` / `password123` (مستخدمة عادية).

---

## الإعدادات البيئية | Variables d'environnement

كل المفاتيح موثّقة في `.env.example`. أهمها:

```dotenv
AI_PROVIDER=openai              # openai | claude | gemini
AI_FALLBACK_PROVIDER=gemini
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
AI_EMBEDDING_PROVIDER=openai    # للـ RAG (بدونه يعمل متجه محلي offline)

WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=jawebni_webhook_secret_2026
WHATSAPP_APP_SECRET=            # تفعيل التحقق من توقيع SHA-256
```

> بدون أي مفتاح AI يعمل النظام في **الوضع التجريبي (offline)**: الردود جاهزة محلياً والبحث الدلالي يعمل
> بمتجهات hashing محلية، فلا يتعطل العرض أبداً.

## ربط واتساب (Meta Cloud API)

1. أنشئ تطبيقاً على Meta for Developers وأضف منتج WhatsApp.
2. في **Webhook**، أدخل الرابط: `https://your-domain.com/api/webhook/whatsapp`
3. أدخل **Verify Token** المطابق لـ `WHATSAPP_VERIFY_TOKEN`.
4. اشترك في الحقل `messages` (و `message_status` لتحديثات التسليم).
5. احفظ `Phone Number ID` و `Access Token` (أو اربط رقمًا لكل نشاط تجاري من قاعدة البيانات).

الويب هوك **مستثنى من CSRF** ومحمى بتوقيع `X-Hub-Signature-256` عند ضبط `WHATSAPP_APP_SECRET`.

---

## البنية المعمارية | Architecture

```
app/
├── Core/                     # العزل بين المستأجرين، العقود، الـ Scope
│   ├── Contracts/            # AIProviderInterface, WhatsAppProviderInterface...
│   ├── Middleware/           # TenantContextMiddleware
│   ├── Scopes/TenantScope.php
│   ├── Tenancy/TenantManager.php
│   └── Traits/BelongsToTenant.php
├── Http/Middleware/          # HandleInertiaRequests, EnsureSuperAdmin, EnsureActiveSubscription, SetLocale
├── Jobs/                     # ProcessIncomingWhatsAppMessage, IndexKnowledgeDocument, SendCampaign, SendBookingReminder
└── Modules/
    ├── AIEngine/             # المزودون، مصنع المزودين، بناء الوعود، خدمة المحادثة، التضمينات
    ├── Agents/               # الوكلاء الخمسة + موجّه النوايا + سجل التنفيذ
    ├── RAG/                  # المستندات، المقاطع، الاستخراج، التقطيع، البحث الدلالي
    ├── WhatsAppBot/          # الويب هوك، الصندوق، مزود Meta Cloud، خدمة التوصيل
    ├── CRM/ · Booking/ · Campaigns/ · Workflow/ · Billing/ · Tenancy/ · Analytics/ · Business/ · Auth/
```

### مسار الرسالة الواردة

```
Meta Webhook → WebhookController (توقيع + تخزين)
             → ProcessIncomingWhatsAppMessage (Job)
                 → AgentRouterService   (تحديد النية والوكيل)
                 → RAGRetrievalService  (بحث دلالي في قاعدة المعرفة)
                 → PromptBuilderService (شخصية + وكيل + معرفة + ذاكرة الزبون)
                 → AIProviderFactory    (OpenAI / Claude / Gemini + احتياط)
                 → WhatsAppDeliveryService → Meta Cloud API
                 → AgentExecutionLog + UsageService (استهلاك الباقة)
```

### الأمان | Sécurité

* عزل تام للبيانات عبر `TenantScope` + `BelongsToTenant` + `TenantManager` (يعمل أيضاً داخل الـ Jobs).
* لوحة السوبر أدمن محمية بميدل وير `super.admin`.
* تحقق من توقيع الويب هوك، تحديد معدل الطلبات (Rate limiting)، والتحقق من حدود الاشتراك قبل كل رد ذكي.
* استعادة كلمة المرور عبر رابط بريدي مؤقت (جدول `password_reset_tokens`).

---

## الاختبارات | Tests

```bash
php artisan test                 # كل الاختبارات
php artisan test --filter=AIConversationPipeline
```

التغطية الحالية: عزل المستأجرين، الويب هوك (تحدي + توقيع + شكاوى)، محرك الذكاء الاصطناعي،
RAG والبحث الدلالي، الوكلاء، CRM، الفوترة والصلاحيات، وحدات مساحة العمل (حجوزات، حملات، أتمتة، تحليلات).

## النشر | Déploiement

```bash
# إنتاج
composer install --optimize-autoloader --no-dev
npm ci && npm run build
php artisan config:cache && php artisan route:cache && php artisan view:cache
php artisan migrate --force

# أو عبر Docker
docker compose up -d --build
docker compose exec app php artisan migrate --seed --force
```

لا تنسَ تشغيل العاملين في الإنتاج:

```bash
php artisan queue:work --tries=3 --timeout=120
php artisan schedule:work
```

## الرخصة | Licence

MIT — صُنع بحب في المغرب 🇲🇦
