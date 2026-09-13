import React, { useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Users,
  Clock,
  Zap,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Flame,
  Target,
  Brain,
  DollarSign,
  Activity,
  Bot,
  Eye,
  ThumbsUp,
  HelpCircle,
} from 'lucide-react';

export default function AnalyticsIndex() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  const kpis = [
    { label: 'معدل حل AI التلقائي', value: '94.2%', change: '+2.1%', icon: Bot, color: 'emerald' },
    { label: 'متوسط زمن الرد', value: '1.2s', change: '-0.3s', icon: Clock, color: 'blue' },
    { label: 'معدل التحويل للمبيعات', value: '38%', change: '+5%', icon: Target, color: 'amber' },
    { label: 'رضا العملاء (CSAT)', value: '4.8/5', change: '+0.2', icon: ThumbsUp, color: 'violet' },
  ];

  const intentData = [
    { intent: 'استفسار شراء قفطان', count: 124, percent: 38, color: 'bg-[#0F9D8C]' },
    { intent: 'تتبع شحنة / توصيل', count: 86, percent: 26, color: 'bg-blue-500' },
    { intent: 'حجز موعد قياس', count: 52, percent: 16, color: 'bg-amber-500' },
    { intent: 'شكوى / استرجاع', count: 18, percent: 6, color: 'bg-red-500' },
    { intent: 'أسئلة عامة FAQ', count: 45, percent: 14, color: 'bg-slate-400' },
  ];

  const topQuestions = [
    { q: 'واش كاين التوصيل لطنجة؟', count: 34, action: 'موجود في المعرفة' },
    { q: 'شحال ثمن القفطان الملكي؟', count: 28, action: 'موجود في الكتالوج' },
    { q: 'واش كتديرو التوصيل لفرنسا؟', count: 14, action: '⚠️ غير موجود - أضف للمعرفة' },
    { q: 'كيفاش نبدل المقاس؟', count: 12, action: '⚠️ يحتاج تحسين' },
  ];

  const tokenUsage = [
    { date: 'الإثنين', tokens: 4200, cost: '1.2 MAD' },
    { date: 'الثلاثاء', tokens: 5800, cost: '1.7 MAD' },
    { date: 'الأربعاء', tokens: 7200, cost: '2.1 MAD' },
    { date: 'الخميس', tokens: 6400, cost: '1.9 MAD' },
    { date: 'الجمعة', tokens: 8900, cost: '2.6 MAD' },
    { date: 'السبت', tokens: 10200, cost: '3.0 MAD' },
    { date: 'الأحد', tokens: 3800, cost: '1.1 MAD' },
  ];

  const businessStory = {
    headline: 'أداء استثنائي هذا الأسبوع: الموظف الذكي حقق 38% معدل تحويل بزيادة 5% عن الأسبوع الماضي.',
    insights: [
      'أكثر منتج طلباً هو القفطان الملكي بالصقلي الحر (1,850 MAD) بنسبة 42% من الاستفسارات.',
      'تم توفير 28 ساعة عمل يدوي بفضل الردود التلقائية خلال 7 أيام.',
      '14 سؤالاً متكرراً حول التوصيل الدولي لم يتم تدريب AI عليها بعد - فرصة لإضافة معرفة جديدة.',
      'ذروة المحادثات بين 19:00 و22:00 بتوقيت المغرب - يُنصح بجدولة حملات ترويجية في هذا التوقيت.',
    ],
  };

  return (
    <AppShell activeHub="analytics" title="التحليلات الذكية — Intelligence Storytelling">
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#6C63FF] text-white rounded-2xl shadow-lg shadow-[#6C63FF]/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#172033]">التحليلات وسرد الرؤى (Intelligence Storytelling)</h1>
              <p className="text-xs text-[#667085] mt-1">إحصائيات استهلاك التوكنز، معدلات التحويل، وأكثر الأسئلة تكراراً — قصة أداء نشاطك بذكاء</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#E7ECF2] p-1 rounded-xl text-xs font-bold">
            {[
              { id: 'today', label: 'اليوم' },
              { id: 'week', label: 'هذا الأسبوع' },
              { id: 'month', label: 'هذا الشهر' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-4 py-1.5 rounded-lg transition-all ${period === p.id ? 'bg-[#172033] text-white' : 'text-[#667085] hover:bg-slate-100'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm hover:border-[#0F9D8C] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#667085]">{kpi.label}</span>
                  <span className={`p-2 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600`}>
                    <Icon className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-[#172033]">{kpi.value}</div>
                <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {kpi.change} مقارنة مع الفترة السابقة
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Business Story Narrative */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#123B3A] via-[#0F9D8C] to-[#123B3A] text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#DDF7F2]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#DDF7F2]">Intelligence Storytelling — قصة أداء اليوم</span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold leading-relaxed mb-4">{businessStory.headline}</h2>
              <div className="space-y-3">
                {businessStory.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm leading-relaxed bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    <span className="text-slate-100">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          </div>

          {/* Intent Distribution */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-sm">
            <h3 className="text-sm font-bold text-[#172033] mb-1 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#6C63FF]" />
              توزيع نوايا العملاء (Intent Breakdown)
            </h3>
            <p className="text-[11px] text-[#667085] mb-5">تحليل ذكي لنوعية الأسئلة التي يطرحها الزبائن عبر واتساب</p>
            <div className="space-y-4">
              {intentData.map((item) => (
                <div key={item.intent} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#172033]">{item.intent}</span>
                    <span className="text-[#667085]">
                      {item.count} محادثة • {item.percent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Questions */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-sm">
            <h3 className="text-sm font-bold text-[#172033] mb-1 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              أكثر الأسئلة تكراراً (Top Questions)
            </h3>
            <p className="text-[11px] text-[#667085] mb-4">أسئلة لم يتم تغطيتها بشكل كافٍ في قاعدة المعرفة</p>
            <div className="space-y-3">
              {topQuestions.map((q, idx) => (
                <div key={idx} className="p-3 bg-[#F6F8FB] rounded-xl border border-[#E7ECF2] hover:border-amber-300 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[#172033]">"{q.q}"</span>
                    <span className="text-[10px] bg-white px-2 py-1 rounded-full border font-bold">{q.count}x</span>
                  </div>
                  <div className="text-[11px] mt-2 flex items-center gap-1">
                    {q.action.includes('⚠️') ? (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {q.action}
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {q.action}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Token Usage & Cost */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#0F9D8C]" />
                  استهلاك التوكنز والتكلفة (Token Usage & Cost)
                </h3>
                <p className="text-[11px] text-[#667085] mt-1">تتبع استهلاك نماذج AI وتكلفة التشغيل اليومي</p>
              </div>
              <span className="text-xs font-bold bg-[#DDF7F2] text-[#0F9D8C] px-3 py-1.5 rounded-xl">إجمالي الأسبوع: 47,700 توكن • 13.6 MAD</span>
            </div>

            <div className="space-y-2">
              {tokenUsage.map((day, idx) => {
                const maxTokens = Math.max(...tokenUsage.map((d) => d.tokens));
                const width = (day.tokens / maxTokens) * 100;
                return (
                  <div key={day.date} className="flex items-center gap-3 text-xs">
                    <span className="w-16 font-bold text-[#667085]">{day.date}</span>
                    <div className="flex-1 h-8 bg-[#F6F8FB] rounded-xl overflow-hidden relative border border-[#E7ECF2]">
                      <div className="h-full bg-gradient-to-r from-[#0F9D8C] to-[#6C63FF] rounded-xl flex items-center justify-end pr-3 transition-all" style={{ width: `${width}%` }}>
                        <span className="text-[10px] font-bold text-white">{day.tokens.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="w-16 text-right font-bold text-[#172033]">{day.cost}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-amber-800 block">توصية لتقليل التكلفة:</span>
                <p className="text-amber-700 mt-1 leading-relaxed">
                  استهلاك السبت مرتفع (10,200 توكن). يُنصح بتحسين قاعدة المعرفة (RAG) لتقليل الاعتماد على النماذج الكبيرة، وتفعيل التخزين المؤقت للإجابات المتكررة.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-sm">
          <h3 className="text-sm font-bold text-[#172033] mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0F9D8C]" />
            قمع التحويل من الاستفسار إلى البيع (Conversion Funnel)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            {[
              { stage: 'استفسار أولي', count: 325, percent: 100, color: 'bg-slate-100 text-slate-700' },
              { stage: 'اهتمام بالمنتج', count: 210, percent: 65, color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { stage: 'سؤال عن السعر', count: 148, percent: 46, color: 'bg-amber-50 text-amber-700 border-amber-200' },
              { stage: 'طلب تأكيد', count: 92, percent: 28, color: 'bg-[#DDF7F2] text-[#0F9D8C] border-[#0F9D8C]/30' },
              { stage: 'بيع مؤكد', count: 68, percent: 21, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            ].map((step, idx) => (
              <div key={step.stage} className="relative">
                <div className={`p-4 rounded-2xl border ${step.color} shadow-sm`}>
                  <div className="text-2xl font-extrabold">{step.count}</div>
                  <div className="text-xs font-bold mt-1">{step.stage}</div>
                  <div className="text-[11px] opacity-70 mt-1">{step.percent}% من الإجمالي</div>
                </div>
                {idx < 4 && (
                  <div className="hidden md:block absolute top-1/2 -left-2 w-4 h-0.5 bg-[#E7ECF2] -translate-y-1/2">
                    <ArrowUpRight className="w-3 h-3 text-[#667085] absolute -top-1 -right-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
