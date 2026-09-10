import React, { useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { router, useForm } from '@inertiajs/react';
import {
  Users,
  Search,
  Sparkles,
  MapPin,
  Phone,
  Tag,
  ShoppingBag,
  Clock,
  ArrowRight,
  Filter,
  Flame,
  CheckCircle2,
  Calendar,
  MessageSquare,
  DollarSign,
  Edit3,
  Plus,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  city: string;
  lead_score: number;
  lifetime_value: string;
  total_orders: number;
  tags: string[];
  ai_memory: any;
  last_seen: string;
}

interface CustomersProps {
  customers: CustomerItem[];
  tags: any[];
}

export default function Customers({ customers = [], tags = [] }: CustomersProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(customers[0] || null);
  const [noteContent, setNoteContent] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedTag && !c.tags.includes(selectedTag)) return false;
    return true;
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !selectedCustomer) return;

    router.post(`/customers/${selectedCustomer.id}/notes`, {
      content: noteContent,
    }, {
      preserveScroll: true,
      onSuccess: () => setNoteContent(''),
    });
  };

  return (
    <AppShell activeHub="customers" title="عملاء وذاكرة AI — Customer Intelligence">
      <div className="flex h-full w-full bg-[#F6F8FB] overflow-hidden">
        {/* Left Side: CRM Table & Filters (Flex-1) */}
        <div className="flex-1 flex flex-col h-full bg-[#F6F8FB] overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-xs">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-3 bg-[#0F9D8C] text-white rounded-2xl shadow-md">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-[#172033]">ذكاء العملاء وذاكرة AI (Customer Intelligence)</h1>
                <p className="text-xs text-[#667085] mt-0.5">
                  سجل تفاعلات الزبائن، تفضيلات المقاسات والألوان، ومعدل احتمالية الشراء (Lead Score)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs">
              <span className="bg-[#DDF7F2] text-[#0F9D8C] px-3 py-1.5 rounded-xl font-bold">
                ● {customers.length} عميل مسجل
              </span>
            </div>
          </div>

          {/* Search & Tag Filter Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="ابحث بالاسم، رقم الهاتف، أو المدينة بالمغرب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs py-2.5 px-3 pl-9 rtl:pl-3 rtl:pr-9 bg-white border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
            </div>

            <div className="flex items-center space-x-1.5 rtl:space-x-reverse overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedTag === null ? 'bg-[#0F9D8C] text-white shadow-xs' : 'bg-white text-[#667085] border border-[#E7ECF2]'
                }`}
              >
                الكل
              </button>
              {['VIP', 'Caftan Lover', 'Casablanca', 'Rabat', 'Needs Attention'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    selectedTag === tag ? 'bg-[#0F9D8C] text-white shadow-xs' : 'bg-white text-[#667085] border border-[#E7ECF2]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs overflow-hidden">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
              <thead className="bg-[#F6F8FB] border-b border-[#E7ECF2] text-[#667085] font-bold">
                <tr>
                  <th className="p-4">الزبون</th>
                  <th className="p-4">المدينة بالمغرب</th>
                  <th className="p-4">معدل الاهتمام (Lead Score)</th>
                  <th className="p-4">قيمة المشتريات (LTV)</th>
                  <th className="p-4">الوسوم (Tags)</th>
                  <th className="p-4">آخر نشاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7ECF2]">
                {filteredCustomers.map((c) => {
                  const isSelected = selectedCustomer?.id === c.id;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#DDF7F2]/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                          <div className="w-9 h-9 rounded-full bg-[#123B3A] text-white flex items-center justify-center font-bold text-xs">
                            {c.name.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-[#172033] block">{c.name}</span>
                            <span className="text-[11px] text-[#667085]">{c.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-[#172033] font-semibold">{c.city}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="font-bold text-emerald-600">{c.lead_score}%</span>
                          {c.lead_score > 80 && <Flame className="w-3.5 h-3.5 text-[#FF7A59]" />}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-[#172033]">{c.lifetime_value}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {c.tags.map((t, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">{c.last_seen}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Customer Dossier & AI Memory Drawer (360px) */}
        {selectedCustomer && (
          <div className="w-96 bg-white border-l rtl:border-l-0 rtl:border-r border-[#E7ECF2] flex flex-col shrink-0 h-full p-6 overflow-y-auto select-none space-y-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse pb-4 border-b border-[#E7ECF2]">
              <div className="w-14 h-14 rounded-2xl bg-[#0F9D8C] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                {selectedCustomer.name.substring(0, 2)}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#172033]">{selectedCustomer.name}</h3>
                <p className="text-xs text-[#667085] flex items-center mt-0.5">
                  <MapPin className="w-3.5 h-3.5 mr-1 ml-1" />
                  {selectedCustomer.city} • {selectedCustomer.phone}
                </p>
              </div>
            </div>

            {/* Visual Customer Journey */}
            <div className="p-4 bg-[#F6F8FB] rounded-2xl border border-[#E7ECF2] space-y-3">
              <h4 className="text-xs font-extrabold text-[#172033]">مسار العميل (Visual Customer Journey)</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. أول تواصل عبر واتساب (تم التعرف)</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2. استفسار عن قفطان العروسة (إجابة AI)</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-[#0F9D8C] font-bold">
                  <Flame className="w-4 h-4 text-[#FF7A59]" />
                  <span>3. فرصة بيع مؤكدة (طلب رابط الدفع)</span>
                </div>
              </div>
            </div>

            {/* AI Stored Memory */}
            <div className="p-4 bg-[#6C63FF]/5 rounded-2xl border border-[#6C63FF]/20 space-y-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-[#6C63FF]">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-extrabold">ذاكرة AI المستمرة (Stored Memory)</h4>
              </div>
              <div className="space-y-2 text-xs">
                {selectedCustomer.ai_memory?.preferred_size && (
                  <div className="flex justify-between">
                    <span className="text-[#667085]">المقاس المفضل:</span>
                    <span className="font-bold text-[#172033]">{selectedCustomer.ai_memory.preferred_size}</span>
                  </div>
                )}
                {selectedCustomer.ai_memory?.favorite_color && (
                  <div className="flex justify-between">
                    <span className="text-[#667085]">اللون المفضل:</span>
                    <span className="font-bold text-[#172033]">{selectedCustomer.ai_memory.favorite_color}</span>
                  </div>
                )}
                {selectedCustomer.ai_memory?.notes && (
                  <div className="pt-1 text-[11px] text-[#667085] italic bg-white p-2.5 rounded-xl border border-slate-200">
                    "{selectedCustomer.ai_memory.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Collaborative Staff Notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#172033]">ملاحظات الفريق</h4>
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="أضف ملاحظة خاصة لهذا الزبون..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#172033] text-xs font-bold rounded-xl transition-all"
                >
                  حفظ الملاحظة في الملف
                </button>
              </form>
            </div>

            {/* Quick Action Button */}
            <a
              href={`/inbox?customer_phone=${selectedCustomer.phone}`}
              className="w-full py-3 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>فتح المحادثة على WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </AppShell>
  );
}
