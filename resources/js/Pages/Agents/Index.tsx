import React, { useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { router, useForm, usePage } from '@inertiajs/react';
import {
  Bot,
  Cpu,
  Sparkles,
  Save,
  Loader2,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Target,
  Gauge,
  Timer,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface AgentItem {
  id: string;
  type: string;
  name: string;
  purpose: string;
  instructions: string;
  status: string;
  conversations_handled: number;
  success_rate: number;
  handoff_rate: number;
}

interface ExecutionItem {
  id: string;
  agent_name: string;
  intent: string | null;
  confidence: number;
  latency_ms: number;
  handoff: boolean;
  created_at: string | null;
}

interface AgentsProps {
  agents: AgentItem[];
  recentExecutions: ExecutionItem[];
}

const agentMeta: Record<string, { color: string; gradient: string; icon: any }> = {
  sales: { color: 'text-[#0F9D8C]', gradient: 'from-[#0F9D8C] to-[#0b7a6d]', icon: Target },
  booking: { color: 'text-[#6C63FF]', gradient: 'from-[#6C63FF] to-[#4f47d6]', icon: Gauge },
  support: { color: 'text-sky-500', gradient: 'from-sky-500 to-sky-600', icon: Cpu },
  complaint: { color: 'text-rose-500', gradient: 'from-rose-500 to-rose-600', icon: AlertTriangle },
  faq: { color: 'text-amber-500', gradient: 'from-amber-500 to-amber-600', icon: Sparkles },
};

export default function AgentsIndex({ agents = [], recentExecutions = [] }: AgentsProps) {
  const { t } = useLanguage();
  const { simulation } = usePage<{ simulation?: any }>().props;
  const [editingId, setEditingId] = useState<string | null>(null);

  const agentForm = useForm({ name: '', purpose: '', instructions: '', status: 'active' });
  const simForm = useForm({ message: '' });

  const startEdit = (agent: AgentItem) => {
    setEditingId(agent.id);
    agentForm.setData({
      name: agent.name,
      purpose: agent.purpose ?? '',
      instructions: agent.instructions ?? '',
      status: agent.status ?? 'active',
    });
  };

  const submitEdit = (agentId: string) => {
    agentForm.post(`/agents/${agentId}`, {
      preserveScroll: true,
      onSuccess: () => setEditingId(null),
    });
  };

  const toggleStatus = (agent: AgentItem) => {
    router.post(
      `/agents/${agent.id}`,
      { status: agent.status === 'active' ? 'paused' : 'active' },
      { preserveScroll: true }
    );
  };

  const runSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    simForm.post('/agents/router/simulate', { preserveScroll: true });
  };

  return (
    <AppShell activeHub="agents" activeSection="overview" title="غرفة تحكم الوكلاء — Agents Control Room">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-xs">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-3 bg-[#0F9D8C] text-white rounded-2xl shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#172033]">غرفة تحكم الوكلاء الأذكياء (Agents Control Room)</h1>
              <p className="text-xs text-[#667085] mt-0.5">
                خمسة وكلاء متخصصين يشكلون معاً موظفك الرقمي: المبيعات، الحجوزات، الدعم، الشكاوى والأسئلة الشائعة
              </p>
            </div>
          </div>

          <span className="bg-[#DDF7F2] text-[#0F9D8C] px-3 py-1.5 rounded-xl text-xs font-bold">
            ● {agents.filter((a) => a.status === 'active').length} وكلاء نشطون
          </span>
        </div>

        {/* Router simulator */}
        <form onSubmit={runSimulation} className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-extrabold text-[#172033] flex items-center space-x-2 rtl:space-x-reverse">
            <Sparkles className="w-4 h-4 text-[#6C63FF]" />
            <span>محاكي توجيه النوايا (Intent Router)</span>
          </h2>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              placeholder="اكتب رسالة زبون بالدارجة... مثال: شحال ثمن القفطان وواش كاين التوصيل لكازا؟"
              value={simForm.data.message}
              onChange={(e) => simForm.setData('message', e.target.value)}
              className="flex-1 text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              required
            />
            <button
              type="submit"
              disabled={simForm.processing}
              className="flex items-center justify-center space-x-2 rtl:space-x-reverse bg-[#172033] text-white text-xs font-bold px-5 py-2.5 rounded-xl disabled:opacity-60"
            >
              {simForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>حلّل الرسالة</span>
            </button>
          </div>

          {simulation && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#F6F8FB] border border-[#E7ECF2] text-xs">
              <div>
                <p className="text-[10px] text-[#98A2B3]">الوكيل المختار</p>
                <p className="font-bold text-[#172033]">{simulation.agent_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#98A2B3]">النية المكتشفة</p>
                <p className="font-bold text-[#172033]">{simulation.intent}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#98A2B3]">درجة الثقة</p>
                <p className="font-bold text-[#0F9D8C]">{simulation.confidence}%</p>
              </div>
              <div>
                <p className="text-[10px] text-[#98A2B3]">تحويل بشري؟</p>
                <p className={`font-bold ${simulation.requires_handoff ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {simulation.requires_handoff ? 'نعم، شكوى' : 'لا'}
                </p>
              </div>
            </div>
          )}
        </form>

        {/* Agents grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {agents.map((agent) => {
            const meta = agentMeta[agent.type] ?? agentMeta.faq;
            const Icon = meta.icon;
            const isEditing = editingId === agent.id;

            return (
              <div key={agent.id} className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs overflow-hidden">
                <div className={`bg-gradient-to-l ${meta.gradient} p-5 text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2.5 bg-white/20 rounded-xl">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold">{agent.name}</h3>
                        <p className="text-[11px] text-white/80">{agent.type}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleStatus(agent)}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                      title={agent.status === 'active' ? 'إيقاف مؤقت' : 'تفعيل'}
                    >
                      {agent.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-[#F6F8FB] rounded-xl p-3">
                      <p className="text-lg font-extrabold text-[#172033]">{agent.conversations_handled}</p>
                      <p className="text-[10px] text-[#667085]">محادثة</p>
                    </div>
                    <div className="bg-[#F6F8FB] rounded-xl p-3">
                      <p className="text-lg font-extrabold text-emerald-600">{agent.success_rate}%</p>
                      <p className="text-[10px] text-[#667085]">نجاح</p>
                    </div>
                    <div className="bg-[#F6F8FB] rounded-xl p-3">
                      <p className="text-lg font-extrabold text-amber-500">{agent.handoff_rate}%</p>
                      <p className="text-[10px] text-[#667085]">تحويل</p>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        value={agentForm.data.name}
                        onChange={(e) => agentForm.setData('name', e.target.value)}
                        className="w-full text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                      />
                      <textarea
                        placeholder="الهدف من الوكيل"
                        value={agentForm.data.purpose}
                        onChange={(e) => agentForm.setData('purpose', e.target.value)}
                        rows={2}
                        className="w-full text-xs p-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                      />
                      <textarea
                        placeholder="التعليمات الخاصة بالوكيل"
                        value={agentForm.data.instructions}
                        onChange={(e) => agentForm.setData('instructions', e.target.value)}
                        rows={4}
                        className="w-full text-xs p-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                      />

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => submitEdit(agent.id)}
                          disabled={agentForm.processing}
                          className="flex items-center space-x-2 rtl:space-x-reverse bg-[#0F9D8C] text-white text-xs font-bold px-4 py-2.5 rounded-xl disabled:opacity-60"
                        >
                          {agentForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          <span>حفظ</span>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs font-bold text-[#667085] px-4 py-2.5 rounded-xl hover:bg-[#F6F8FB]"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-[#475467] leading-relaxed">{agent.purpose}</p>
                      <p className="text-[11px] text-[#667085] bg-[#F6F8FB] p-3 rounded-xl leading-relaxed">
                        {agent.instructions}
                      </p>
                      <button
                        onClick={() => startEdit(agent)}
                        className="text-xs font-bold text-[#0F9D8C] hover:underline"
                      >
                        تعديل إعدادات الوكيل ←
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent executions */}
        <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E7ECF2] flex items-center space-x-2 rtl:space-x-reverse">
            <Timer className="w-4 h-4 text-[#0F9D8C]" />
            <h3 className="text-sm font-extrabold text-[#172033]">آخر executions المسجلة</h3>
          </div>

          {recentExecutions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#667085]">
              لا توجد executions بعد. سجل محادثة جديدة عبر الويب هوك أو من صندوق المحادثات.
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-[#F6F8FB] border-b border-[#E7ECF2] text-[#667085] font-bold">
                <tr>
                  <th className="px-5 py-3 text-right">الوكيل</th>
                  <th className="px-5 py-3 text-right">النية</th>
                  <th className="px-5 py-3 text-right">الثقة</th>
                  <th className="px-5 py-3 text-right">زمن المعالجة</th>
                  <th className="px-5 py-3 text-right">تحويل بشري</th>
                  <th className="px-5 py-3 text-right">التوقيت</th>
                </tr>
              </thead>
              <tbody>
                {recentExecutions.map((log) => (
                  <tr key={log.id} className="border-b border-[#F1F4F8]">
                    <td className="px-5 py-3 font-bold text-[#172033]">{log.agent_name}</td>
                    <td className="px-5 py-3">{log.intent ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-[#0F9D8C]">{log.confidence}%</span>
                    </td>
                    <td className="px-5 py-3">{log.latency_ms} ms</td>
                    <td className="px-5 py-3">
                      {log.handoff ? (
                        <span className="text-rose-500 font-bold">نعم</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">لا</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#98A2B3]">{log.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
