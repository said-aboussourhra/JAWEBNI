import React from 'react';
import { AppShell } from '@/Layouts/AppShell';
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Bot,
  Users,
  UserCheck,
  Clock,
  Timer,
  CalendarClock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface AnalyticsProps {
  stats: {
    conversations_total: number;
    conversations_today: number;
    messages_total: number;
    ai_messages: number;
    human_messages: number;
    handoffs: number;
    resolution_rate: number;
    avg_latency_ms: number;
    customers_total: number;
    new_customers: number;
    bookings_upcoming: number;
    hours_saved: number;
    automation_rate: number;
  };
  series: Array<{ date: string; label: string; total: number }>;
  intents: Array<{ intent: string; total: number }>;
  agents: Array<{
    id: string;
    name: string;
    type: string;
    conversations_handled: number;
    success_rate: number;
    handoff_rate: number;
    status: string;
  }>;
  period: { from: string; to: string; generated_at: string };
}

const intentLabels: Record<string, string> = {
  purchase_inquiry: 'استفسار عن الشراء',
  appointment_booking: 'حجز موعد',
  order_support: 'تتبع الطلبيات',
  complaint_escalation: 'شكوى واسترجاع',
  general_faq: 'أسئلة عامة',
  complaint: 'شكوى',
};

export default function AnalyticsIndex({
  stats,
  series = [],
  intents = [],
  agents = [],
  period,
}: AnalyticsProps) {
  const { t } = useLanguage();

  const maxValue = Math.max(1, ...series.map((point) => point.total));
  const maxIntent = Math.max(1, ...intents.map((intent) => intent.total));

  const cards = [
    { label: 'محادثات اليوم', value: stats.conversations_today, icon: MessageSquare, color: 'text-[#0F9D8C]', hint: `المجموع: ${stats.conversations_total}` },
    { label: 'ردود الذكاء الاصطناعي', value: stats.ai_messages, icon: Bot, color: 'text-[#6C63FF]', hint: `${stats.automation_rate}% من مجموع الرسائل` },
    { label: 'نسبة الحل الآلي', value: `${stats.resolution_rate}%`, icon: TrendingUp, color: 'text-emerald-500', hint: `${stats.handoffs} محادثات تنتظر التدخل البشري` },
    { label: 'ساعات موفّرة', value: stats.hours_saved, icon: Clock, color: 'text-amber-500', hint: `بمتوسط 1.5 دقيقة لكل رد` },
    { label: 'الزبناء المسجلون', value: stats.customers_total, icon: Users, color: 'text-sky-500', hint: `+${stats.new_customers} هذا الأسبوع` },
    { label: 'مواعيد قادمة', value: stats.bookings_upcoming, icon: CalendarClock, color: 'text-[#FF7A59]', hint: 'مؤكدة في الجدول' },
    { label: 'متوسط زمن الرد', value: `${stats.avg_latency_ms} ms`, icon: Timer, color: 'text-[#172033]', hint: 'زمن استجابة النموذج' },
    { label: 'تدخلات بشرية', value: stats.human_messages, icon: UserCheck, color: 'text-rose-500', hint: 'رسائل أرسلها الفريق' },
  ];

  return (
    <AppShell activeHub="analytics" activeSection="overview" title="التحليلات الذكية — Intelligence Storytelling">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-xs">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-3 bg-[#0F9D8C] text-white rounded-2xl shadow-md">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#172033]">
                التحليلات وسرد الرؤى (Intelligence Storytelling)
              </h1>
              <p className="text-xs text-[#667085] mt-0.5">
                إحصائيات حقيقية من قاعدة البيانات • الفترة: {period?.from} → {period?.to}
              </p>
            </div>
          </div>

          <span className="text-[11px] text-[#98A2B3]">آخر تحديث: {period?.generated_at}</span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-[#E7ECF2] p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <card.icon className={`w-5 h-5 ${card.color}`} />
                <span className="text-xl font-extrabold text-[#172033]">{card.value}</span>
              </div>
              <p className="text-[11px] font-bold text-[#172033] mt-2">{card.label}</p>
              <p className="text-[10px] text-[#98A2B3] mt-0.5">{card.hint}</p>
            </div>
          ))}
        </div>

        {/* Volume chart */}
        <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-extrabold text-[#172033]">حجم الرسائل خلال 14 يوماً</h2>
            <span className="text-[11px] text-[#98A2B3]">{series.reduce((sum, p) => sum + p.total, 0)} رسالة</span>
          </div>

          {series.every((point) => point.total === 0) ? (
            <div className="py-10 text-center text-xs text-[#667085]">
              <AlertTriangle className="w-6 h-6 mx-auto mb-3 text-amber-400" />
              لا توجد رسائل مسجلة بعد في هذه الفترة.
            </div>
          ) : (
            <div className="flex items-end justify-between gap-1.5 h-48">
              {series.map((point) => (
                <div key={point.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-[#172033] opacity-0 group-hover:opacity-100 transition-opacity">
                    {point.total}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#0F9D8C] to-[#6C63FF] transition-all duration-300 group-hover:opacity-80"
                    style={{ height: `${Math.max(4, (point.total / maxValue) * 100)}%` }}
                  />
                  <span className="text-[9px] text-[#98A2B3] whitespace-nowrap">{point.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Intents */}
          <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6">
            <h2 className="text-sm font-extrabold text-[#172033] mb-5 flex items-center space-x-2 rtl:space-x-reverse">
              <Sparkles className="w-4 h-4 text-[#6C63FF]" />
              <span>أكثر نوايا الزبناء تكراراً</span>
            </h2>

            {intents.length === 0 ? (
              <p className="text-xs text-[#667085]">لا توجد بيانات كافية بعد.</p>
            ) : (
              <div className="space-y-4">
                {intents.map((intent) => (
                  <div key={intent.intent}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-[#172033]">{intentLabels[intent.intent] ?? intent.intent}</span>
                      <span className="text-[#667085]">{intent.total}</span>
                    </div>
                    <div className="h-2 bg-[#F1F4F8] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0F9D8C] rounded-full"
                        style={{ width: `${(intent.total / maxIntent) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agents performance */}
          <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6">
            <h2 className="text-sm font-extrabold text-[#172033] mb-5">أداء الوكلاء الأذكياء</h2>

            <div className="space-y-3">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F6F8FB]">
                  <div>
                    <p className="text-xs font-bold text-[#172033]">{agent.name}</p>
                    <p className="text-[10px] text-[#667085]">
                      {agent.conversations_handled} محادثة • نجاح {agent.success_rate}%
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className="text-[10px] text-amber-500 font-bold">تحويل {agent.handoff_rate}%</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        agent.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                </div>
              ))}
              {agents.length === 0 && <p className="text-xs text-[#667085]">لا يوجد وكلاء بعد.</p>}
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="bg-gradient-to-l from-[#123B3A] to-[#0F9D8C] rounded-3xl p-6 text-white">
          <h3 className="text-sm font-extrabold mb-2">قصة اليوم (Business Story)</h3>
          <p className="text-xs leading-relaxed text-white/90">
            عالج الموظف الذكي {stats.conversations_today} محادثة اليوم، وولّد {stats.ai_messages} رداً آلياً بنسبة حلّ
            تلقائي بلغت {stats.resolution_rate}%. إجمالي الوقت الذي وفّره لك النظام: {stats.hours_saved} ساعة، مع{' '}
            {stats.handoffs} محادثات فقط تحتاج تدخلك المباشر.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
