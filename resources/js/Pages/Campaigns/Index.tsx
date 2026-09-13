import React, { useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { router, useForm } from '@inertiajs/react';
import {
  Megaphone,
  Send,
  Rocket,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  Users2,
  MessageSquare,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface CampaignItem {
  id: string;
  name: string;
  target_segment: string;
  status: string;
  scheduled_at: string | null;
  template_name?: string | null;
  total_recipients: number;
  delivered_count: number;
  read_count: number;
  replied_count: number;
  conversion_rate: number;
  created_at?: string | null;
}

interface TemplateItem {
  id: string;
  name: string;
  whatsapp_template_name: string;
  language: string;
  body_text: string;
  status?: string | null;
}

interface SegmentItem {
  key: string;
  label: string;
  count: number;
}

interface CampaignsProps {
  campaigns: CampaignItem[];
  templates: TemplateItem[];
  segments: Record<string, SegmentItem>;
  stats: { sent: number; scheduled: number; reached: number; replies: number };
}

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-600',
  sending: 'bg-blue-50 text-blue-600',
  scheduled: 'bg-amber-50 text-amber-600',
  draft: 'bg-slate-100 text-slate-500',
  failed: 'bg-rose-50 text-rose-500',
};

export default function CampaignsIndex({
  campaigns = [],
  templates = [],
  segments = {},
  stats = { sent: 0, scheduled: 0, reached: 0, replies: 0 },
}: CampaignsProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'campaign' | 'template'>('campaign');

  const campaignForm = useForm({
    name: '',
    template_id: templates[0]?.id ?? '',
    target_segment: 'all_customers',
    scheduled_at: '',
  });

  const templateForm = useForm({
    name: '',
    whatsapp_template_name: '',
    language: 'ar',
    category: 'marketing',
    body_text: '',
  });

  const launch = (campaign: CampaignItem) => {
    if (!confirm(`إطلاق الحملة "${campaign.name}" وإرسال الرسائل عبر واتساب؟`)) return;
    router.post(`/campaigns/${campaign.id}/launch`, {}, { preserveScroll: true });
  };

  const remove = (campaign: CampaignItem) => {
    if (!confirm('واش بصّح بغيتي تحذف هاد الحملة؟')) return;
    router.delete(`/campaigns/${campaign.id}`, { preserveScroll: true });
  };

  return (
    <AppShell activeHub="campaigns" activeSection="overview" title="مركز الحملات — Campaign Mission Control">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-xs">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-3 bg-[#6C63FF] text-white rounded-2xl shadow-md">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#172033]">مركز التحكم في الحملات التسويقية</h1>
              <p className="text-xs text-[#667085] mt-0.5">
                أطلق حملات واتساب موجهة حسب شرائح الزبناء وتتبع نسب التسليم والتفاعل
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold">
            <button
              onClick={() => setMode('campaign')}
              className={`px-4 py-2.5 rounded-xl transition-all ${
                mode === 'campaign' ? 'bg-[#0F9D8C] text-white shadow-xs' : 'bg-[#F6F8FB] text-[#667085]'
              }`}
            >
              حملة جديدة
            </button>
            <button
              onClick={() => setMode('template')}
              className={`px-4 py-2.5 rounded-xl transition-all ${
                mode === 'template' ? 'bg-[#172033] text-white shadow-xs' : 'bg-[#F6F8FB] text-[#667085]'
              }`}
            >
              قالب واتساب
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'حملات مُرسلة', value: stats.sent, icon: Send, color: 'text-[#0F9D8C]' },
            { label: 'حملات مجدولة', value: stats.scheduled, icon: Clock, color: 'text-amber-500' },
            { label: 'زبناء تم الوصول إليهم', value: stats.reached, icon: Users2, color: 'text-[#6C63FF]' },
            { label: 'ردود مستلمة', value: stats.replies, icon: MessageSquare, color: 'text-emerald-500' },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-[#E7ECF2] p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <card.icon className={`w-5 h-5 ${card.color}`} />
                <span className="text-2xl font-extrabold text-[#172033]">{card.value}</span>
              </div>
              <p className="text-[11px] text-[#667085] mt-2 font-semibold">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Forms */}
        {mode === 'campaign' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              campaignForm.post('/campaigns/store', {
                preserveScroll: true,
                onSuccess: () => campaignForm.reset(),
              });
            }}
            className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6 space-y-4"
          >
            <h2 className="text-sm font-extrabold text-[#172033] flex items-center space-x-2 rtl:space-x-reverse">
              <Plus className="w-4 h-4 text-[#0F9D8C]" />
              <span>إنشاء حملة جديدة</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                placeholder="اسم الحملة"
                value={campaignForm.data.name}
                onChange={(e) => campaignForm.setData('name', e.target.value)}
                className="md:col-span-2 text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
              <select
                value={campaignForm.data.template_id}
                onChange={(e) => campaignForm.setData('template_id', e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              >
                <option value="">بدون قالب (نص حر)</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={campaignForm.data.scheduled_at}
                onChange={(e) => campaignForm.setData('scheduled_at', e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.values(segments).map((segment) => (
                <button
                  type="button"
                  key={segment.key}
                  onClick={() => campaignForm.setData('target_segment', segment.key)}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    campaignForm.data.target_segment === segment.key
                      ? 'border-[#0F9D8C] bg-[#DDF7F2]'
                      : 'border-[#E7ECF2] bg-white hover:border-[#0F9D8C]/50'
                  }`}
                >
                  <p className="text-[11px] font-bold text-[#172033]">{segment.label}</p>
                  <p className="text-lg font-extrabold text-[#0F9D8C]">{segment.count}</p>
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={campaignForm.processing}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-[#0F9D8C] text-white text-xs font-bold px-5 py-2.5 rounded-xl disabled:opacity-60"
            >
              {campaignForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>إنشاء الحملة</span>
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              templateForm.post('/campaigns/templates', {
                preserveScroll: true,
                onSuccess: () => templateForm.reset(),
              });
            }}
            className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6 space-y-4"
          >
            <h2 className="text-sm font-extrabold text-[#172033]">قالب واتساب معتمد (Meta Template)</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                placeholder="اسم القالب داخلياً"
                value={templateForm.data.name}
                onChange={(e) => templateForm.setData('name', e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
              <input
                placeholder="اسم القالب في Meta"
                value={templateForm.data.whatsapp_template_name}
                onChange={(e) => templateForm.setData('whatsapp_template_name', e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
              <select
                value={templateForm.data.language}
                onChange={(e) => templateForm.setData('language', e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              >
                <option value="ar">العربية / الدارجة</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            <textarea
              placeholder="نص الرسالة... استعمل {{1}} لاسم الزبون"
              value={templateForm.data.body_text}
              onChange={(e) => templateForm.setData('body_text', e.target.value)}
              rows={4}
              className="w-full text-xs p-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              required
            />

            <button
              type="submit"
              disabled={templateForm.processing}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-[#172033] text-white text-xs font-bold px-5 py-2.5 rounded-xl disabled:opacity-60"
            >
              {templateForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>حفظ القالب</span>
            </button>
          </form>
        )}

        {/* Campaigns table */}
        <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs overflow-hidden">
          {campaigns.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#667085]">
              <AlertTriangle className="w-6 h-6 mx-auto mb-3 text-amber-400" />
              لا توجد حملات بعد. أنشئ حملتك الأولى من الأعلى.
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-[#F6F8FB] border-b border-[#E7ECF2] text-[#667085] font-bold">
                <tr>
                  <th className="px-5 py-3 text-right">الحملة</th>
                  <th className="px-5 py-3 text-right">الشريحة</th>
                  <th className="px-5 py-3 text-right">المستهدفون</th>
                  <th className="px-5 py-3 text-right">تم التسليم</th>
                  <th className="px-5 py-3 text-right">الردود</th>
                  <th className="px-5 py-3 text-right">الحالة</th>
                  <th className="px-5 py-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-[#F1F4F8] hover:bg-[#FAFCFD]">
                    <td className="px-5 py-3">
                      <div className="font-bold text-[#172033]">{campaign.name}</div>
                      <div className="text-[10px] text-[#98A2B3]">
                        {campaign.template_name ? `القالب: ${campaign.template_name}` : 'رسالة نصية حرة'}
                        {campaign.scheduled_at ? ` • ${campaign.scheduled_at}` : ''}
                      </div>
                    </td>
                    <td className="px-5 py-3">{segments[campaign.target_segment]?.label ?? campaign.target_segment}</td>
                    <td className="px-5 py-3 font-bold">{campaign.total_recipients}</td>
                    <td className="px-5 py-3">{campaign.delivered_count}</td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-emerald-600">{campaign.replied_count}</span>
                      <span className="text-[10px] text-[#98A2B3]"> ({campaign.conversion_rate}%)</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-lg font-bold ${statusStyles[campaign.status] ?? 'bg-slate-100 text-slate-500'}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                        <button
                          onClick={() => launch(campaign)}
                          className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 rounded-lg bg-[#6C63FF] text-white font-bold hover:bg-[#5b52e0]"
                        >
                          <Rocket className="w-3.5 h-3.5" />
                          <span>إطلاق</span>
                        </button>
                        <button
                          onClick={() => remove(campaign)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
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
