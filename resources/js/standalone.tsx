import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

// Import all pages
import BusinessPulse from './Pages/BusinessPulse/Index';
import Inbox from './Pages/Inbox/Index';
import AIStudio from './Pages/AIStudio/Index';
import Customers from './Pages/Customers/Index';
import Booking from './Pages/Booking/Index';
import Campaigns from './Pages/Campaigns/Index';
import Automation from './Pages/Automation/Index';
import Analytics from './Pages/Analytics/Index';
import Settings from './Pages/Settings/Index';
import Admin from './Pages/Admin/Index';
import Onboarding from './Pages/Onboarding/Index';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';

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

const mockData: any = {
  '/pulse': {
    component: BusinessPulse,
    props: {
      business: mockBusiness,
      metrics: { conversations_today: 86, hours_saved: 4.2, high_value_opportunities: 12, ai_resolution_rate: 94, whatsapp_status: 'connected', ai_readiness_score: 96 },
      liveActivities: [
        { id: 'act-1', customer_name: 'أحمد الإدريسي (Casablanca)', query: 'واش كاين التوصيل اليوم لكازا مع التاجيل؟', agent_name: 'Sales Agent', action_taken: 'Answered delivery policy & proposed delivery slot', confidence: 96, status: 'ai_handled', timestamp: 'قبل دقيقتين (2m ago)' },
        { id: 'act-2', customer_name: 'سارة التازي (Rabat)', query: 'بغيت نحجز موعد للقياس يوم الجمعة مع 16:00', agent_name: 'Booking Agent', action_taken: 'Appointment created and confirmation WhatsApp sent', confidence: 98, status: 'booking_created', timestamp: 'قبل 7 دقائق (7m ago)' },
        { id: 'act-3', customer_name: 'محمد العلمي (Tanger)', query: 'طلبي ما وصلش في الوقت المحدد وبغيت استرجاع', agent_name: 'Complaint Agent', action_taken: 'Human handoff triggered with complaint summary', confidence: 45, status: 'human_handoff', timestamp: 'قبل 15 دقيقة (15m ago)' },
      ],
      opportunities: {
        hot_leads: [{ id: 'opp-1', name: 'ياسين الفاسي', phone: '+212 663-998877', intent: 'Purchase Ready', score: 92, summary: 'Asked for VIP Caftan package and bank details' }],
        waiting_customers: [{ id: 'opp-3', name: 'محمد العلمي', phone: '+212 660-112233', intent: 'Complaint / Refund', urgency: 'High', summary: 'Waiting for human agent response for 15 mins' }],
        unanswered_questions: [{ id: 'opp-4', query: 'واش كتديرو التوصيل لفرنسا وأوروبا؟', count: 14, action: 'Add to International Delivery Knowledge' }],
        returning_customers: [{ id: 'opp-5', name: 'ليلى العمراني', orders_count: 4, total_spent: '7,400 MAD', last_seen: 'Yesterday' }],
      },
      businessStory: { headline: 'Today your AI employee is outperforming last week\'s conversion baseline by 18%.', body_ar: 'اليوم قام الموظف الذكي جاوبني بمعالجة 86 محادثة بنجاح، ووفّر لك أكثر من 4 ساعات من العمل اليدوي، مع تحويل 12 محادثة إلى فرص بيع مؤكدة.', body_fr: 'Aujourd\'hui, votre employé IA Jawebni a traité 86 conversations avec succès.' },
    },
  },
  '/inbox': {
    component: Inbox,
    props: {
      conversations: [
        { id: 'conv-1', customer_id: 'cust-1', customer_name: 'فاطمة الزهراء العمراني', customer_phone: '+212661223344', customer_city: 'Casablanca', lead_score: 96, lifetime_value: '3,800.00 MAD', status: 'ai_handling', intent: 'purchase_inquiry', intent_confidence: 92, sentiment: 'positive', priority: 'high', last_message: 'واش كاين القفطان الأخضر الملكي بالصقلي؟', last_message_time: 'قبل 2 دقيقة', ai_memory: { preferred_size: '38', favorite_color: 'أخضر ملكي' } },
        { id: 'conv-2', customer_id: 'cust-2', customer_name: 'أحمد الإدريسي', customer_phone: '+212661998877', customer_city: 'Rabat', lead_score: 78, lifetime_value: '1,200.00 MAD', status: 'waiting_human', intent: 'complaint', intent_confidence: 45, sentiment: 'negative', priority: 'urgent', last_message: 'طلبي ما وصلش وبغيت استرجاع فلوسي', last_message_time: 'قبل 15 دقيقة', ai_memory: {} },
      ],
      activeConversation: { id: 'conv-1', customer: { id: 'cust-1', name: 'فاطمة الزهراء', phone: '+212661223344', city: 'Casablanca' }, status: 'ai_handling', intent: 'purchase_inquiry', priority: 'high', window_expires_at: new Date(Date.now() + 86400000).toISOString(), handoff: null },
      messages: [
        { id: 'msg-1', sender_type: 'customer', body: 'السلام، واش كاين القفطان الأخضر الملكي بالصقلي الحر؟', type: 'text', time: '14:32' },
        { id: 'msg-2', sender_type: 'ai', body: 'وعليكم السلام أ لالة فاطمة! 🌸 نعم كاين القفطان الأخضر الملكي بالصقلي الحر، ثمنه 1,850 درهم مع توصيل مجاني لكازا. واش بغيتي تشوفي الصور؟', type: 'text', ai_confidence: 96, detected_intent: 'purchase_inquiry', time: '14:32' },
        { id: 'msg-3', sender_type: 'customer', body: 'واخا، صيفط ليا الصور وعطيني المقاسات المتوفرة', type: 'text', time: '14:33' },
      ],
    },
  },
  '/ai-studio': {
    component: AIStudio,
    props: {
      agents: [
        { id: '1', business_id: 'b1', type: 'sales', name: 'Sales Agent', purpose: 'تحويل الاستفسارات إلى مبيعات مؤكدة', instructions: 'الترحيب بالدارجة', conversations_handled: 156, success_rate: 94, handoff_rate: 4, status: 'active' },
        { id: '2', business_id: 'b1', type: 'booking', name: 'Booking Agent', purpose: 'حجز وإدارة مواعيد القياس', instructions: 'اقتراح المواعيد', conversations_handled: 84, success_rate: 98, handoff_rate: 2, status: 'active' },
        { id: '3', business_id: 'b1', type: 'support', name: 'Support Agent', purpose: 'تتبع الشحنات', instructions: 'تزويد رقم التتبع', conversations_handled: 112, success_rate: 96, handoff_rate: 3, status: 'active' },
        { id: '4', business_id: 'b1', type: 'complaint', name: 'Complaint Agent', purpose: 'معالجة الشكاوى', instructions: 'تحويل فوري', conversations_handled: 24, success_rate: 92, handoff_rate: 85, status: 'active' },
        { id: '5', business_id: 'b1', type: 'faq', name: 'FAQ Agent', purpose: 'الأسئلة العامة', instructions: 'معلومات المتجر', conversations_handled: 203, success_rate: 95, handoff_rate: 5, status: 'active' },
      ],
      knowledgeItems: [
        { id: '1', question: 'واش كاين التوصيل لكازا؟', answer: 'نعم، التوصيل مجاني لكازا للطلبات فوق 500 درهم و35 درهم للطلبات الأقل، خلال 24 ساعة.', category: 'delivery', language: 'darija', confidence_score: 98 },
        { id: '2', question: 'شحال ثمن القفطان الملكي؟', answer: 'القفطان الملكي بالصقلي الحر ثمنه يبدأ من 1,850 درهم.', category: 'pricing', language: 'darija', confidence_score: 96 },
      ],
      documents: [{ id: '1', title: 'كتالوج قفطان 2026', file_name: 'caftan-catalog-2026.pdf', file_size: '2.4 MB', pages_count: 12, chunks_count: 24, extraction_confidence: 96, status: 'processed', created_at: 'منذ يومين' }],
      personality: { id: '1', communication_style: 'friendly_moroccan', darija_ratio: 70, arabic_ratio: 20, french_ratio: 10, response_length: 'balanced', trait_helpfulness: 90, trait_persuasiveness: 80, trait_friendliness: 95 },
      testRuns: [],
      healthData: { score: 88, status: 'ممتازة', checklist: [{ title: 'كتالوج المنتجات', status: 'complete' }, { title: 'سياسة التوصيل', status: 'complete' }], docs_count: 1, qna_count: 3 },
    },
  },
  '/customers': {
    component: Customers,
    props: {
      customers: [
        { id: '1', name: 'فاطمة الزهراء العمراني', phone: '+212661223344', city: 'Casablanca', lead_score: 96, lifetime_value: '3,800.00 MAD', total_orders: 2, tags: ['VIP', 'Caftan Lover'], ai_memory: { preferred_size: '38', favorite_color: 'أخضر ملكي' }, last_seen: 'منذ قليل' },
        { id: '2', name: 'أحمد الإدريسي', phone: '+212661998877', city: 'Rabat', lead_score: 78, lifetime_value: '1,200.00 MAD', total_orders: 1, tags: ['New', 'Rabat'], ai_memory: {}, last_seen: 'منذ ساعة' },
      ],
      tags: [],
    },
  },
  '/booking': { component: Booking, props: { bookings: [], services: [], staff: [] } },
  '/campaigns': { component: Campaigns, props: { campaigns: [], templates: [] } },
  '/automation': { component: Automation, props: { workflows: [{ id: '1', name: 'متابعة نية الشراء الفورية', description: 'عندما يكتشف AI نية شراء عالية', trigger_type: 'purchase_intent', is_active: true, execution_count: 84, nodes: [], edges: [], created_at: new Date().toISOString() }] } },
  '/analytics': { component: Analytics, props: {} },
  '/settings': {
    component: Settings,
    props: {
      plans: [
        { id: 'plan-basic', name: 'الباقة الأساسية', slug: 'basic', price_mad: '199', messages_limit: 500, numbers_limit: 1, features: ['رقم واحد', '500 رسالة'], is_popular: false },
        { id: 'plan-pro', name: 'الباقة الاحترافية', slug: 'professional', price_mad: '499', messages_limit: 3000, numbers_limit: 1, features: ['3,000 رسالة', 'RAG'], is_popular: true },
      ],
      subscription: { id: 'sub-1', status: 'active', starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 2592000000).toISOString(), plan: { id: 'plan-pro', name: 'الباقة الاحترافية', slug: 'professional', price_mad: '499', messages_limit: 3000, numbers_limit: 1, features: [], is_popular: true } },
      bankSettings: { bank_name: 'Attijariwafa Bank', account_holder: 'JAWEBNI SARL AU', rib: '007 780 0001234567890123 45', iban: 'MA64 007 780 0001234567890123 45', swift_bic: 'BCMAMAMC', instructions: 'يرجى إرسال الإيصال' },
      payments: [],
    },
  },
  '/admin': {
    component: Admin,
    props: {
      businesses: [{ id: '1', name: 'Artisanat Marocain', slug: 'artisanat-marocain', city: 'Casablanca', phone_number: '+212661000001', status: 'active', ai_readiness_score: 96, onboarding_completed: true, users_count: 1, created_at: new Date().toISOString() }],
      pendingPayments: [{ id: '1', reference_code: 'JW-CAFTAN99', amount: '499.00', currency: 'MAD', status: 'pending_review', receipt_file_path: null, admin_notes: null, created_at: new Date().toISOString(), business: { id: '1', name: 'Artisanat Marocain', city: 'Casablanca' }, plan: { id: 'plan-pro', name: 'Professional', price_mad: '499' } }],
      allPayments: [{ id: '1', reference_code: 'JW-CAFTAN99', amount: '499.00', currency: 'MAD', status: 'pending_review', receipt_file_path: null, admin_notes: null, created_at: new Date().toISOString(), business: { id: '1', name: 'Artisanat Marocain', city: 'Casablanca' }, plan: { id: 'plan-pro', name: 'Professional', price_mad: '499' } }],
      bankSettings: { id: 'bank-1', bank_name: 'Attijariwafa Bank', account_holder: 'JAWEBNI SARL AU', rib: '007 780 0001234567890123 45', iban: 'MA64 007 780 0001234567890123 45', swift_bic: 'BCMAMAMC', instructions: 'يرجى إرسال الإيصال' },
    },
  },
  '/onboarding': { component: Onboarding, props: { business: mockBusiness } },
  '/login': { component: Login, props: {} },
  '/register': { component: Register, props: {} },
};

function App() {
  const path = window.location.pathname;
  const page = mockData[path] || mockData['/pulse'] || mockData['/login'];
  const Component = page.component;
  
  // Inject mock auth into window for components that use usePage
  (window as any).__INERTIA_PROPS__ = { auth: mockAuth, ...page.props };
  
  return <Component {...page.props} />;
}

// Mock Inertia's usePage hook
const originalUsePage = (globalThis as any).usePage;
console.log('🚀 Jawebni Standalone — جاوبني يعمل بدون PHP!');

// Render
const el = document.getElementById('app');
if (el) {
  const root = createRoot(el);
  root.render(<App />);
} else {
  console.error('No #app element found');
}
