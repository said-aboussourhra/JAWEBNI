import React, { useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import {
  Activity,
  Flame,
  Clock,
  HelpCircle,
  Gem,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Bot,
  User,
  MessageCircle,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface BusinessPulseProps {
  business: any;
  metrics: {
    conversations_today: number;
    hours_saved: number;
    high_value_opportunities: number;
    ai_resolution_rate: number;
    whatsapp_status: string;
    ai_readiness_score: number;
  };
  liveActivities: Array<{
    id: string;
    customer_name: string;
    query: string;
    agent_name: string;
    action_taken: string;
    confidence: number;
    status: string;
    timestamp: string;
  }>;
  opportunities: {
    hot_leads: Array<any>;
    waiting_customers: Array<any>;
    unanswered_questions: Array<any>;
    returning_customers: Array<any>;
  };
  businessStory: {
    headline: string;
    body_ar: string;
    body_fr: string;
  };
}

export default function BusinessPulse({
  business,
  metrics,
  liveActivities,
  opportunities,
  businessStory,
}: BusinessPulseProps) {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'hot' | 'waiting' | 'unanswered' | 'returning'>('hot');

  return (
    <AppShell activeHub="pulse" activeSection="overview" title="نبض الأعمال — Jawebni Pulse">
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Dynamic Moroccan Top Greeting Banner */}
        <div className="bg-gradient-to-r from-[#123B3A] via-[#0F9D8C] to-[#123B3A] text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#DDF7F2]">
                  ● موظفك الذكي يعمل بنشاط الآن (AI Active 24/7)
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold">
                صباح الخير، {business?.name || 'سعيد المنصوري'} 👋
              </h1>
              <p className="text-xs md:text-sm text-slate-100 mt-1 max-w-2xl leading-relaxed">
                {locale === 'fr' ? businessStory.body_fr : businessStory.body_ar}
              </p>
            </div>

            {/* AI Status Badge */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 flex items-center space-x-3 rtl:space-x-reverse shrink-0">
              <Bot className="w-6 h-6 text-[#DDF7F2]" />
              <div>
                <span className="text-[11px] text-slate-200 block">كفاءة الرد التلقائي</span>
                <span className="text-base font-extrabold text-white">
                  {metrics.ai_resolution_rate}% دقة وإغلاق
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Intelligence Metric Stories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-xs hover:border-[#0F9D8C] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#667085]">محادثات اليوم</span>
              <span className="p-2 bg-[#DDF7F2] text-[#0F9D8C] rounded-xl">
                <MessageCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-extrabold text-[#172033]">{metrics.conversations_today}</div>
            <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1 ml-1" />
              +24% مقارنة مع الأمس
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-xs hover:border-[#0F9D8C] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#667085]">وقت العمل الموفّر</span>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-extrabold text-[#172033]">{metrics.hours_saved} ساعات</div>
            <p className="text-[11px] text-[#667085] mt-1">توفير جهد 2 موظفي خدمة عملاء</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-xs hover:border-[#0F9D8C] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#667085]">فرص بيع مؤكدة</span>
              <span className="p-2 bg-[#FF7A59]/15 text-[#FF7A59] rounded-xl">
                <Flame className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-extrabold text-[#172033]">{metrics.high_value_opportunities} فرصة</div>
            <p className="text-[11px] text-[#FF7A59] font-bold mt-1">جاهزة للإغلاق والتحصيل</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-xs hover:border-[#0F9D8C] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#667085]">واتساب السحابي</span>
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <div className="text-base font-extrabold text-emerald-600">● متصل بنجاح</div>
            <p className="text-[11px] text-[#667085] mt-1">Meta Cloud Official API</p>
          </div>
        </div>

        {/* Opportunity Radar & Live AI Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Opportunity Radar (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                  <div className="p-2 bg-[#FF7A59]/15 text-[#FF7A59] rounded-xl">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#172033]">رادار الفرص التفاعلي (Opportunity Radar)</h2>
                    <p className="text-xs text-[#667085]">إجراءات مباشرة لزيادة مبيعاتك فورًا</p>
                  </div>
                </div>
              </div>

              {/* Opportunity Tabs */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4 border-b border-[#E7ECF2] pb-3 overflow-x-auto text-xs">
                <button
                  onClick={() => setActiveTab('hot')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 rtl:space-x-reverse ${
                    activeTab === 'hot' ? 'bg-[#FF7A59] text-white shadow-xs' : 'text-[#667085] hover:bg-slate-100'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>فرص ساخنة ({opportunities.hot_leads.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('waiting')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 rtl:space-x-reverse ${
                    activeTab === 'waiting' ? 'bg-[#F59E0B] text-white shadow-xs' : 'text-[#667085] hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>عملاء ينتظرون تدخلاً ({opportunities.waiting_customers.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('unanswered')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 rtl:space-x-reverse ${
                    activeTab === 'unanswered' ? 'bg-[#6C63FF] text-white shadow-xs' : 'text-[#667085] hover:bg-slate-100'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>أسئلة جديدة ({opportunities.unanswered_questions.length})</span>
                </button>
              </div>

              {/* Opportunity Tab Content */}
              <div className="space-y-3">
                {activeTab === 'hot' &&
                  opportunities.hot_leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 bg-[#F6F8FB] rounded-2xl border border-[#E7ECF2] flex items-center justify-between hover:border-[#FF7A59] transition-all"
                    >
                      <div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="text-xs font-bold text-[#172033]">{lead.name}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            {lead.intent} ({lead.score}%)
                          </span>
                        </div>
                        <p className="text-xs text-[#667085] mt-1">{lead.summary}</p>
                      </div>
                      <a
                        href="/inbox"
                        className="px-3 py-1.5 bg-[#0F9D8C] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#0c7d6f] flex items-center space-x-1 rtl:space-x-reverse"
                      >
                        <span>فتح المحادثة</span>
                        <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </a>
                    </div>
                  ))}

                {activeTab === 'waiting' &&
                  opportunities.waiting_customers.map((wait) => (
                    <div
                      key={wait.id}
                      className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-[#172033]">{wait.name}</span>
                        <p className="text-xs text-amber-900 mt-1">{wait.summary}</p>
                      </div>
                      <a
                        href="/inbox"
                        className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-amber-600"
                      >
                        تدخل فوري
                      </a>
                    </div>
                  ))}

                {activeTab === 'unanswered' &&
                  opportunities.unanswered_questions.map((unans, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[#6C63FF]/5 rounded-2xl border border-[#6C63FF]/20 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-[#172033]">سؤال متكرر: "{unans.query}"</span>
                        <p className="text-[11px] text-[#667085] mt-0.5">سأل عنه {unans.count} عملاء هذا الأسبوع</p>
                      </div>
                      <a
                        href="/ai-studio#training"
                        className="px-3 py-1.5 bg-[#6C63FF] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#5850e0]"
                      >
                        تعليم الجواب لـ AI
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Live Dynamic AI Activity Feed (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  <h3 className="text-base font-bold text-[#172033]">بث النشاط المباشر (Live AI Feed)</h3>
                </div>
                <span className="text-[11px] text-[#667085]">تحديث لحظي</span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {liveActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-2xl bg-[#F6F8FB] border border-[#E7ECF2] text-xs space-y-1.5 hover:border-[#0F9D8C] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#172033]">{act.customer_name}</span>
                      <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                    </div>

                    <p className="text-[#667085] italic bg-white p-2 rounded-xl border border-[#E7ECF2]">
                      "{act.query}"
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="font-bold text-[#0F9D8C] flex items-center">
                        <Bot className="w-3.5 h-3.5 mr-1 ml-1" />
                        {act.agent_name}
                      </span>
                      <span className="text-emerald-700 font-semibold">{act.confidence}% ثقة</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
