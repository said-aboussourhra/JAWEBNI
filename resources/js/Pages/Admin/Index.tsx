import React, { useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { router, useForm } from '@inertiajs/react';
import {
  ShieldCheck,
  Building2,
  CreditCard,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Users,
  TrendingUp,
  AlertTriangle,
  FileText,
  Landmark,
  Zap,
  Eye,
  Filter,
  Download,
  ArrowUpRight,
  MapPin,
  Phone,
} from 'lucide-react';

interface Business {
  id: string;
  name: string;
  slug: string;
  city: string;
  phone_number: string;
  status: string;
  ai_readiness_score: number;
  onboarding_completed: boolean;
  users_count?: number;
  created_at: string;
}

interface Payment {
  id: string;
  reference_code: string;
  amount: string;
  currency: string;
  status: string;
  receipt_file_path: string | null;
  admin_notes: string | null;
  created_at: string;
  business: { id: string; name: string; city: string } | null;
  plan: { id: string; name: string; price_mad: string } | null;
}

interface BankSettings {
  id: string;
  bank_name: string;
  account_holder: string;
  rib: string;
  iban: string;
  swift_bic: string;
  instructions: string | null;
}

interface AdminProps {
  businesses: Business[];
  pendingPayments: Payment[];
  allPayments: Payment[];
  bankSettings: BankSettings | null;
}

export default function AdminIndex({
  businesses = [],
  pendingPayments = [],
  allPayments = [],
  bankSettings,
}: AdminProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'payments' | 'bank'>('overview');
  const [searchBiz, setSearchBiz] = useState('');
  const [rejectModal, setRejectModal] = useState<{ open: boolean; paymentId: string | null }>({
    open: false,
    paymentId: null,
  });
  const [rejectReason, setRejectReason] = useState('');

  const bankForm = useForm({
    bank_name: bankSettings?.bank_name || 'Attijariwafa Bank',
    account_holder: bankSettings?.account_holder || 'JAWEBNI SARL AU',
    rib: bankSettings?.rib || '007 780 0001234567890123 45',
    iban: bankSettings?.iban || 'MA64 007 780 0001234567890123 45',
    swift_bic: bankSettings?.swift_bic || 'BCMAMAMC',
    instructions: bankSettings?.instructions || 'يرجى إرسال إيصال التحويل مع ذكر المرجع JW-XXXX في بيان التحويل. سيتم تفعيل الاشتراك خلال 2-4 ساعات بعد المراجعة.',
  });

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchBiz.toLowerCase()) ||
      b.city.toLowerCase().includes(searchBiz.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchBiz.toLowerCase())
  );

  const handleApprove = (id: string) => {
    router.post(`/admin/payments/${id}/approve`, {}, { preserveScroll: true });
  };

  const handleReject = () => {
    if (!rejectModal.paymentId || !rejectReason.trim()) return;
    router.post(
      `/admin/payments/${rejectModal.paymentId}/reject`,
      { reason: rejectReason },
      {
        preserveScroll: true,
        onSuccess: () => {
          setRejectModal({ open: false, paymentId: null });
          setRejectReason('');
        },
      }
    );
  };

  const handleBankUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    bankForm.post('/admin/bank-settings', { preserveScroll: true });
  };

  const totalRevenue = allPayments
    .filter((p) => p.status === 'approved')
    .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

  return (
    <AppShell activeHub="admin" title="مركز التحكم العام — Jawebni Super Admin">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#172033]">مركز التحكم العام (Super Admin Control Center)</h1>
              <p className="text-xs text-[#667085] mt-1">
                مراجعة مدفوعات التحويل البنكي (RIB / IBAN)، إدارة المستأجرين، ومراقبة تكاليف نماذج AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold border border-emerald-200">
              ● {businesses.length} نشاط تجاري نشط
            </span>
            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl font-bold border border-amber-200">
              {pendingPayments.length} مدفوعات قيد المراجعة
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E7ECF2] pb-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
            { id: 'businesses', label: `المستأجرون (${businesses.length})`, icon: Building2 },
            { id: 'payments', label: `المدفوعات (${allPayments.length})`, icon: CreditCard },
            { id: 'bank', label: 'إعدادات البنك RIB/IBAN', icon: Landmark },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-[#172033] text-white shadow-md' : 'bg-white text-[#667085] border border-[#E7ECF2] hover:border-[#172033]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#667085]">إجمالي الإيرادات المؤكدة</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-[#172033]">{totalRevenue.toLocaleString()} MAD</div>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">+12% هذا الشهر</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#667085]">مدفوعات قيد المراجعة</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-extrabold text-amber-600">{pendingPayments.length}</div>
                <p className="text-[11px] text-[#667085] mt-1">تتطلب موافقة فورية</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#667085]">متوسط جاهزية AI</span>
                  <Zap className="w-4 h-4 text-[#0F9D8C]" />
                </div>
                <div className="text-2xl font-extrabold text-[#0F9D8C]">
                  {businesses.length ? Math.round(businesses.reduce((s, b) => s + (b.ai_readiness_score || 0), 0) / businesses.length) : 0}%
                </div>
                <p className="text-[11px] text-[#667085] mt-1">معدل تدريب الموظفين</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#667085]">نشاط تجاري جديد اليوم</span>
                  <Building2 className="w-4 h-4 text-[#6C63FF]" />
                </div>
                <div className="text-2xl font-extrabold text-[#172033]">3</div>
                <p className="text-[11px] text-[#6C63FF] font-bold mt-1">قفطان، تجميل، مطاعم</p>
              </div>
            </div>

            {/* Pending Payments Quick Action */}
            <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#E7ECF2] flex items-center justify-between">
                <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  مدفوعات تتطلب مراجعة فورية (Pending Review)
                </h3>
                <button
                  onClick={() => setActiveTab('payments')}
                  className="text-xs font-bold text-[#0F9D8C] hover:underline flex items-center gap-1"
                >
                  عرض الكل <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="divide-y divide-[#E7ECF2]">
                {pendingPayments.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">لا توجد مدفوعات قيد المراجعة حالياً ✓</div>
                ) : (
                  pendingPayments.slice(0, 3).map((p) => (
                    <div key={p.id} className="p-5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                          {p.business?.name?.substring(0, 2) || 'JW'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#172033]">{p.business?.name || 'نشاط غير معروف'} — {p.plan?.name}</div>
                          <div className="text-[11px] text-[#667085]">{p.reference_code} • {p.amount} {p.currency} • منذ {new Date(p.created_at).toLocaleDateString('ar-MA')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> موافقة وتفعيل
                        </button>
                        <button
                          onClick={() => setRejectModal({ open: true, paymentId: p.id })}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl"
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Businesses Tab */}
        {activeTab === 'businesses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="ابحث باسم النشاط، المدينة، أو slug..."
                  value={searchBiz}
                  onChange={(e) => setSearchBiz(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 pr-9 bg-white border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
              <span className="text-xs text-[#667085]">{filteredBusinesses.length} نتيجة</span>
            </div>

            <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-sm overflow-hidden">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#F6F8FB] border-b border-[#E7ECF2] text-[#667085] font-bold">
                  <tr>
                    <th className="p-4">النشاط التجاري</th>
                    <th className="p-4">المدينة</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">جاهزية AI</th>
                    <th className="p-4">المستخدمون</th>
                    <th className="p-4">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7ECF2]">
                  {filteredBusinesses.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#123B3A] text-white flex items-center justify-center font-bold text-xs">
                            {b.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-[#172033]">{b.name}</div>
                            <div className="text-[11px] text-[#667085]">{b.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {b.city}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            b.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#0F9D8C] rounded-full" style={{ width: `${b.ai_readiness_score}%` }} />
                          </div>
                          <span className="font-bold text-[#0F9D8C]">{b.ai_readiness_score}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {b.users_count || 1}
                        </span>
                      </td>
                      <td className="p-4 text-[#667085]">{new Date(b.created_at).toLocaleDateString('ar-MA')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E7ECF2] shadow-sm overflow-hidden">
                <div className="p-5 border-b border-[#E7ECF2] flex items-center justify-between">
                  <h3 className="font-bold text-[#172033]">سجل المدفوعات الكامل</h3>
                  <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full">{allPayments.length} عملية</span>
                </div>
                <div className="divide-y divide-[#E7ECF2] max-h-[600px] overflow-y-auto">
                  {allPayments.map((p) => (
                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#172033]">{p.reference_code}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : p.status === 'pending_review'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#667085] mt-1">
                          {p.business?.name} • {p.plan?.name} • {p.amount} MAD • {new Date(p.created_at).toLocaleDateString('ar-MA')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.receipt_file_path && (
                          <button className="p-2 bg-white border border-[#E7ECF2] rounded-xl hover:border-[#0F9D8C]">
                            <FileText className="w-4 h-4 text-[#667085]" />
                          </button>
                        )}
                        {p.status === 'pending_review' && (
                          <>
                            <button
                              onClick={() => handleApprove(p.id)}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setRejectModal({ open: true, paymentId: p.id })}
                              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#123B3A] to-[#0F9D8C] text-white p-6 rounded-3xl shadow-xl">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  ملخص مالي سريع
                </h3>
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/20">
                    <span className="text-white/70">إجمالي مقبول</span>
                    <span className="font-bold">{totalRevenue.toLocaleString()} MAD</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/20">
                    <span className="text-white/70">قيد المراجعة</span>
                    <span className="font-bold">{pendingPayments.length} عملية</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/20">
                    <span className="text-white/70">مرفوضة</span>
                    <span className="font-bold">{allPayments.filter((p) => p.status === 'rejected').length}</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      يتم تفعيل الاشتراك تلقائياً عند الموافقة على الدفع، ويمتد لمدة شهر كامل من تاريخ الموافقة.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Settings Tab */}
        {activeTab === 'bank' && (
          <div className="max-w-3xl">
            <div className="bg-white p-8 rounded-3xl border border-[#E7ECF2] shadow-sm">
              <h3 className="text-base font-bold text-[#172033] mb-1 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#0F9D8C]" />
                إعدادات الحساب البنكي للتحويلات (RIB / IBAN)
              </h3>
              <p className="text-xs text-[#667085] mb-6">هذه المعلومات ستظهر للعملاء في صفحة الفوترة عند اختيار الدفع عبر التحويل البنكي.</p>

              <form onSubmit={handleBankUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">اسم البنك</label>
                    <input
                      type="text"
                      value={bankForm.data.bank_name}
                      onChange={(e) => bankForm.setData('bank_name', e.target.value)}
                      className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">صاحب الحساب</label>
                    <input
                      type="text"
                      value={bankForm.data.account_holder}
                      onChange={(e) => bankForm.setData('account_holder', e.target.value)}
                      className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">RIB (رقم الحساب البنكي)</label>
                    <input
                      type="text"
                      value={bankForm.data.rib}
                      onChange={(e) => bankForm.setData('rib', e.target.value)}
                      className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">IBAN</label>
                    <input
                      type="text"
                      value={bankForm.data.iban}
                      onChange={(e) => bankForm.setData('iban', e.target.value)}
                      className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">SWIFT / BIC</label>
                    <input
                      type="text"
                      value={bankForm.data.swift_bic}
                      onChange={(e) => bankForm.setData('swift_bic', e.target.value)}
                      className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#172033] block mb-1.5">تعليمات الدفع للعملاء</label>
                  <textarea
                    rows={4}
                    value={bankForm.data.instructions}
                    onChange={(e) => bankForm.setData('instructions', e.target.value)}
                    className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={bankForm.processing}
                  className="px-6 py-3 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  حفظ معلومات البنك بأمان
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal.open && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#E7ECF2] shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-[#172033]">رفض عملية الدفع مع توضيح السبب</h3>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="مثال: الإيصال غير واضح، المبلغ غير مطابق، المرجع مفقود..."
                className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl outline-none focus:border-red-400"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setRejectModal({ open: false, paymentId: null })}
                  className="px-4 py-2 text-xs font-bold text-[#667085] hover:text-[#172033]"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleReject}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
                >
                  تأكيد الرفض
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
