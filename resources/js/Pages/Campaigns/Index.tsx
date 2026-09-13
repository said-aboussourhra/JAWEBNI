import React, { useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { useForm } from '@inertiajs/react';
import {
  Megaphone,
  PlusCircle,
  Search,
  Clock,
  CheckCircle2,
  Users,
  Eye,
  MessageSquare,
  TrendingUp,
  Calendar,
  Filter,
  Send,
  BarChart3,
  Target,
  Sparkles,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  target_segment: string;
  status: string;
  total_recipients: number;
  delivered_count: number;
  read_count: number;
  replied_count: number;
  scheduled_at: string;
  template?: { name: string; body_text: string } | null;
  created_at: string;
}

interface Template {
  id: string;
  name: string;
  whatsapp_template_name: string;
  body_text: string;
  status: string;
}

interface CampaignsProps {
  campaigns: Campaign[];
  templates: Template[];
}

export default function CampaignsIndex({ campaigns = [], templates = [] }: CampaignsProps) {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'analytics'>('campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const createForm = useForm({
    name: '',
    template_id: '',
    target_segment: 'all_customers',
    scheduled_at: '',
  });

  const defaultCampaigns: Campaign[] = campaigns.length
    ? campaigns
    : [
        {
          id: '1',
          name: 'عرض قفطان العيد — خصم 20% لفترة محدودة',
          target_segment: 'vip_caftan_lovers',
          status: 'completed',
          total_recipients: 240,
          delivered_count: 238,
          read_count: 195,
          replied_count: 68,
          scheduled_at: '2026-09-10 19:00',
          created_at: '2026-09-09 14:00',
          template: { name: 'eid_caftan_offer', body_text: 'مرحباً {{1}}، عرض العيد المميز: قفطان ملكي بخصم 20% حتى نهاية الأسبوع! التوصيل مجاني...' },
        },
        {
          id: '2',
          name: 'تذكير بمواعيد القياس الأسبوع القادم',
          target_segment: 'booked_customers',
          status: 'scheduled',
          total_recipients: 18,
          delivered_count: 0,
          read_count: 0,
          replied_count: 0,
          scheduled_at: '2026-09-15 09:00',
          created_at: '2026-09-13 10:00',
          template: null,
        },
        {
          id: '3',
          name: 'إطلاق تشكيلة جلابة خريف 2026',
          target_segment: 'all_customers',
          status: 'sending',
          total_recipients: 520,
          delivered_count: 312,
          read_count: 180,
          replied_count: 24,
          scheduled_at: '2026-09-13 18:30',
          created_at: '2026-09-13 16:00',
          template: { name: 'new_jellaba_collection', body_text: 'جديدنا: تشكيلة جلابة خريف 2026 بألوان عصرية وثوب فاخر...' },
        },
      ];

  const defaultTemplates: Template[] = templates.length
    ? templates
    : [
        {
          id: '1',
          name: 'عرض ترويجي عام',
          whatsapp_template_name: 'general_promo_darija',
          body_text: 'مرحباً {{1}}، لدينا عرض خاص لك: {{2}} — للمزيد من التفاصيل رد بكلمة "مهتم".',
          status: 'approved',
        },
        {
          id: '2',
          name: 'تأكيد حجز موعد',
          whatsapp_template_name: 'booking_confirmation',
          body_text: 'تم تأكيد موعدك يوم {{1}} مع {{2}} في {{3}}. ننتظرك بكل شوق!',
          status: 'approved',
        },
        {
          id: '3',
          name: 'تذكير سلة مهجورة',
          whatsapp_template_name: 'abandoned_cart_reminder',
          body_text: 'أهلاً {{1}}، لاحظنا اهتمامك بـ {{2}}. هل ترغب في إتمام الطلب مع خصم 10%؟ استخدم كود: WELCOME10',
          status: 'approved',
        },
      ];

  const filteredCampaigns = defaultCampaigns.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post('/campaigns/store', {
      preserveScroll: true,
      onSuccess: () => {
        setShowCreateModal(false);
        createForm.reset();
      },
    });
  };

  const totalReach = defaultCampaigns.reduce((sum, c) => sum + c.total_recipients, 0);
  const totalDelivered = defaultCampaigns.reduce((sum, c) => sum + c.delivered_count, 0);
  const totalRead = defaultCampaigns.reduce((sum, c) => sum + c.read_count, 0);
  const avgReplyRate = totalDelivered ? Math.round((defaultCampaigns.reduce((sum, c) => sum + c.replied_count, 0) / totalDelivered) * 100) : 0;

  return (
    <AppShell activeHub="campaigns" title="الحملات والإرسال الجماعي — Campaigns">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FF7A59] text-white rounded-2xl shadow-md shadow-[#FF7A59]/20">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#172033]">مركز الحملات والإرسال الجماعي (Campaign Mission Control)</h1>
              <p className="text-xs text-[#667085] mt-1">إنشاء حملات واتساب مستهدفة، تتبع التسليم والقراءة، وتحليل معدل الردود</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-[#FF7A59] hover:bg-[#e56a4a] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            إنشاء حملة جديدة
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#667085]">إجمالي المستهدفين</span>
              <Users className="w-4 h-4 text-[#FF7A59]" />
            </div>
            <div className="text-2xl font-extrabold text-[#172033]">{totalReach.toLocaleString()}</div>
            <p className="text-[11px] text-[#667085] mt-1">عبر {defaultCampaigns.length} حملات</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#667085]">تم التسليم</span>
              <Send className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-blue-600">{totalDelivered}</div>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">{totalReach ? Math.round((totalDelivered / totalReach) * 100) : 0}% معدل تسليم</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#667085]">تمت القراءة</span>
              <Eye className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">{totalRead}</div>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">{totalDelivered ? Math.round((totalRead / totalDelivered) * 100) : 0}% معدل قراءة</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#667085]">معدل الرد</span>
              <MessageSquare className="w-4 h-4 text-[#6C63FF]" />
            </div>
            <div className="text-2xl font-extrabold text-[#6C63FF]">{avgReplyRate}%</div>
            <p className="text-[11px] text-[#6C63FF] font-bold mt-1">تفاعل ممتاز</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E7ECF2] pb-3">
          {[
            { id: 'campaigns', label: `الحملات (${defaultCampaigns.length})`, icon: Megaphone },
            { id: 'templates', label: `القوالب (${defaultTemplates.length})`, icon: Filter },
            { id: 'analytics', label: 'تحليلات الحملات', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === tab.id ? 'bg-[#172033] text-white shadow-md' : 'bg-white text-[#667085] border border-[#E7ECF2]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="ابحث في الحملات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 pr-9 bg-white border border-[#E7ECF2] rounded-xl outline-none focus:border-[#FF7A59]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
              <span className="text-xs text-[#667085]">{filteredCampaigns.length} حملة</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredCampaigns.map((camp) => (
                <div key={camp.id} className="bg-white p-5 rounded-3xl border border-[#E7ECF2] shadow-sm hover:border-[#FF7A59]/50 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#172033] line-clamp-1">{camp.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            camp.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : camp.status === 'scheduled'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {camp.status === 'completed' ? '● مكتملة' : camp.status === 'scheduled' ? '⏰ مجدولة' : '📤 جارٍ الإرسال'}
                        </span>
                        <span className="text-[11px] text-[#667085] flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {camp.target_segment}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#667085] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(camp.scheduled_at).toLocaleDateString('ar-MA')}
                    </span>
                  </div>

                  {camp.template && (
                    <div className="mt-4 p-3 bg-[#F6F8FB] rounded-xl border border-[#E7ECF2] text-xs text-[#667085] line-clamp-2">"{camp.template.body_text}"</div>
                  )}

                  <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-slate-50 rounded-xl border">
                      <div className="text-sm font-bold text-[#172033]">{camp.total_recipients}</div>
                      <div className="text-[10px] text-[#667085]">مستهدف</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="text-sm font-bold text-blue-600">{camp.delivered_count}</div>
                      <div className="text-[10px] text-blue-600">تم التسليم</div>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="text-sm font-bold text-emerald-600">{camp.read_count}</div>
                      <div className="text-[10px] text-emerald-600">قراءة</div>
                    </div>
                    <div className="p-2 bg-[#6C63FF]/10 rounded-xl border border-[#6C63FF]/20">
                      <div className="text-sm font-bold text-[#6C63FF]">{camp.replied_count}</div>
                      <div className="text-[10px] text-[#6C63FF]">ردود</div>
                    </div>
                  </div>

                  <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: `${(camp.delivered_count / camp.total_recipients) * 100}%` }} />
                    <div className="h-full bg-emerald-500" style={{ width: `${(camp.read_count / camp.total_recipients) * 100}%` }} />
                    <div className="h-full bg-[#6C63FF]" style={{ width: `${(camp.replied_count / camp.total_recipients) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultTemplates.map((tpl) => (
              <div key={tpl.id} className="bg-white p-5 rounded-3xl border border-[#E7ECF2] shadow-sm hover:border-[#6C63FF] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-[#172033]">{tpl.name}</h4>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">● {tpl.status}</span>
                </div>
                <div className="text-[11px] text-[#667085] font-mono bg-[#F6F8FB] p-1.5 rounded-lg border mb-3">{tpl.whatsapp_template_name}</div>
                <p className="text-xs text-[#172033] leading-relaxed bg-[#F6F8FB] p-3 rounded-xl border">"{tpl.body_text}"</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-[#667085]">متوافق مع Meta API</span>
                  <button className="text-xs font-bold text-[#6C63FF] hover:underline">استخدام القالب →</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-sm">
              <h3 className="text-sm font-bold text-[#172033] mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FF7A59]" />
                أداء الحملات حسب الشريحة
              </h3>
              <div className="space-y-4">
                {[
                  { segment: 'VIP قفطان', sent: 240, read: 195, replied: 68, color: 'bg-[#0F9D8C]' },
                  { segment: 'عملاء جدد', sent: 180, read: 120, replied: 22, color: 'bg-blue-500' },
                  { segment: 'حجوزات سابقة', sent: 85, read: 70, replied: 18, color: 'bg-amber-500' },
                  { segment: 'سلة مهجورة', sent: 95, read: 55, replied: 28, color: 'bg-[#6C63FF]' },
                ].map((seg) => (
                  <div key={seg.segment} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[#172033]">{seg.segment}</span>
                      <span className="text-[#667085]">
                        {seg.sent} مرسل • {seg.read} قراءة • {seg.replied} رد
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className={`h-full ${seg.color}`} style={{ width: `${(seg.replied / seg.sent) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#FF7A59] to-[#e56a4a] text-white p-6 rounded-3xl shadow-xl">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                توصية ذكية للحملة القادمة
              </h3>
              <p className="text-xs leading-relaxed text-white/90 mb-4">
                بناءً على تحليل 778 رسالة، الشريحة الأعلى تفاعلاً هي "VIP قفطان" بمعدل رد 28%. نوصي بإطلاق حملة جديدة لهذه الشريحة يوم الجمعة 19:00 مع عرض "توصيل مجاني + خصم 15%" لتحقيق أعلى معدل تحويل.
              </p>
              <div className="p-3 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 text-xs">
                <span className="font-bold block">الوقت الأمثل للإرسال:</span>
                <span className="text-white/80">الجمعة 19:00 - 21:00 بتوقيت المغرب (ذروة التفاعل)</span>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#E7ECF2] shadow-2xl">
              <h3 className="text-base font-bold text-[#172033] mb-1">إنشاء حملة واتساب جديدة</h3>
              <p className="text-xs text-[#667085] mb-5">اختر القالب والشريحة المستهدفة وحدد وقت الإرسال</p>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#172033] block mb-1.5">اسم الحملة</label>
                  <input
                    type="text"
                    placeholder="مثال: عرض نهاية الأسبوع للقفطان الملكي"
                    value={createForm.data.name}
                    onChange={(e) => createForm.setData('name', e.target.value)}
                    className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#FF7A59] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#172033] block mb-1.5">القالب (Template)</label>
                  <select
                    value={createForm.data.template_id}
                    onChange={(e) => createForm.setData('template_id', e.target.value)}
                    className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#FF7A59] outline-none bg-white"
                  >
                    <option value="">بدون قالب (رسالة حرة داخل 24h)</option>
                    {defaultTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} — {t.whatsapp_template_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#172033] block mb-1.5">الشريحة المستهدفة</label>
                  <select
                    value={createForm.data.target_segment}
                    onChange={(e) => createForm.setData('target_segment', e.target.value)}
                    className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#FF7A59] outline-none bg-white"
                  >
                    <option value="all_customers">جميع العملاء</option>
                    <option value="vip_caftan_lovers">VIP محبو القفطان</option>
                    <option value="casablanca_clients">عملاء الدار البيضاء</option>
                    <option value="abandoned_cart">سلة مهجورة</option>
                    <option value="booked_customers">أصحاب الحجوزات</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#172033] block mb-1.5">وقت الإرسال المجدول</label>
                  <input
                    type="datetime-local"
                    value={createForm.data.scheduled_at}
                    onChange={(e) => createForm.setData('scheduled_at', e.target.value)}
                    className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#FF7A59] outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-xs font-bold text-[#667085]">
                    إلغاء
                  </button>
                  <button type="submit" disabled={createForm.processing} className="px-6 py-2.5 bg-[#FF7A59] text-white text-xs font-bold rounded-xl shadow-md">
                    جدولة الحملة وإرسالها
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
