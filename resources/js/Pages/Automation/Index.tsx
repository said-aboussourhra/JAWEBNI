import React, { useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { router, useForm } from '@inertiajs/react';
import {
  GitBranch,
  Zap,
  PlusCircle,
  Play,
  Pause,
  Trash2,
  Edit3,
  Clock,
  MessageSquare,
  ShoppingBag,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Settings,
  Layers,
  Bot,
  Target,
  Timer,
  Filter,
  Search,
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  is_active: boolean;
  execution_count: number;
  nodes: any;
  edges: any;
  created_at: string;
}

interface AutomationProps {
  workflows: Workflow[];
}

const triggerIcons: Record<string, any> = {
  new_message: MessageSquare,
  purchase_intent: ShoppingBag,
  booking_created: Clock,
  human_handoff: UserCheck,
  complaint_detected: AlertTriangle,
};

const triggerLabels: Record<string, string> = {
  new_message: 'رسالة جديدة على واتساب',
  purchase_intent: 'نية شراء مكتشفة',
  booking_created: 'حجز موعد جديد',
  human_handoff: 'تحويل لموظف بشري',
  complaint_detected: 'شكوى مكتشفة',
};

export default function AutomationIndex({ workflows = [] }: AutomationProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(workflows[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const createForm = useForm({
    name: '',
    description: '',
    trigger_type: 'new_message',
    nodes: [],
    edges: [],
  });

  const filteredWorkflows = workflows.filter((w) => w.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post('/automation/store', {
      preserveScroll: true,
      onSuccess: () => {
        setShowCreateModal(false);
        createForm.reset();
      },
    });
  };

  const presetWorkflows = [
    {
      name: 'ترحيب فوري + كتالوج المنتجات',
      trigger: 'new_message',
      desc: 'عند أول رسالة من زبون جديد، يرسل AI رسالة ترحيب بالدارجة مع كتالوج القفطان والجلابة.',
      nodes: 4,
      active: true,
    },
    {
      name: 'تذكير بموعد القياس قبل 24 ساعة',
      trigger: 'booking_created',
      desc: 'إرسال تذكير واتساب تلقائي للزبون قبل موعد القياس مع موقع المحل على الخريطة.',
      nodes: 3,
      active: true,
    },
    {
      name: 'متابعة سلة مهجورة بعد 2 ساعة',
      trigger: 'purchase_intent',
      desc: 'إذا سأل الزبون عن السعر ولم يؤكد الطلب، يتم إرسال رسالة متابعة مع خصم 10%.',
      nodes: 5,
      active: false,
    },
    {
      name: 'تصعيد شكوى فوري للمدير',
      trigger: 'complaint_detected',
      desc: 'عند اكتشاف كلمات شكوى (استرجاع، فلوسي، نصابين)، يتم تحويل المحادثة فوراً مع إشعار المدير.',
      nodes: 2,
      active: true,
    },
  ];

  return (
    <AppShell activeHub="automation" title="الأتمتة ومسارات العمل — Workflows">
      <div className="flex h-full w-full bg-[#F6F8FB] overflow-hidden">
        {/* Left Panel: Workflows List */}
        <div className="w-84 md:w-96 bg-white border-r border-[#E7ECF2] flex flex-col h-full overflow-hidden shrink-0">
          <div className="p-5 border-b border-[#E7ECF2] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#0F9D8C] text-white rounded-xl shadow-md">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-sm font-extrabold text-[#172033]">محرك الأتمتة المرئي</h1>
                  <p className="text-[11px] text-[#667085]">Visual Automation Engine</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white rounded-xl shadow-sm"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="ابحث في مسارات العمل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs py-2.5 px-3 pr-9 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200">
                ● {workflows.filter((w) => w.is_active).length} نشط
              </span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-bold">
                {workflows.length} إجمالي
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredWorkflows.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Layers className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 font-bold">لا توجد مسارات عمل بعد</p>
                <p className="text-[11px] text-slate-400 mt-1">أنشئ أول مسار أتمتة ذكي الآن</p>
              </div>
            ) : (
              filteredWorkflows.map((wf) => {
                const TriggerIcon = triggerIcons[wf.trigger_type] || Zap;
                const isActive = activeWorkflow?.id === wf.id;
                return (
                  <div
                    key={wf.id}
                    onClick={() => setActiveWorkflow(wf)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isActive ? 'bg-[#0F9D8C]/10 border-[#0F9D8C] shadow-sm' : 'bg-[#F6F8FB] border-[#E7ECF2] hover:border-[#0F9D8C]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${wf.is_active ? 'bg-[#0F9D8C] text-white' : 'bg-slate-200 text-slate-500'}`}>
                          <TriggerIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#172033] line-clamp-1">{wf.name}</div>
                          <div className="text-[11px] text-[#667085] mt-0.5">{triggerLabels[wf.trigger_type] || wf.trigger_type}</div>
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${wf.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    </div>
                    {wf.description && <p className="text-[11px] text-[#667085] mt-2 line-clamp-2">{wf.description}</p>}
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-[#667085]">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {wf.execution_count} تنفيذ
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(wf.created_at).toLocaleDateString('ar-MA')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Preset Templates */}
            <div className="pt-4 border-t border-[#E7ECF2] mt-4">
              <h4 className="text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-3">قوالب جاهزة مقترحة</h4>
              <div className="space-y-2">
                {presetWorkflows.map((preset, idx) => {
                  const Icon = triggerIcons[preset.trigger] || Zap;
                  return (
                    <div key={idx} className="p-3 bg-gradient-to-br from-white to-[#F6F8FB] rounded-xl border border-[#E7ECF2] hover:border-[#6C63FF] transition-all">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-3.5 h-3.5 text-[#6C63FF]" />
                        <span className="text-xs font-bold text-[#172033]">{preset.name}</span>
                      </div>
                      <p className="text-[11px] text-[#667085] leading-relaxed">{preset.desc}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] bg-[#6C63FF]/10 text-[#6C63FF] px-2 py-0.5 rounded-full font-bold">{preset.nodes} خطوات</span>
                        <button className="text-[11px] font-bold text-[#0F9D8C] hover:underline">استخدام القالب →</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Visual Builder Canvas */}
        <div className="flex-1 flex flex-col h-full bg-[#F6F8FB] overflow-hidden">
          {activeWorkflow ? (
            <>
              {/* Canvas Header */}
              <div className="bg-white border-b border-[#E7ECF2] p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#172033] text-white rounded-xl">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#172033]">{activeWorkflow.name}</h2>
                    <p className="text-[11px] text-[#667085]">{activeWorkflow.description || 'مسار أتمتة ذكي بدون وصف'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                      activeWorkflow.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${activeWorkflow.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {activeWorkflow.is_active ? 'نشط ويعمل' : 'متوقف مؤقتاً'}
                  </span>
                  <button className="p-2 bg-white border border-[#E7ECF2] rounded-xl hover:border-[#0F9D8C]">
                    <Settings className="w-4 h-4 text-[#667085]" />
                  </button>
                </div>
              </div>

              {/* Visual Flow Canvas */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Trigger Node */}
                  <div className="relative">
                    <div className="bg-white p-5 rounded-2xl border-2 border-[#0F9D8C] shadow-md shadow-[#0F9D8C]/10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#0F9D8C] text-white rounded-xl">
                          {React.createElement(triggerIcons[activeWorkflow.trigger_type] || Zap, { className: 'w-4 h-4' })}
                        </div>
                        <span className="text-xs font-bold text-[#0F9D8C] uppercase tracking-wider">TRIGGER • نقطة الانطلاق</span>
                      </div>
                      <h3 className="text-sm font-bold text-[#172033]">{triggerLabels[activeWorkflow.trigger_type] || activeWorkflow.trigger_type}</h3>
                      <p className="text-xs text-[#667085] mt-1">عندما يحدث هذا الحدث، سيتم تشغيل مسار الأتمتة تلقائياً</p>
                    </div>
                    <div className="flex justify-center my-2">
                      <div className="w-0.5 h-8 bg-[#0F9D8C]/30" />
                    </div>
                  </div>

                  {/* Condition Node */}
                  <div className="relative">
                    <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                          <Filter className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">CONDITION • شرط ذكي</span>
                      </div>
                      <h3 className="text-sm font-bold text-[#172033]">هل العميل من مدينة الدار البيضاء ولديه Lead Score &gt; 80؟</h3>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-200">نعم → متابعة المسار</span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold">لا → إنهاء</span>
                      </div>
                    </div>
                    <div className="flex justify-center my-2">
                      <div className="w-0.5 h-8 bg-amber-200" />
                    </div>
                  </div>

                  {/* Action Nodes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm hover:border-[#6C63FF] transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-[#6C63FF]/15 text-[#6C63FF] rounded-xl">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-[#6C63FF]">ACTION • إرسال رسالة</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#172033]">رسالة ترحيب بالدارجة + كتالوج</h4>
                      <p className="text-[11px] text-[#667085] mt-2 p-2 bg-[#F6F8FB] rounded-xl border">
                        "مرحباً {`{customer_name}`} 👋، أهلاً بك في {`{business_name}`}! كاين عندنا قفطان ملكي بثمن يبدأ من 1,850 درهم والتوصيل مجاني لكازا..."
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-[#667085]">
                        <Timer className="w-3 h-3" />
                        تأخير: فوري (0 ثانية)
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm hover:border-emerald-500 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                          <Target className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600">ACTION • تحديث Lead Score</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#172033]">رفع معدل الاهتمام إلى 85%</h4>
                      <p className="text-[11px] text-[#667085] mt-1">وإضافة وسم "مهتم بالقفطان الملكي" تلقائياً</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">VIP Lead</span>
                        <span className="px-2 py-1 bg-[#0F9D8C]/10 text-[#0F9D8C] rounded-full text-[10px] font-bold">Caftan Lover</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-0.5 h-8 bg-[#E7ECF2]" />
                  </div>

                  {/* End Node */}
                  <div className="bg-gradient-to-r from-[#0F9D8C] to-[#123B3A] text-white p-5 rounded-2xl shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">نهاية المسار — تم بنجاح</h4>
                        <p className="text-xs text-white/70 mt-0.5">تم تنفيذ {activeWorkflow.execution_count} مرة • معدل نجاح 96%</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/50 rtl:rotate-180" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="bg-white p-4 rounded-2xl border border-[#E7ECF2] text-center">
                      <div className="text-lg font-extrabold text-[#172033]">{activeWorkflow.execution_count}</div>
                      <div className="text-[11px] text-[#667085]">إجمالي التنفيذ</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-[#E7ECF2] text-center">
                      <div className="text-lg font-extrabold text-emerald-600">96%</div>
                      <div className="text-[11px] text-[#667085]">معدل النجاح</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-[#E7ECF2] text-center">
                      <div className="text-lg font-extrabold text-[#0F9D8C]">1.2s</div>
                      <div className="text-[11px] text-[#667085]">متوسط التنفيذ</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-[#0F9D8C]/10 text-[#0F9D8C] rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-[#172033]">اختر مسار أتمتة لعرض تفاصيله المرئية</h3>
                <p className="text-xs text-[#667085] mt-2 leading-relaxed">
                  محرك الأتمتة المرئي يسمح لك ببناء تدفقات ذكية مبنية على نية العميل، بدون كتابة كود. اسحب وأفلت الخطوات، حدد الشروط، وشاهد التنفيذ المباشر.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 px-6 py-2.5 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  إنشاء أول مسار أتمتة
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#E7ECF2] shadow-2xl">
              <h3 className="text-base font-bold text-[#172033] mb-1">إنشاء مسار أتمتة جديد</h3>
              <p className="text-xs text-[#667085] mb-5">حدد نقطة الانطلاق والهدف من الأتمتة</p>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#172033] block mb-1.5">اسم المسار</label>
                  <input
                    type="text"
                    placeholder="مثال: ترحيب فوري + إرسال كتالوج"
                    value={createForm.data.name}
                    onChange={(e) => createForm.setData('name', e.target.value)}
                    className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#172033] block mb-1.5">الوصف (اختياري)</label>
                  <textarea
                    rows={3}
                    placeholder="اشرح ماذا سيفعل هذا المسار..."
                    value={createForm.data.description}
                    onChange={(e) => createForm.setData('description', e.target.value)}
                    className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#172033] block mb-1.5">نقطة الانطلاق (Trigger)</label>
                  <select
                    value={createForm.data.trigger_type}
                    onChange={(e) => createForm.setData('trigger_type', e.target.value)}
                    className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none bg-white"
                  >
                    <option value="new_message">رسالة جديدة على واتساب</option>
                    <option value="purchase_intent">نية شراء مكتشفة</option>
                    <option value="booking_created">حجز موعد جديد</option>
                    <option value="human_handoff">تحويل لموظف بشري</option>
                    <option value="complaint_detected">شكوى مكتشفة</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-bold text-[#667085] hover:text-[#172033]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={createForm.processing}
                    className="px-6 py-2.5 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    إنشاء المسار وتفعيله
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
