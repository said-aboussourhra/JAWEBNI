import React, { useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { router, useForm } from '@inertiajs/react';
import {
  MessageSquare,
  Search,
  Bot,
  User,
  Send,
  Sparkles,
  AlertTriangle,
  Clock,
  Phone,
  MapPin,
  Tag,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  Calendar,
  Zap,
  ArrowUpRight,
  Filter,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface ConversationItem {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  lead_score: number;
  lifetime_value: string;
  status: string;
  intent: string;
  intent_confidence: number;
  sentiment: string;
  priority: string;
  last_message: string;
  last_message_time: string;
  ai_memory: any;
}

interface MessageItem {
  id: string;
  sender_type: 'customer' | 'ai' | 'human' | 'system';
  body: string;
  type: string;
  media_url?: string;
  ai_confidence?: number;
  detected_intent?: string;
  time: string;
}

interface InboxProps {
  conversations: ConversationItem[];
  activeConversation?: any;
  messages: MessageItem[];
}

export default function Inbox({
  conversations = [],
  activeConversation,
  messages = [],
}: InboxProps) {
  const { t, direction } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'ai' | 'human' | 'urgent'>('all');

  const { data, setData, post, reset, processing } = useForm({
    conversation_id: activeConversation?.id || '',
    body: '',
  });

  const selectedConversation = conversations.find(
    (c) => c.id === (activeConversation?.id || conversations[0]?.id)
  ) || conversations[0];

  const handleSelectConversation = (id: string) => {
    router.visit(`/inbox?conversation_id=${id}`, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.body.trim() || !selectedConversation) return;

    post('/inbox/send', {
      preserveScroll: true,
      onSuccess: () => reset('body'),
    });
  };

  const handleToggleAI = (mode: 'ai_handling' | 'human_takeover') => {
    if (!selectedConversation) return;
    router.post('/inbox/toggle-ai', {
      conversation_id: selectedConversation.id,
      mode,
    }, {
      preserveScroll: true,
    });
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer_phone.includes(searchQuery) ||
      c.last_message.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'ai') return c.status === 'ai_handling';
    if (filterTab === 'human') return c.status === 'waiting_human' || c.status === 'human_takeover';
    if (filterTab === 'urgent') return c.priority === 'urgent' || c.priority === 'high';
    return true;
  });

  return (
    <AppShell activeHub="inbox" activeSection="all" showContextPanel={false} title="صندوق المحادثات الذكي — Jawebni Inbox">
      <div className="flex h-full w-full bg-[#F6F8FB] overflow-hidden">
        {/* PANEL 1: CONVERSATION LIST (320px / 360px) */}
        <div className="w-80 md:w-96 bg-white border-r rtl:border-r-0 rtl:border-l border-[#E7ECF2] flex flex-col shrink-0 h-full select-none">
          {/* Header & Filter Tabs */}
          <div className="p-4 border-b border-[#E7ECF2] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#172033] flex items-center space-x-2 rtl:space-x-reverse">
                <MessageSquare className="w-5 h-5 text-[#0F9D8C]" />
                <span>المحادثات النشطة</span>
              </h2>
              <span className="text-xs bg-[#DDF7F2] text-[#0F9D8C] px-2.5 py-0.5 rounded-full font-bold">
                {conversations.length} محادثة
              </span>
            </div>

            {/* Smart Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث بالاسم، الرقم، أو الرسالة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs py-2 px-3 pl-9 rtl:pl-3 rtl:pr-9 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C] text-[#172033]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-2.5" />
            </div>

            {/* Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 text-[11px] font-bold bg-[#F6F8FB] p-1 rounded-xl">
              <button
                onClick={() => setFilterTab('all')}
                className={`py-1 rounded-lg transition-all ${
                  filterTab === 'all' ? 'bg-white text-[#0F9D8C] shadow-xs' : 'text-[#667085]'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterTab('ai')}
                className={`py-1 rounded-lg transition-all ${
                  filterTab === 'ai' ? 'bg-white text-[#0F9D8C] shadow-xs' : 'text-[#667085]'
                }`}
              >
                AI نشط
              </button>
              <button
                onClick={() => setFilterTab('human')}
                className={`py-1 rounded-lg transition-all ${
                  filterTab === 'human' ? 'bg-white text-amber-600 shadow-xs' : 'text-[#667085]'
                }`}
              >
                تدخل بشري
              </button>
              <button
                onClick={() => setFilterTab('urgent')}
                className={`py-1 rounded-lg transition-all ${
                  filterTab === 'urgent' ? 'bg-white text-red-500 shadow-xs' : 'text-[#667085]'
                }`}
              >
                عاجل 🔥
              </button>
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E7ECF2]/60">
            {filteredConversations.map((c) => {
              const isSelected = selectedConversation?.id === c.id;
              const isAIHandling = c.status === 'ai_handling';
              const isUrgent = c.priority === 'urgent' || c.priority === 'high';

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectConversation(c.id)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#DDF7F2]/40 border-r-4 rtl:border-r-0 rtl:border-l-4 border-[#0F9D8C]'
                      : 'hover:bg-[#F6F8FB]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#123B3A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {c.customer_name.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#172033] truncate">{c.customer_name}</h4>
                        <span className="text-[10px] text-[#667085] block">{c.customer_city} • {c.customer_phone}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{c.last_message_time}</span>
                  </div>

                  <p className="text-xs text-[#667085] line-clamp-2 mt-1.5 leading-relaxed">
                    {c.last_message}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                      {isAIHandling ? (
                        <span className="text-[10px] font-bold text-[#0F9D8C] bg-[#DDF7F2] px-2 py-0.5 rounded-md flex items-center space-x-1 rtl:space-x-reverse">
                          <Bot className="w-3 h-3" />
                          <span>AI يجيب تلقائياً</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center space-x-1 rtl:space-x-reverse">
                          <User className="w-3 h-3" />
                          <span>تدخل الموظف البشري</span>
                        </span>
                      )}
                    </div>

                    {isUrgent && (
                      <span className="text-[9px] font-extrabold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                        عاجل
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL 2: CONVERSATION TIMELINE & ACTIONS (Flex-1) */}
        <div className="flex-1 flex flex-col h-full bg-[#F6F8FB] border-r rtl:border-r-0 rtl:border-l border-[#E7ECF2]">
          {selectedConversation ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="p-4 bg-white border-b border-[#E7ECF2] flex items-center justify-between shadow-xs z-10">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-11 h-11 rounded-2xl bg-[#0F9D8C] text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                    {selectedConversation.customer_name.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#172033] flex items-center space-x-2 rtl:space-x-reverse">
                      <span>{selectedConversation.customer_name}</span>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        {selectedConversation.intent}
                      </span>
                    </h3>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-[11px] text-[#667085] mt-0.5">
                      <span className="font-mono">{selectedConversation.customer_phone}</span>
                      <span>•</span>
                      <span>{selectedConversation.customer_city}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">● نافذة 24 ساعة نشطة</span>
                    </div>
                  </div>
                </div>

                {/* AI / Human Control Toggle Button */}
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {selectedConversation.status === 'ai_handling' ? (
                    <button
                      onClick={() => handleToggleAI('human_takeover')}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>استلام المحادثة (إيقاف AI)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleAI('ai_handling')}
                      className="px-3.5 py-2 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer"
                    >
                      <Bot className="w-4 h-4" />
                      <span>إعادة التحكم لـ AI</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Human Handoff Alert Banner if Needed */}
              {selectedConversation.status === 'waiting_human' && (
                <div className="p-3 bg-red-50 border-b border-red-200 text-red-800 text-xs flex items-center justify-between px-6">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <span className="font-bold">تنبيه تدخل بشري: العميل قدّم شكوى أو عبّر عن عدم رضاه.</span>
                      <span className="block text-[11px] text-red-700">معدل ثقة AI منخفض (45%) — يُنصح بالرد اليدوي المباشر لحل الإشكال فوراً.</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleAI('human_takeover')}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold shadow-xs hover:bg-red-700"
                  >
                    تأكيد الاستلام اليدوي
                  </button>
                </div>
              )}

              {/* Messages Scroll Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((m) => {
                  const isCustomer = m.sender_type === 'customer';
                  const isAI = m.sender_type === 'ai';
                  const isHuman = m.sender_type === 'human';

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        isCustomer ? 'items-start' : 'items-end'
                      }`}
                    >
                      {/* Sender Role Pill */}
                      <div className="flex items-center space-x-1.5 rtl:space-x-reverse mb-1 text-[10px] text-slate-400">
                        {isAI && (
                          <span className="text-[#0F9D8C] font-bold flex items-center">
                            <Bot className="w-3 h-3 mr-1 ml-1" />
                            جاوبني AI ({m.ai_confidence}% ثقة)
                          </span>
                        )}
                        {isHuman && (
                          <span className="text-blue-600 font-bold flex items-center">
                            <User className="w-3 h-3 mr-1 ml-1" />
                            الموظف البشري
                          </span>
                        )}
                        {isCustomer && (
                          <span className="font-semibold text-slate-500">الزبون</span>
                        )}
                        <span>• {m.time}</span>
                      </div>

                      {/* Bubble Message */}
                      <div
                        className={`p-4 rounded-2xl max-w-lg text-xs md:text-sm leading-relaxed shadow-xs ${
                          isCustomer
                            ? 'bg-white text-[#172033] border border-[#E7ECF2] rounded-tl-none rtl:rounded-tr-none rtl:rounded-tl-2xl'
                            : isAI
                            ? 'bg-gradient-to-r from-[#0F9D8C] to-[#123B3A] text-white rounded-tr-none rtl:rounded-tl-none rtl:rounded-tr-2xl shadow-sm'
                            : 'bg-blue-600 text-white rounded-tr-none rtl:rounded-tl-none rtl:rounded-tr-2xl'
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Reply Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white border-t border-[#E7ECF2] flex items-center space-x-3 rtl:space-x-reverse"
              >
                <input
                  type="text"
                  value={data.body}
                  onChange={(e) => setData('body', e.target.value)}
                  placeholder="اكتب ردك للزبون على WhatsApp أو أرسل عرضاً خاصاً..."
                  className="flex-1 text-xs md:text-sm px-4 py-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-2xl outline-none focus:border-[#0F9D8C] text-[#172033]"
                />
                <button
                  type="submit"
                  disabled={processing}
                  className="p-3 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white rounded-2xl shadow-md transition-all flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-5 h-5 rtl:rotate-180" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-2 text-slate-300" />
              <p className="text-sm font-semibold">اختر محادثة من القائمة لبدء المتابعة</p>
            </div>
          )}
        </div>

        {/* PANEL 3: CUSTOMER INTELLIGENCE & AI MEMORY (320px) */}
        {selectedConversation && (
          <div className="w-80 md:w-88 bg-white border-l rtl:border-l-0 rtl:border-r border-[#E7ECF2] flex flex-col shrink-0 h-full p-5 overflow-y-auto select-none space-y-6">
            {/* Customer Profile Card */}
            <div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse pb-4 border-b border-[#E7ECF2]">
                <div className="w-12 h-12 rounded-2xl bg-[#DDF7F2] text-[#0F9D8C] flex items-center justify-center font-extrabold text-base">
                  {selectedConversation.customer_name.substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#172033]">{selectedConversation.customer_name}</h4>
                  <p className="text-xs text-[#667085] flex items-center mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 ml-1" />
                    {selectedConversation.customer_city}
                  </p>
                </div>
              </div>

              {/* Customer Value Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="p-3 bg-[#F6F8FB] rounded-xl border border-[#E7ECF2]">
                  <span className="text-[10px] text-[#667085] block">مجموع المشتريات</span>
                  <span className="text-xs font-bold text-[#172033]">{selectedConversation.lifetime_value}</span>
                </div>
                <div className="p-3 bg-[#F6F8FB] rounded-xl border border-[#E7ECF2]">
                  <span className="text-[10px] text-[#667085] block">معدل الاهتمام (Lead)</span>
                  <span className="text-xs font-bold text-emerald-600">{selectedConversation.lead_score}% مرتفع 🔥</span>
                </div>
              </div>
            </div>

            {/* AI Memory & Stored Preferences */}
            <div className="p-4 bg-[#6C63FF]/5 rounded-2xl border border-[#6C63FF]/20 space-y-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-[#6C63FF]">
                <Sparkles className="w-4 h-4" />
                <h5 className="text-xs font-extrabold">ذاكرة AI الذكية (Customer Memory)</h5>
              </div>

              <div className="space-y-2 text-xs">
                {selectedConversation.ai_memory?.preferred_size && (
                  <div className="flex justify-between">
                    <span className="text-[#667085]">المقاس المفضل:</span>
                    <span className="font-bold text-[#172033]">{selectedConversation.ai_memory.preferred_size}</span>
                  </div>
                )}
                {selectedConversation.ai_memory?.favorite_color && (
                  <div className="flex justify-between">
                    <span className="text-[#667085]">اللون المطلوب:</span>
                    <span className="font-bold text-[#172033]">{selectedConversation.ai_memory.favorite_color}</span>
                  </div>
                )}
                {selectedConversation.ai_memory?.wedding_date && (
                  <div className="flex justify-between">
                    <span className="text-[#667085]">موعد المناسبة:</span>
                    <span className="font-bold text-emerald-700">{selectedConversation.ai_memory.wedding_date}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions for Business Growth */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-[#172033]">إجراءات سريعة فورية</h5>
              <button className="w-full py-2.5 px-3 bg-[#0F9D8C]/10 hover:bg-[#0F9D8C]/20 text-[#0F9D8C] text-xs font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer">
                <span>إرسال رابط دفع مباشر (Payment Link)</span>
                <DollarSign className="w-4 h-4" />
              </button>
              <button className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer">
                <span>حجز موعد قياس في المحل (Booking)</span>
                <Calendar className="w-4 h-4" />
              </button>
              <button className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-[#172033] text-xs font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer">
                <span>إضافة وسم للعميل (Add Tag)</span>
                <Tag className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
