import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();
  
  // Mock data for all pages
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

  // Middleware to parse JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      host: '0.0.0.0',
      allowedHosts: true,
      hmr: false,
    },
    appType: 'custom',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './resources/js'),
      },
    },
  });

  app.use(vite.middlewares);

  // Mock Inertia responses - serve HTML with mocked data
  const mockPages = {
    '/pulse': {
      component: 'BusinessPulse/Index',
      props: {
        auth: mockAuth,
        business: mockBusiness,
        metrics: {
          conversations_today: 86,
          hours_saved: 4.2,
          high_value_opportunities: 12,
          ai_resolution_rate: 94,
          whatsapp_status: 'connected',
          ai_readiness_score: 96,
        },
        liveActivities: [
          {
            id: 'act-1',
            customer_name: 'أحمد الإدريسي (Casablanca)',
            query: 'واش كاين التوصيل اليوم لكازا مع التاجيل؟',
            agent_name: 'Sales Agent',
            action_taken: 'Answered delivery policy & proposed delivery slot',
            confidence: 96,
            status: 'ai_handled',
            timestamp: 'قبل دقيقتين',
          },
          {
            id: 'act-2',
            customer_name: 'سارة التازي (Rabat)',
            query: 'بغيت نحجز موعد للقياس يوم الجمعة مع 16:00',
            agent_name: 'Booking Agent',
            action_taken: 'Appointment created and confirmation WhatsApp sent',
            confidence: 98,
            status: 'booking_created',
            timestamp: 'قبل 7 دقائق',
          },
        ],
        opportunities: {
          hot_leads: [
            { id: 'opp-1', name: 'ياسين الفاسي', phone: '+212 663-998877', intent: 'Purchase Ready', score: 92, summary: 'Asked for VIP Caftan package' },
          ],
          waiting_customers: [
            { id: 'opp-3', name: 'محمد العلمي', phone: '+212 660-112233', intent: 'Complaint / Refund', urgency: 'High', summary: 'Waiting for human agent' },
          ],
          unanswered_questions: [
            { id: 'opp-4', query: 'واش كتديرو التوصيل لفرنسا؟', count: 14, action: 'Add to Knowledge' },
          ],
          returning_customers: [
            { id: 'opp-5', name: 'ليلى العمراني', orders_count: 4, total_spent: '7,400 MAD', last_seen: 'Yesterday' },
          ],
        },
        businessStory: {
          headline: 'Today your AI employee is outperforming last week\'s conversion baseline by 18%.',
          body_ar: 'اليوم قام الموظف الذكي جاوبني بمعالجة 86 محادثة بنجاح، ووفّر لك أكثر من 4 ساعات من العمل اليدوي.',
          body_fr: 'Aujourd\'hui, votre employé IA a traité 86 conversations avec succès.',
        },
      },
    },
    '/inbox': {
      component: 'Inbox/Index',
      props: {
        auth: mockAuth,
        conversations: [
          {
            id: 'conv-1',
            customer_id: 'cust-1',
            customer_name: 'فاطمة الزهراء العمراني',
            customer_phone: '+212661223344',
            customer_city: 'Casablanca',
            lead_score: 96,
            lifetime_value: '3,800.00 MAD',
            status: 'ai_handling',
            intent: 'purchase_inquiry',
            intent_confidence: 92,
            sentiment: 'positive',
            priority: 'high',
            last_message: 'واش كاين القفطان الأخضر الملكي بالصقلي؟',
            last_message_time: 'قبل 2 دقيقة',
            ai_memory: { preferred_size: '38', favorite_color: 'أخضر ملكي' },
          },
          {
            id: 'conv-2',
            customer_id: 'cust-2',
            customer_name: 'أحمد الإدريسي',
            customer_phone: '+212661998877',
            customer_city: 'Rabat',
            lead_score: 78,
            lifetime_value: '1,200.00 MAD',
            status: 'waiting_human',
            intent: 'complaint',
            intent_confidence: 45,
            sentiment: 'negative',
            priority: 'urgent',
            last_message: 'طلبي ما وصلش وبغيت استرجاع فلوسي',
            last_message_time: 'قبل 15 دقيقة',
            ai_memory: {},
          },
        ],
        activeConversation: {
          id: 'conv-1',
          customer: { id: 'cust-1', name: 'فاطمة الزهراء', phone: '+212661223344', city: 'Casablanca' },
          status: 'ai_handling',
          intent: 'purchase_inquiry',
          priority: 'high',
          window_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          handoff: null,
        },
        messages: [
          { id: 'msg-1', sender_type: 'customer', body: 'السلام، واش كاين القفطان الأخضر الملكي بالصقلي الحر؟', type: 'text', time: '14:32' },
          { id: 'msg-2', sender_type: 'ai', body: 'وعليكم السلام أ لالة فاطمة! 🌸 نعم كاين القفطان الأخضر الملكي بالصقلي الحر، ثمنه 1,850 درهم مع توصيل مجاني لكازا. واش بغيتي تشوفي الصور؟', type: 'text', ai_confidence: 96, detected_intent: 'purchase_inquiry', time: '14:32' },
          { id: 'msg-3', sender_type: 'customer', body: 'واخا، صيفط ليا الصور وعطيني المقاسات المتوفرة', type: 'text', time: '14:33' },
          { id: 'msg-4', sender_type: 'ai', body: 'تفضلي أ لالة، المقاسات المتوفرة: 36، 38، 40، 42، 44. القفطان مصنوع من ثوب جوهرة فاخر مع تطريز صقلي حر يدوي. غنصيفط لك الصور دابا مع فيديو قصير للمنتج.', type: 'text', ai_confidence: 94, time: '14:33' },
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
          { id: '2', question: 'شحال ثمن القفطان الملكي؟', answer: 'القفطان الملكي بالصقلي الحر ثمنه يبدأ من 1,850 درهم حسب التطريز والمقاس، مع إمكانية التقسيط.', category: 'pricing', language: 'darija', confidence_score: 96 },
          { id: '3', question: 'كيفاش نبدل المقاس؟', answer: 'يمكن استبدال المقاس خلال 7 أيام من الاستلام شريطة الحفاظ على الحالة الأصلية.', category: 'returns', language: 'darija', confidence_score: 94 },
        ],
        documents: [
          { id: '1', title: 'كتالوج قفطان 2026', file_name: 'caftan-catalog-2026.pdf', file_size: '2.4 MB', pages_count: 12, chunks_count: 24, extraction_confidence: 96, status: 'processed', created_at: 'منذ يومين' },
        ],
        personality: {
          id: '1',
          communication_style: 'friendly_moroccan',
          darija_ratio: 70,
          arabic_ratio: 20,
          french_ratio: 10,
          response_length: 'balanced',
          trait_helpfulness: 90,
          trait_persuasiveness: 80,
          trait_friendliness: 95,
        },
        testRuns: [],
        healthData: {
          score: 88,
          status: 'ممتازة',
          checklist: [
            { title: 'كتالوج المنتجات والأسعار', status: 'complete' },
            { title: 'سياسة التوصيل والشحن', status: 'complete' },
            { title: 'طرق الدفع', status: 'complete' },
            { title: 'شروط الاستبدال', status: 'warning' },
            { title: 'أسئلة شائعة بالدارجة', status: 'complete' },
          ],
          docs_count: 1,
          qna_count: 3,
        },
      },
    },
    '/customers': {
      component: 'Customers/Index',
      props: {
        auth: mockAuth,
        customers: [
          { id: '1', name: 'فاطمة الزهراء العمراني', phone: '+212661223344', city: 'Casablanca', lead_score: 96, lifetime_value: '3,800.00 MAD', total_orders: 2, tags: ['VIP', 'Caftan Lover'], ai_memory: { preferred_size: '38', favorite_color: 'أخضر ملكي' }, last_seen: 'منذ قليل' },
          { id: '2', name: 'أحمد الإدريسي', phone: '+212661998877', city: 'Rabat', lead_score: 78, lifetime_value: '1,200.00 MAD', total_orders: 1, tags: ['New', 'Rabat'], ai_memory: {}, last_seen: 'منذ ساعة' },
          { id: '3', name: 'سارة التازي', phone: '+212662445566', city: 'Marrakech', lead_score: 88, lifetime_value: '2,400.00 MAD', total_orders: 3, tags: ['VIP', 'Marrakech'], ai_memory: { preferred_size: '40' }, last_seen: 'منذ يوم' },
        ],
        tags: [{ id: '1', name: 'VIP', color: '#FF7A59' }, { id: '2', name: 'Caftan Lover', color: '#0F9D8C' }],
      },
    },
    '/booking': {
      component: 'Booking/Index',
      props: {
        auth: mockAuth,
        bookings: [],
        services: [],
        staff: [],
      },
    },
    '/campaigns': {
      component: 'Campaigns/Index',
      props: {
        auth: mockAuth,
        campaigns: [],
        templates: [],
      },
    },
    '/automation': {
      component: 'Automation/Index',
      props: {
        auth: mockAuth,
        workflows: [
          { id: '1', name: 'متابعة نية الشراء الفورية', description: 'عندما يكتشف AI نية شراء عالية', trigger_type: 'purchase_intent', is_active: true, execution_count: 84, nodes: [], edges: [], created_at: new Date().toISOString() },
          { id: '2', name: 'تأكيد الحجز وتذكير واتساب', description: 'إرسال تذكير قبل 24 ساعة', trigger_type: 'booking_created', is_active: true, execution_count: 42, nodes: [], edges: [], created_at: new Date().toISOString() },
        ],
      },
    },
    '/analytics': {
      component: 'Analytics/Index',
      props: { auth: mockAuth },
    },
    '/settings': {
      component: 'Settings/Index',
      props: {
        auth: mockAuth,
        plans: [
          { id: 'plan-basic', name: 'الباقة الأساسية', slug: 'basic', price_mad: '199', messages_limit: 500, numbers_limit: 1, features: ['رقم واحد', '500 رسالة'], is_popular: false },
          { id: 'plan-pro', name: 'الباقة الاحترافية', slug: 'professional', price_mad: '499', messages_limit: 3000, numbers_limit: 1, features: ['3,000 رسالة', 'RAG', 'حجوزات'], is_popular: true },
          { id: 'plan-enterprise', name: 'باقة المؤسسات', slug: 'enterprise', price_mad: '1499', messages_limit: 20000, numbers_limit: 5, features: ['غير محدود', 'أرقام متعددة'], is_popular: false },
        ],
        subscription: {
          id: 'sub-1',
          status: 'active',
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          plan: { id: 'plan-pro', name: 'الباقة الاحترافية', slug: 'professional', price_mad: '499', messages_limit: 3000, numbers_limit: 1, features: [], is_popular: true },
        },
        bankSettings: {
          bank_name: 'Attijariwafa Bank',
          account_holder: 'JAWEBNI SARL AU',
          rib: '007 780 0001234567890123 45',
          iban: 'MA64 007 780 0001234567890123 45',
          swift_bic: 'BCMAMAMC',
          instructions: 'يرجى إرسال الإيصال مع ذكر المرجع',
        },
        payments: [
          { id: '1', reference_code: 'JW-CAFTAN99', amount: '499.00', currency: 'MAD', status: 'pending_review', receipt_file_path: null, created_at: new Date().toISOString(), plan: { id: 'plan-pro', name: 'الباقة الاحترافية', slug: 'professional', price_mad: '499', messages_limit: 3000, numbers_limit: 1, features: [], is_popular: true } },
        ],
      },
    },
    '/admin': {
      component: 'Admin/Index',
      props: {
        auth: mockAuth,
        businesses: [
          { id: '1', name: 'Artisanat Marocain & Caftan Luxe', slug: 'artisanat-marocain', city: 'Casablanca', phone_number: '+212661000001', status: 'active', ai_readiness_score: 96, onboarding_completed: true, users_count: 1, created_at: new Date().toISOString() },
          { id: '2', name: 'Bijouterie Atlas Marrakech', slug: 'bijouterie-atlas', city: 'Marrakech', phone_number: '+212662000002', status: 'active', ai_readiness_score: 84, onboarding_completed: true, users_count: 2, created_at: new Date().toISOString() },
          { id: '3', name: 'Restaurant La Mamounia', slug: 'restaurant-mamounia', city: 'Rabat', phone_number: '+212663000003', status: 'trial', ai_readiness_score: 45, onboarding_completed: false, users_count: 1, created_at: new Date().toISOString() },
        ],
        pendingPayments: [
          { id: '1', reference_code: 'JW-CAFTAN99', amount: '499.00', currency: 'MAD', status: 'pending_review', receipt_file_path: null, admin_notes: null, created_at: new Date().toISOString(), business: { id: '1', name: 'Artisanat Marocain', city: 'Casablanca' }, plan: { id: 'plan-pro', name: 'Professional', price_mad: '499' } },
        ],
        allPayments: [
          { id: '1', reference_code: 'JW-CAFTAN99', amount: '499.00', currency: 'MAD', status: 'pending_review', receipt_file_path: null, admin_notes: null, created_at: new Date().toISOString(), business: { id: '1', name: 'Artisanat Marocain', city: 'Casablanca' }, plan: { id: 'plan-pro', name: 'Professional', price_mad: '499' } },
          { id: '2', reference_code: 'JW-ATLAS88', amount: '199.00', currency: 'MAD', status: 'approved', receipt_file_path: null, admin_notes: null, created_at: new Date(Date.now() - 86400000).toISOString(), business: { id: '2', name: 'Bijouterie Atlas', city: 'Marrakech' }, plan: { id: 'plan-basic', name: 'Basic', price_mad: '199' } },
        ],
        bankSettings: {
          id: 'bank-1',
          bank_name: 'Attijariwafa Bank',
          account_holder: 'JAWEBNI SARL AU',
          rib: '007 780 0001234567890123 45',
          iban: 'MA64 007 780 0001234567890123 45',
          swift_bic: 'BCMAMAMC',
          instructions: 'يرجى إرسال الإيصال مع ذكر المرجع',
        },
      },
    },
    '/onboarding': {
      component: 'Onboarding/Index',
      props: {
        auth: mockAuth,
        business: mockBusiness,
      },
    },
    '/login': {
      component: 'Auth/Login',
      props: {},
    },
    '/register': {
      component: 'Auth/Register',
      props: {},
    },
  };

  // Handle all routes
  app.use(async (req, res, next) => {
    const url = req.originalUrl.split('?')[0];
    
    // Handle API routes with mock responses
    if (url.startsWith('/api/')) {
      return res.json({ status: 'success', message: 'Mock API response - Jawebni AI is working!' });
    }

    // Handle Inertia POST routes
    if (req.method === 'POST') {
      return res.json({ 
        props: { 
          flash: { success: 'تم بنجاح! العملية تمت بنجاح (Mock)' },
          auth: mockAuth 
        } 
      });
    }

    // Find matching page
    let pageData = mockPages[url];
    if (!pageData) {
      // Default to pulse for root
      if (url === '/' || url === '') {
        return res.redirect('/pulse');
      }
      // Try to find by prefix
      const matchingKey = Object.keys(mockPages).find(key => url.startsWith(key));
      if (matchingKey) {
        pageData = mockPages[matchingKey];
      } else {
        pageData = mockPages['/pulse'];
      }
    }

    try {
      // Create Inertia page structure
      const inertiaPage = {
        component: pageData.component,
        props: {
          ...pageData.props,
          flash: { success: null, error: null },
          errors: {},
        },
        url: url,
        version: '1',
      };

      // Render HTML template similar to Laravel's app.blade.php
      const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title inertia>Jawebni — جاوبني | موظفك الذكي على واتساب</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
        <script type="module">
          // Mock Inertia page data
          window.__JAWEBNI_MOCK__ = ${JSON.stringify(inertiaPage)};
        </script>
    </head>
    <body class="font-sans antialiased bg-[#F6F8FB] text-[#172033] selection:bg-[#DDF7F2] selection:text-[#0F9D8C] overflow-x-hidden min-h-screen">
        <div id="app" data-page='${JSON.stringify(inertiaPage).replace(/'/g, "&#39;")}'></div>
        <script type="module" src="/resources/js/app.tsx"></script>
    </body>
</html>
      `;
      
      const transformedHtml = await vite.transformIndexHtml(url, html);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(transformedHtml);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  const port = process.env.PORT || 5173;
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Jawebni AI — جاوبني is running at http://localhost:${port}`);
    console.log(`📱 Business Pulse: http://localhost:${port}/pulse`);
    console.log(`💬 AI Inbox: http://localhost:${port}/inbox`);
    console.log(`✨ AI Studio: http://localhost:${port}/ai-studio`);
    console.log(`👥 Customers: http://localhost:${port}/customers`);
    console.log(`📅 Booking: http://localhost:${port}/booking`);
    console.log(`📢 Campaigns: http://localhost:${port}/campaigns`);
    console.log(`⚙️ Automation: http://localhost:${port}/automation`);
    console.log(`📊 Analytics: http://localhost:${port}/analytics`);
    console.log(`💳 Settings: http://localhost:${port}/settings`);
    console.log(`🛡️ Admin: http://localhost:${port}/admin`);
  });
}

createServer();
