import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow all origins and iframe embedding
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Serve static assets from public
app.use('/build', express.static(path.join(__dirname, 'public/build')));
app.use(express.static(path.join(__dirname, 'public')));

// Read manifest for built assets
let manifest = {};
try {
  manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/build/manifest.json'), 'utf8'));
} catch (e) {
  console.log('No manifest found, using dev assets');
}

const mockBusiness = {
  id: 'business-1',
  name: 'Artisanat Marocain & Caftan Luxe',
  slug: 'artisanat-marocain',
  city: 'Casablanca',
  phone_number: '+212661000001',
  currency: 'MAD',
  default_language: 'darija',
  ai_readiness_score: 96,
  onboarding_completed: true,
  onboarding_step: 5,
};

const mockAuth = {
  user: {
    id: 'user-1',
    name: 'سعيد المنصوري',
    email: 'said@jawebni.ma',
    role: 'owner',
    is_super_admin: true,
    preferred_locale: 'ar',
  },
  business: mockBusiness,
  user_businesses: [mockBusiness],
};

const getPageData = (url) => {
  const pages = {
    '/pulse': {
      component: 'BusinessPulse/Index',
      props: {
        auth: mockAuth,
        business: mockBusiness,
        metrics: { conversations_today: 86, hours_saved: 4.2, high_value_opportunities: 12, ai_resolution_rate: 94, whatsapp_status: 'connected', ai_readiness_score: 96 },
        liveActivities: [
          { id: 'act-1', customer_name: 'أحمد الإدريسي (Casablanca)', query: 'واش كاين التوصيل اليوم لكازا مع التاجيل؟', agent_name: 'Sales Agent', action_taken: 'Answered delivery policy', confidence: 96, status: 'ai_handled', timestamp: 'قبل دقيقتين' },
          { id: 'act-2', customer_name: 'سارة التازي (Rabat)', query: 'بغيت نحجز موعد للقياس يوم الجمعة مع 16:00', agent_name: 'Booking Agent', action_taken: 'Appointment created', confidence: 98, status: 'booking_created', timestamp: 'قبل 7 دقائق' },
        ],
        opportunities: {
          hot_leads: [{ id: 'opp-1', name: 'ياسين الفاسي', phone: '+212 663-998877', intent: 'Purchase Ready', score: 92, summary: 'Asked for VIP Caftan package' }],
          waiting_customers: [{ id: 'opp-3', name: 'محمد العلمي', phone: '+212 660-112233', intent: 'Complaint', urgency: 'High', summary: 'Waiting for human' }],
          unanswered_questions: [{ id: 'opp-4', query: 'واش كتديرو التوصيل لفرنسا؟', count: 14, action: 'Add to Knowledge' }],
          returning_customers: [{ id: 'opp-5', name: 'ليلى العمراني', orders_count: 4, total_spent: '7,400 MAD', last_seen: 'Yesterday' }],
        },
        businessStory: { headline: 'Today your AI employee is outperforming last week by 18%.', body_ar: 'اليوم قام الموظف الذكي بمعالجة 86 محادثة بنجاح، ووفّر لك أكثر من 4 ساعات.', body_fr: 'Aujourd\'hui, votre employé IA a traité 86 conversations.' },
      },
    },
    '/inbox': {
      component: 'Inbox/Index',
      props: {
        auth: mockAuth,
        conversations: [
          { id: 'conv-1', customer_id: 'cust-1', customer_name: 'فاطمة الزهراء العمراني', customer_phone: '+212661223344', customer_city: 'Casablanca', lead_score: 96, lifetime_value: '3,800.00 MAD', status: 'ai_handling', intent: 'purchase_inquiry', intent_confidence: 92, sentiment: 'positive', priority: 'high', last_message: 'واش كاين القفطان الأخضر الملكي بالصقلي؟', last_message_time: 'قبل 2 دقيقة', ai_memory: { preferred_size: '38' } },
          { id: 'conv-2', customer_id: 'cust-2', customer_name: 'أحمد الإدريسي', customer_phone: '+212661998877', customer_city: 'Rabat', lead_score: 78, lifetime_value: '1,200.00 MAD', status: 'waiting_human', intent: 'complaint', intent_confidence: 45, sentiment: 'negative', priority: 'urgent', last_message: 'طلبي ما وصلش وبغيت استرجاع فلوسي', last_message_time: 'قبل 15 دقيقة', ai_memory: {} },
        ],
        activeConversation: { id: 'conv-1', customer: { id: 'cust-1', name: 'فاطمة الزهراء', phone: '+212661223344', city: 'Casablanca' }, status: 'ai_handling', intent: 'purchase_inquiry', priority: 'high', window_expires_at: new Date(Date.now() + 86400000).toISOString(), handoff: null },
        messages: [
          { id: 'msg-1', sender_type: 'customer', body: 'السلام، واش كاين القفطان الأخضر الملكي بالصقلي الحر؟', type: 'text', time: '14:32' },
          { id: 'msg-2', sender_type: 'ai', body: 'وعليكم السلام أ لالة فاطمة! 🌸 نعم كاين القفطان الأخضر الملكي بالصقلي الحر، ثمنه 1,850 درهم مع توصيل مجاني لكازا.', type: 'text', ai_confidence: 96, detected_intent: 'purchase_inquiry', time: '14:32' },
        ],
      },
    },
    '/ai-studio': {
      component: 'AIStudio/Index',
      props: {
        auth: mockAuth,
        agents: [
          { id: '1', business_id: 'b1', type: 'sales', name: 'Sales Agent', purpose: 'تحويل الاستفسارات إلى مبيعات', instructions: 'الترحيب بالدارجة', conversations_handled: 156, success_rate: 94, handoff_rate: 4, status: 'active' },
          { id: '2', business_id: 'b1', type: 'booking', name: 'Booking Agent', purpose: 'حجز مواعيد القياس', instructions: 'اقتراح المواعيد', conversations_handled: 84, success_rate: 98, handoff_rate: 2, status: 'active' },
          { id: '3', business_id: 'b1', type: 'support', name: 'Support Agent', purpose: 'تتبع الشحنات', instructions: 'تزويد رقم التتبع', conversations_handled: 112, success_rate: 96, handoff_rate: 3, status: 'active' },
          { id: '4', business_id: 'b1', type: 'complaint', name: 'Complaint Agent', purpose: 'معالجة الشكاوى', instructions: 'تحويل فوري للبشري', conversations_handled: 24, success_rate: 92, handoff_rate: 85, status: 'active' },
          { id: '5', business_id: 'b1', type: 'faq', name: 'FAQ Agent', purpose: 'الأسئلة العامة', instructions: 'معلومات المتجر', conversations_handled: 203, success_rate: 95, handoff_rate: 5, status: 'active' },
        ],
        knowledgeItems: [
          { id: '1', question: 'واش كاين التوصيل لكازا؟', answer: 'نعم، التوصيل مجاني لكازا للطلبات فوق 500 درهم و35 درهم للطلبات الأقل، خلال 24 ساعة.', category: 'delivery', language: 'darija', confidence_score: 98 },
          { id: '2', question: 'شحال ثمن القفطان الملكي؟', answer: 'القفطان الملكي بالصقلي الحر ثمنه يبدأ من 1,850 درهم حسب التطريز والمقاس.', category: 'pricing', language: 'darija', confidence_score: 96 },
        ],
        documents: [{ id: '1', title: 'كتالوج قفطان 2026', file_name: 'caftan-catalog-2026.pdf', file_size: '2.4 MB', pages_count: 12, chunks_count: 24, extraction_confidence: 96, status: 'processed', created_at: 'منذ يومين' }],
        personality: { id: '1', communication_style: 'friendly_moroccan', darija_ratio: 70, arabic_ratio: 20, french_ratio: 10, response_length: 'balanced', trait_helpfulness: 90, trait_persuasiveness: 80, trait_friendliness: 95 },
        testRuns: [],
        healthData: { score: 88, status: 'ممتازة', checklist: [{ title: 'كتالوج المنتجات', status: 'complete' }, { title: 'سياسة التوصيل', status: 'complete' }], docs_count: 1, qna_count: 3 },
      },
    },
    '/customers': {
      component: 'Customers/Index',
      props: {
        auth: mockAuth,
        customers: [
          { id: '1', name: 'فاطمة الزهراء العمراني', phone: '+212661223344', city: 'Casablanca', lead_score: 96, lifetime_value: '3,800.00 MAD', total_orders: 2, tags: ['VIP', 'Caftan Lover'], ai_memory: { preferred_size: '38', favorite_color: 'أخضر ملكي' }, last_seen: 'منذ قليل' },
          { id: '2', name: 'أحمد الإدريسي', phone: '+212661998877', city: 'Rabat', lead_score: 78, lifetime_value: '1,200.00 MAD', total_orders: 1, tags: ['New', 'Rabat'], ai_memory: {}, last_seen: 'منذ ساعة' },
        ],
        tags: [{ id: '1', name: 'VIP', color: '#FF7A59' }],
      },
    },
    '/booking': { component: 'Booking/Index', props: { auth: mockAuth, bookings: [], services: [], staff: [] } },
    '/campaigns': { component: 'Campaigns/Index', props: { auth: mockAuth, campaigns: [], templates: [] } },
    '/automation': { component: 'Automation/Index', props: { auth: mockAuth, workflows: [{ id: '1', name: 'متابعة نية الشراء الفورية', description: 'عندما يكتشف AI نية شراء عالية', trigger_type: 'purchase_intent', is_active: true, execution_count: 84, nodes: [], edges: [], created_at: new Date().toISOString() }] } },
    '/analytics': { component: 'Analytics/Index', props: { auth: mockAuth } },
    '/settings': {
      component: 'Settings/Index',
      props: {
        auth: mockAuth,
        plans: [
          { id: 'plan-basic', name: 'الباقة الأساسية', slug: 'basic', price_mad: '199', messages_limit: 500, numbers_limit: 1, features: ['رقم واحد', '500 رسالة'], is_popular: false },
          { id: 'plan-pro', name: 'الباقة الاحترافية', slug: 'professional', price_mad: '499', messages_limit: 3000, numbers_limit: 1, features: ['3,000 رسالة', 'RAG'], is_popular: true },
        ],
        subscription: { id: 'sub-1', status: 'active', starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 2592000000).toISOString(), plan: { id: 'plan-pro', name: 'الباقة الاحترافية', slug: 'professional', price_mad: '499', messages_limit: 3000, numbers_limit: 1, features: [], is_popular: true } },
        bankSettings: { bank_name: 'Attijariwafa Bank', account_holder: 'JAWEBNI SARL AU', rib: '007 780 0001234567890123 45', iban: 'MA64 007 780 0001234567890123 45', swift_bic: 'BCMAMAMC', instructions: 'يرجى إرسال الإيصال مع ذكر المرجع' },
        payments: [],
      },
    },
    '/admin': {
      component: 'Admin/Index',
      props: {
        auth: mockAuth,
        businesses: [{ id: '1', name: 'Artisanat Marocain', slug: 'artisanat-marocain', city: 'Casablanca', phone_number: '+212661000001', status: 'active', ai_readiness_score: 96, onboarding_completed: true, users_count: 1, created_at: new Date().toISOString() }],
        pendingPayments: [{ id: '1', reference_code: 'JW-CAFTAN99', amount: '499.00', currency: 'MAD', status: 'pending_review', receipt_file_path: null, admin_notes: null, created_at: new Date().toISOString(), business: { id: '1', name: 'Artisanat Marocain', city: 'Casablanca' }, plan: { id: 'plan-pro', name: 'Professional', price_mad: '499' } }],
        allPayments: [{ id: '1', reference_code: 'JW-CAFTAN99', amount: '499.00', currency: 'MAD', status: 'pending_review', receipt_file_path: null, admin_notes: null, created_at: new Date().toISOString(), business: { id: '1', name: 'Artisanat Marocain', city: 'Casablanca' }, plan: { id: 'plan-pro', name: 'Professional', price_mad: '499' } }],
        bankSettings: { id: 'bank-1', bank_name: 'Attijariwafa Bank', account_holder: 'JAWEBNI SARL AU', rib: '007 780 0001234567890123 45', iban: 'MA64 007 780 0001234567890123 45', swift_bic: 'BCMAMAMC', instructions: 'يرجى إرسال الإيصال' },
      },
    },
    '/onboarding': { component: 'Onboarding/Index', props: { auth: mockAuth, business: mockBusiness } },
    '/login': { component: 'Auth/Login', props: {} },
    '/register': { component: 'Auth/Register', props: {} },
  };

  return pages[url] || pages['/pulse'];
};

app.get('*', (req, res) => {
  const url = req.path;
  
  if (url === '/' || url === '') {
    return res.redirect('/pulse');
  }

  if (url.startsWith('/build/') || url.includes('.')) {
    return res.status(404).send('Not found');
  }

  // Use standalone build - works without PHP/Inertia
  let cssFile = '/build/assets/app-spR_JEfJ.css';
  let jsFile = '/build/assets/standalone-vVk6kMcg.js';
  
  try {
    if (manifest['resources/js/standalone.tsx']) {
      const manifestCss = manifest['resources/js/standalone.tsx'].css?.[0] || manifest['_app-BpopcOVV.js']?.css?.[0];
      const manifestJs = manifest['resources/js/standalone.tsx'].file;
      if (manifestCss) cssFile = '/build/' + manifestCss;
      if (manifestJs) jsFile = '/build/' + manifestJs;
    }
    if (!fs.existsSync(path.join(__dirname, 'public' + cssFile))) {
      cssFile = '/build/assets/app-spR_JEfJ.css';
    }
  } catch (e) {
    console.log('Manifest error:', e);
  }

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Jawebni — جاوبني | موظفك الذكي على واتساب 24/7 - يعمل الآن!</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${cssFile}">
<style>
  body { font-family: 'Cairo', 'IBM Plex Sans Arabic', sans-serif; }
  #app { min-height: 100vh; }
</style>
</head>
<body class="font-sans antialiased bg-[#F6F8FB] text-[#172033] selection:bg-[#DDF7F2] selection:text-[#0F9D8C] overflow-x-hidden min-h-screen">
<div id="app">
  <div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;gap:16px;">
    <div style="width:48px;height:48px;border:4px solid #0F9D8C;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
    <p style="font-weight:bold;color:#172033;">جاوبني يحمل... Jawebni Loading...</p>
  </div>
  <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
</div>
<script type="module" src="${jsFile}"></script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

app.post('*', (req, res) => {
  res.json({ props: { flash: { success: 'تم بنجاح! (Mock)' }, auth: mockAuth } });
});

const port = process.env.PORT || 8000;
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Jawebni — جاوبني يعمل الآن على http://localhost:${port}`);
  console.log(`🌐 Business Pulse: http://localhost:${port}/pulse`);
  console.log(`💬 Inbox: http://localhost:${port}/inbox`);
  console.log(`✨ AI Studio: http://localhost:${port}/ai-studio`);
  console.log(`👥 Customers: http://localhost:${port}/customers`);
  console.log(`📅 Booking: http://localhost:${port}/booking`);
  console.log(`📢 Campaigns: http://localhost:${port}/campaigns`);
  console.log(`⚙️ Automation: http://localhost:${port}/automation`);
  console.log(`📊 Analytics: http://localhost:${port}/analytics`);
  console.log(`💳 Settings: http://localhost:${port}/settings`);
  console.log(`🛡️ Admin: http://localhost:${port}/admin`);
});
