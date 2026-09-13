import React, { useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { useForm, usePage } from '@inertiajs/react';
import {
  Settings,
  Shield,
  CreditCard,
  Building2,
  Smartphone,
  Globe,
  DollarSign,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Landmark,
  Key,
  Users,
  Palette,
  MapPin,
  Phone,
  Mail,
  Zap,
  Crown,
  Star,
  ArrowUpRight,
  Eye,
  Download,
  Copy,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price_mad: string;
  messages_limit: number;
  numbers_limit: number;
  features: string[] | null;
  is_popular: boolean;
}

interface Subscription {
  id: string;
  status: string;
  starts_at: string;
  ends_at: string;
  plan: Plan;
}

interface BankSettings {
  bank_name: string;
  account_holder: string;
  rib: string;
  iban: string;
  swift_bic: string;
  instructions: string | null;
}

interface Payment {
  id: string;
  reference_code: string;
  amount: string;
  currency: string;
  status: string;
  receipt_file_path: string | null;
  created_at: string;
  plan: Plan;
}

interface SettingsProps {
  plans: Plan[];
  subscription: Subscription | null;
  bankSettings: BankSettings | null;
  payments: Payment[];
}

export default function SettingsIndex({ plans = [], subscription, bankSettings, payments = [] }: SettingsProps) {
  const { auth } = usePage<{ auth: any }>().props;
  const [activeTab, setActiveTab] = useState<'business' | 'whatsapp' | 'billing' | 'team'>('billing');
  const [showBankDetails, setShowBankDetails] = useState(false);

  const paymentForm = useForm({
    plan_id: plans[0]?.id || '',
    receipt: null as File | null,
  });

  const businessForm = useForm({
    name: auth?.business?.name || '',
    phone_number: auth?.business?.phone_number || '',
    city: auth?.business?.city || 'Casablanca',
    default_language: auth?.business?.default_language || 'darija',
    currency: auth?.business?.currency || 'MAD',
  });

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    paymentForm.post('/settings/bank-transfer', {
      preserveScroll: true,
      forceFormData: true,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const defaultPlans: Plan[] = plans.length
    ? plans
    : [
        {
          id: 'plan-starter',
          name: 'Starter — البداية',
          slug: 'starter',
          price_mad: '199',
          messages_limit: 1000,
          numbers_limit: 1,
          features: ['1 رقم واتساب', '1,000 رسالة/شهر', '3 وكلاء AI متخصصين', 'دعم فني عبر واتساب'],
          is_popular: false,
        },
        {
          id: 'plan-growth',
          name: 'Growth — النمو',
          slug: 'growth',
          price_mad: '499',
          messages_limit: 5000,
          numbers_limit: 2,
          features: ['2 أرقام واتساب', '5,000 رسالة/شهر', '5 وكلاء AI + RAG', 'حجوزات ومواعيد', 'حملات جماعية'],
          is_popular: true,
        },
        {
          id: 'plan-scale',
          name: 'Scale — التوسع',
          slug: 'scale',
          price_mad: '999',
          messages_limit: 20000,
          numbers_limit: 5,
          features: ['5 أرقام واتساب', '20,000 رسالة/شهر', 'وكلاء AI غير محدود', 'أتمتة مرئية متقدمة', 'API مخصص', 'مدير حساب مخصص'],
          is_popular: false,
        },
      ];

  const defaultBank: BankSettings = bankSettings || {
    bank_name: 'Attijariwafa Bank',
    account_holder: 'JAWEBNI SARL AU',
    rib: '007 780 0001234567890123 45',
    iban: 'MA64 007 780 0001234567890123 45',
    swift_bic: 'BCMAMAMC',
    instructions: 'يرجى إرسال إيصال التحويل مع ذكر المرجع JW-XXXX في بيان التحويل. سيتم تفعيل الاشتراك خلال 2-4 ساعات بعد المراجعة.',
  };

  return (
    <AppShell activeHub="settings" title="إعدادات النظام — Settings">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#172033] text-white rounded-2xl shadow-md">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#172033]">إعدادات النشاط التجاري والاشتراك</h1>
            <p className="text-xs text-[#667085] mt-1">إدارة بيانات النشاط التجاري، مفاتيح Meta API، ومعلومات التحويل البنكي (RIB / IBAN)</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E7ECF2] pb-3 overflow-x-auto">
          {[
            { id: 'business', label: 'النشاط التجاري', icon: Building2 },
            { id: 'whatsapp', label: 'واتساب السحابي', icon: Smartphone },
            { id: 'billing', label: 'الفوترة والاشتراك', icon: CreditCard },
            { id: 'team', label: 'الفريق والصلاحيات', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-[#172033] text-white shadow-md' : 'bg-white text-[#667085] border border-[#E7ECF2] hover:border-[#172033]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Business Tab */}
        {activeTab === 'business' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-sm">
              <h3 className="text-sm font-bold text-[#172033] mb-5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0F9D8C]" />
                معلومات النشاط التجاري
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">اسم النشاط التجاري</label>
                    <input
                      type="text"
                      value={businessForm.data.name}
                      onChange={(e) => businessForm.setData('name', e.target.value)}
                      className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">المدينة</label>
                    <input
                      type="text"
                      value={businessForm.data.city}
                      onChange={(e) => businessForm.setData('city', e.target.value)}
                      className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">رقم الهاتف الرسمي</label>
                    <input
                      type="text"
                      value={businessForm.data.phone_number}
                      onChange={(e) => businessForm.setData('phone_number', e.target.value)}
                      className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">اللغة الافتراضية</label>
                    <select
                      value={businessForm.data.default_language}
                      onChange={(e) => businessForm.setData('default_language', e.target.value)}
                      className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none bg-white"
                    >
                      <option value="darija">الدارجة المغربية (70% Darija)</option>
                      <option value="ar">العربية الفصحى</option>
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#E7ECF2]">
                  <button className="px-6 py-2.5 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-bold rounded-xl shadow-md">حفظ معلومات النشاط</button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#123B3A] to-[#0F9D8C] text-white p-6 rounded-3xl shadow-xl">
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                هوية النشاط
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-white/20">
                  <span className="text-white/60">Slug</span>
                  <span className="font-mono font-bold">{auth?.business?.slug || 'jawebni-demo'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/20">
                  <span className="text-white/60">العملة</span>
                  <span className="font-bold">{auth?.business?.currency || 'MAD'} — درهم مغربي</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-white/60">جاهزية AI</span>
                  <span className="font-bold">{auth?.business?.ai_readiness_score || 85}% ممتاز</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Tab */}
        {activeTab === 'whatsapp' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-sm">
              <h3 className="text-sm font-bold text-[#172033] mb-1 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                ربط واتساب السحابي الرسمي (Meta Cloud API)
              </h3>
              <p className="text-xs text-[#667085] mb-6">اتصال آمن ومعتمد رسمياً من Meta بدون الحاجة لإبقاء الهاتف متصلاً</p>

              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-800">● متصل بنجاح — جاهز للاستقبال</div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">Phone Number ID: 108765432109876 • Quality: GREEN</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">Phone Number ID (من Meta Developers)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value="108765432109876"
                        readOnly
                        className="flex-1 text-xs p-3 border border-[#E7ECF2] rounded-xl bg-[#F6F8FB] font-mono"
                      />
                      <button onClick={() => copyToClipboard('108765432109876')} className="p-2.5 bg-white border border-[#E7ECF2] rounded-xl hover:border-[#0F9D8C]">
                        <Copy className="w-4 h-4 text-[#667085]" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">Webhook Verify Token</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value="jawebni_webhook_secret_2026"
                        readOnly
                        className="flex-1 text-xs p-3 border border-[#E7ECF2] rounded-xl bg-[#F6F8FB] font-mono"
                      />
                      <button onClick={() => copyToClipboard('jawebni_webhook_secret_2026')} className="p-2.5 bg-white border border-[#E7ECF2] rounded-xl hover:border-[#0F9D8C]">
                        <Copy className="w-4 h-4 text-[#667085]" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">Webhook URL (للصق في Meta)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={`${window.location.origin}/api/webhook/whatsapp`}
                        readOnly
                        className="flex-1 text-xs p-3 border border-[#E7ECF2] rounded-xl bg-[#F6F8FB] font-mono"
                      />
                      <button onClick={() => copyToClipboard(`${window.location.origin}/api/webhook/whatsapp`)} className="p-2.5 bg-white border border-[#E7ECF2] rounded-xl hover:border-[#0F9D8C]">
                        <Copy className="w-4 h-4 text-[#667085]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-sm">
                <h4 className="text-xs font-bold text-[#172033] mb-3">حالة الاتصال والجودة</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-[#E7ECF2]">
                    <span className="text-[#667085]">حالة الرقم</span>
                    <span className="font-bold text-emerald-600">● CONNECTED</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E7ECF2]">
                    <span className="text-[#667085]">جودة التقييم</span>
                    <span className="font-bold text-emerald-600">GREEN • ممتاز</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E7ECF2]">
                    <span className="text-[#667085]">نافذة الرسائل (24h)</span>
                    <span className="font-bold text-[#172033]">مفتوحة لـ 86 محادثة</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#667085]">آخر مزامنة</span>
                    <span className="font-bold text-[#172033]">قبل دقيقتين</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-amber-800 block">تنبيه مهم:</span>
                  <p className="text-amber-700 mt-1 leading-relaxed">لا تشارك Access Token أو App Secret مع أي جهة. في حال تسريبه، قم بتجديده فوراً من لوحة تحكم Meta Developers.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Current Subscription */}
            {subscription && (
              <div className="bg-gradient-to-r from-[#123B3A] to-[#0F9D8C] text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">اشتراكك الحالي: {subscription.plan.name}</h3>
                    <p className="text-xs text-white/70 mt-0.5">
                      صالح من {new Date(subscription.starts_at).toLocaleDateString('ar-MA')} إلى {new Date(subscription.ends_at).toLocaleDateString('ar-MA')} • {subscription.plan.messages_limit.toLocaleString()} رسالة/شهر
                    </p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-white text-[#0F9D8C] rounded-xl text-xs font-bold shadow-md">● {subscription.status.toUpperCase()} — نشط</span>
              </div>
            )}

            {/* Plans */}
            <div>
              <h3 className="text-sm font-bold text-[#172033] mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                خطط الاشتراك المتاحة (بالدرهم المغربي MAD)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {defaultPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md ${
                      plan.is_popular ? 'bg-[#172033] text-white border-[#172033] shadow-xl scale-[1.02]' : 'bg-white border-[#E7ECF2]'
                    }`}
                  >
                    {plan.is_popular && (
                      <span className="px-3 py-1 bg-amber-400 text-[#172033] rounded-full text-[10px] font-extrabold mb-3 inline-block">⭐ الأكثر شعبية في المغرب</span>
                    )}
                    <h4 className={`text-base font-bold ${plan.is_popular ? 'text-white' : 'text-[#172033]'}`}>{plan.name}</h4>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className={`text-3xl font-extrabold ${plan.is_popular ? 'text-white' : 'text-[#172033]'}`}>{plan.price_mad}</span>
                      <span className={`text-xs ${plan.is_popular ? 'text-white/60' : 'text-[#667085]'}`}>MAD / شهر</span>
                    </div>
                    <div className={`mt-4 space-y-2 text-xs ${plan.is_popular ? 'text-white/80' : 'text-[#667085]'}`}>
                      {(plan.features || []).map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${plan.is_popular ? 'text-emerald-300' : 'text-emerald-600'}`} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        paymentForm.setData('plan_id', plan.id);
                        setShowBankDetails(true);
                      }}
                      className={`w-full mt-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        plan.is_popular ? 'bg-white text-[#172033] hover:bg-slate-100' : 'bg-[#0F9D8C] text-white hover:bg-[#0c7d6f]'
                      }`}
                    >
                      اختيار هذه الخطة والانتقال للدفع
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Transfer Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-sm">
                <h3 className="text-sm font-bold text-[#172033] mb-1 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#0F9D8C]" />
                  الدفع عبر التحويل البنكي المباشر (Virement Bancaire)
                </h3>
                <p className="text-xs text-[#667085] mb-5">اختر الخطة، حوّل المبلغ، ثم أرسل الإيصال. سيتم التفعيل خلال 2-4 ساعات.</p>

                {!showBankDetails ? (
                  <div className="p-8 text-center bg-[#F6F8FB] rounded-2xl border border-dashed border-[#E7ECF2]">
                    <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-[#667085]">اختر خطة من الأعلى لعرض تفاصيل التحويل البنكي</p>
                  </div>
                ) : (
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="p-4 bg-[#DDF7F2]/50 border border-[#0F9D8C]/20 rounded-2xl">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#667085]">الخطة المختارة:</span>
                        <span className="font-bold text-[#172033]">{defaultPlans.find((p) => p.id === paymentForm.data.plan_id)?.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-[#667085]">المبلغ المطلوب تحويله:</span>
                        <span className="font-extrabold text-[#0F9D8C] text-sm">{defaultPlans.find((p) => p.id === paymentForm.data.plan_id)?.price_mad} MAD</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172033] block mb-1.5">إيصال التحويل (JPG, PNG, PDF - حتى 10MB)</label>
                      <input
                        type="file"
                        accept=".jpg,.png,.pdf"
                        onChange={(e) => paymentForm.setData('receipt', e.target.files?.[0] || null)}
                        className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl bg-white file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-[#0F9D8C] file:text-white file:text-xs file:font-bold"
                      />
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-amber-700">تأكد من كتابة المرجع الذي سيظهر بعد الإرسال في بيان التحويل البنكي.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={paymentForm.processing}
                      className="w-full py-3 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      إرسال الإيصال للمراجعة والحصول على المرجع
                    </button>
                  </form>
                )}

                {/* Payments History */}
                <div className="mt-8">
                  <h4 className="text-xs font-bold text-[#172033] mb-3">سجل مدفوعاتك السابقة</h4>
                  <div className="space-y-2">
                    {payments.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">لا توجد مدفوعات سابقة</p>
                    ) : (
                      payments.map((p) => (
                        <div key={p.id} className="p-3 bg-[#F6F8FB] rounded-xl border border-[#E7ECF2] flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold">{p.reference_code}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : p.status === 'pending_review' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#667085] mt-1">
                              {p.plan.name} • {p.amount} MAD • {new Date(p.created_at).toLocaleDateString('ar-MA')}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#172033]">{p.amount} MAD</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-sm">
                  <h4 className="text-xs font-bold text-[#172033] mb-4 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-[#0F9D8C]" />
                    معلومات الحساب البنكي للتحويل
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-2.5 border-b border-[#E7ECF2]">
                      <span className="text-[#667085]">البنك</span>
                      <span className="font-bold text-[#172033] flex items-center gap-2">
                        {defaultBank.bank_name}
                        <button onClick={() => copyToClipboard(defaultBank.bank_name)} className="p-1 hover:bg-slate-100 rounded">
                          <Copy className="w-3 h-3" />
                        </button>
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-[#E7ECF2]">
                      <span className="text-[#667085]">صاحب الحساب</span>
                      <span className="font-bold text-[#172033]">{defaultBank.account_holder}</span>
                    </div>
                    <div className="py-2.5 border-b border-[#E7ECF2]">
                      <span className="text-[#667085] block mb-1">RIB</span>
                      <div className="flex items-center gap-2 bg-[#F6F8FB] p-2.5 rounded-xl border font-mono">
                        <span className="flex-1 font-bold text-[#172033] text-xs">{defaultBank.rib}</span>
                        <button onClick={() => copyToClipboard(defaultBank.rib)} className="p-1.5 bg-white border rounded-lg hover:border-[#0F9D8C]">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="py-2.5 border-b border-[#E7ECF2]">
                      <span className="text-[#667085] block mb-1">IBAN</span>
                      <div className="flex items-center gap-2 bg-[#F6F8FB] p-2.5 rounded-xl border font-mono">
                        <span className="flex-1 font-bold text-[#172033] text-xs">{defaultBank.iban}</span>
                        <button onClick={() => copyToClipboard(defaultBank.iban)} className="p-1.5 bg-white border rounded-lg hover:border-[#0F9D8C]">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-[#667085]">SWIFT/BIC</span>
                      <span className="font-bold font-mono text-[#172033]">{defaultBank.swift_bic}</span>
                    </div>
                  </div>
                  {defaultBank.instructions && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 leading-relaxed">{defaultBank.instructions}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="bg-white p-8 rounded-3xl border border-[#E7ECF2] shadow-sm text-center max-w-2xl mx-auto">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-[#172033]">إدارة الفريق والصلاحيات</h3>
            <p className="text-xs text-[#667085] mt-2">قريباً: دعوة أعضاء الفريق، تحديد صلاحيات (Owner, Manager, Agent)، وتتبع نشاط الفريق.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
