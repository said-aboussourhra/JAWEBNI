import React, { useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { router, useForm, usePage } from '@inertiajs/react';
import {
  Settings as SettingsIcon,
  CreditCard,
  Building2,
  Shield,
  CheckCircle2,
  Upload,
  Loader2,
  Wallet,
  Clock,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price_mad: number;
  messages_limit: number;
  numbers_limit: number;
  features: string[];
  is_popular: boolean;
}

interface Payment {
  id: string;
  reference_code: string;
  amount: number;
  currency: string;
  status: string;
  created_at?: string | null;
}

interface SettingsProps {
  plans: Plan[];
  subscription: any;
  bankSettings: any;
  payments: Payment[];
  usage?: { used: number; limit: number; remaining: number; percentage: number; active: boolean; plan?: string | null };
}

export default function SettingsIndex({
  plans = [],
  subscription = null,
  bankSettings = null,
  payments = [],
  usage,
}: SettingsProps) {
  const { t } = useLanguage();
  const { auth } = usePage<{ auth: any }>().props;
  const [selectedPlan, setSelectedPlan] = useState<string>(plans[0]?.id ?? '');

  const transferForm = useForm<{ plan_id: string; receipt: File | null }>({
    plan_id: plans[0]?.id ?? '',
    receipt: null,
  });

  const submitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    transferForm.post('/settings/bank-transfer', {
      preserveScroll: true,
      onSuccess: () => transferForm.reset('receipt'),
    });
  };

  const activePlan = plans.find((plan) => plan.id === subscription?.plan_id);

  return (
    <AppShell activeHub="settings" activeSection="overview" title="إعدادات النظام — Settings & Billing">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-xs">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-3 bg-[#172033] text-white rounded-2xl shadow-md">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#172033]">إعدادات النشاط التجاري والاشتراك</h1>
              <p className="text-xs text-[#667085] mt-0.5">
                {auth?.business?.name} • {auth?.business?.city} • العملة: {auth?.business?.currency ?? 'MAD'}
              </p>
            </div>
          </div>

          {usage && (
            <div className="text-left">
              <p className="text-[11px] text-[#667085] font-bold">
                استهلاك الرسائل: {usage.used} / {usage.limit}
              </p>
              <div className="w-52 h-2 bg-[#F1F4F8] rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${usage.percentage > 85 ? 'bg-rose-500' : 'bg-[#0F9D8C]'}`}
                  style={{ width: `${Math.min(100, usage.percentage)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Current subscription */}
        <div className="bg-gradient-to-l from-[#123B3A] to-[#0F9D8C] rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Wallet className="w-7 h-7" />
            <div>
              <p className="text-sm font-extrabold">
                {activePlan ? `الباقة الحالية: ${activePlan.name}` : 'لا يوجد اشتراك مفعل'}
              </p>
              <p className="text-[11px] text-white/80 mt-0.5">
                {subscription
                  ? `الحالة: ${subscription.status} • ينتهي في: ${subscription.ends_at ?? '—'}`
                  : 'اختر باقة وأرسل التحويل البنكي لتفعيل موظفك الذكي فوراً'}
              </p>
            </div>
          </div>

          {subscription && (
            <span
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                subscription.status === 'active' ? 'bg-white/20' : 'bg-rose-500/80'
              }`}
            >
              {subscription.status === 'active' ? 'مفعل ✓' : subscription.status}
            </span>
          )}
        </div>

        {/* Plans */}
        <div>
          <h2 className="text-sm font-extrabold text-[#172033] mb-4 flex items-center space-x-2 rtl:space-x-reverse">
            <Sparkles className="w-4 h-4 text-[#0F9D8C]" />
            <span>باقات الاشتراك (بالدرهم المغربي)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => {
                  setSelectedPlan(plan.id);
                  transferForm.setData('plan_id', plan.id);
                }}
                className={`text-right p-5 rounded-3xl border transition-all ${
                  selectedPlan === plan.id
                    ? 'border-[#0F9D8C] bg-[#DDF7F2] shadow-sm'
                    : 'border-[#E7ECF2] bg-white hover:border-[#0F9D8C]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#172033]">{plan.name}</span>
                  {plan.is_popular && (
                    <span className="text-[10px] font-bold bg-[#6C63FF] text-white px-2 py-1 rounded-lg">
                      الأكثر طلباً
                    </span>
                  )}
                </div>
                <p className="text-2xl font-extrabold text-[#0F9D8C] mt-3">
                  {plan.price_mad}
                  <span className="text-xs text-[#667085] font-bold"> MAD / شهر</span>
                </p>
                <ul className="mt-4 space-y-1.5">
                  {(plan.features ?? []).map((feature) => (
                    <li key={feature} className="flex items-start space-x-2 rtl:space-x-reverse text-[11px] text-[#475467]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D8C] mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-[#98A2B3] mt-4">
                  {plan.messages_limit} رسالة ذكية • {plan.numbers_limit} رقم واتساب
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Bank transfer + bank details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={submitTransfer} className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-extrabold text-[#172033] flex items-center space-x-2 rtl:space-x-reverse">
              <CreditCard className="w-4 h-4 text-[#0F9D8C]" />
              <span>إرسال تحويل بنكي (RIB / IBAN)</span>
            </h2>

            {bankSettings ? (
              <div className="bg-[#F6F8FB] rounded-2xl p-4 space-y-1.5 text-xs">
                <p className="font-bold text-[#172033] flex items-center space-x-2 rtl:space-x-reverse">
                  <Building2 className="w-4 h-4 text-[#0F9D8C]" />
                  <span>{bankSettings.bank_name}</span>
                </p>
                <p className="text-[#475467]">صاحب الحساب: {bankSettings.account_holder}</p>
                <p className="text-[#475467] dir-ltr">RIB: {bankSettings.rib}</p>
                <p className="text-[#475467] dir-ltr">IBAN: {bankSettings.iban}</p>
                {bankSettings.swift_bic && <p className="text-[#475467] dir-ltr">SWIFT/BIC: {bankSettings.swift_bic}</p>}
                {bankSettings.instructions && (
                  <p className="text-[11px] text-[#667085] mt-2 leading-relaxed">{bankSettings.instructions}</p>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-700 text-xs p-4 rounded-2xl flex items-start space-x-2 rtl:space-x-reverse">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>لم يتم ضبط المعطيات البنكية من طرف الإدارة بعد.</span>
              </div>
            )}

            <select
              value={transferForm.data.plan_id}
              onChange={(e) => transferForm.setData('plan_id', e.target.value)}
              className="w-full text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              required
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — {plan.price_mad} MAD
                </option>
              ))}
            </select>

            <label className="flex items-center justify-center space-x-2 rtl:space-x-reverse border-2 border-dashed border-[#E7ECF2] rounded-2xl p-5 cursor-pointer hover:border-[#0F9D8C] transition-colors">
              <Upload className="w-4 h-4 text-[#0F9D8C]" />
              <span className="text-xs text-[#667085] font-bold">
                {transferForm.data.receipt ? transferForm.data.receipt.name : 'صورة التوصيل (JPG / PNG / PDF)'}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => transferForm.setData('receipt', e.target.files?.[0] ?? null)}
              />
            </label>

            <button
              type="submit"
              disabled={transferForm.processing}
              className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse bg-[#0F9D8C] hover:bg-[#0c8577] text-white text-xs font-bold py-3 rounded-xl disabled:opacity-60"
            >
              {transferForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>إرسال الطلب للمراجعة</span>
            </button>
          </form>

          {/* Payments history */}
          <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E7ECF2]">
              <h2 className="text-sm font-extrabold text-[#172033]">سجل التحويلات البنكية</h2>
            </div>

            {payments.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#667085]">
                <Clock className="w-6 h-6 mx-auto mb-3 text-slate-300" />
                لا توجد تحويلات مسجلة.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-[#F6F8FB] border-b border-[#E7ECF2] text-[#667085] font-bold">
                  <tr>
                    <th className="px-5 py-3 text-right">المرجع</th>
                    <th className="px-5 py-3 text-right">المبلغ</th>
                    <th className="px-5 py-3 text-right">الحالة</th>
                    <th className="px-5 py-3 text-right">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-[#F1F4F8]">
                      <td className="px-5 py-3 font-bold text-[#172033]">{payment.reference_code}</td>
                      <td className="px-5 py-3">
                        {payment.amount} {payment.currency}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-bold ${
                            payment.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-600'
                              : payment.status === 'rejected'
                                ? 'bg-rose-50 text-rose-500'
                                : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#98A2B3]">{payment.created_at ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Business info */}
        <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6">
          <h2 className="text-sm font-extrabold text-[#172033] mb-4 flex items-center space-x-2 rtl:space-x-reverse">
            <Shield className="w-4 h-4 text-[#6C63FF]" />
            <span>معلومات النشاط التجاري</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {[
              { label: 'اسم النشاط', value: auth?.business?.name ?? '—' },
              { label: 'المدينة', value: auth?.business?.city ?? '—' },
              { label: 'رقم الهاتف', value: auth?.business?.phone_number ?? '—' },
              { label: 'اللغة الافتراضية', value: auth?.business?.default_language ?? '—' },
              { label: 'جاهزية الذكاء الاصطناعي', value: `${auth?.business?.ai_readiness_score ?? 0}%` },
              { label: 'المعرّف (Slug)', value: auth?.business?.slug ?? '—' },
            ].map((item) => (
              <div key={item.label} className="bg-[#F6F8FB] rounded-xl p-4">
                <p className="text-[10px] text-[#98A2B3]">{item.label}</p>
                <p className="font-bold text-[#172033] mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
