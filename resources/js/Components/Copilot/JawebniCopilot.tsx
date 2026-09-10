import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Bot,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface JawebniCopilotProps {
  open: boolean;
  onClose: () => void;
}

export const JawebniCopilot: React.FC<JawebniCopilotProps> = ({ open, onClose }) => {
  const { t, direction } = useLanguage();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'copilot' | 'user'; text: string; time: string }>>([
    {
      role: 'copilot',
      text: 'مرحباً بك! أنا مساعد جاوبني الذكي (Copilot). لقد قمت بتحليل محادثات اليوم: تم رصد 27 عميلاً يسألون عن سياسة التوصيل إلى طنجة وأكادير. هل ترغب في إضافة هذه التفاصيل إلى ذاكرة AI الآن؟',
      time: 'الآن',
    },
  ]);

  if (!open) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userText, time: 'Just now' },
      {
        role: 'copilot',
        text: `فهمت طلبك بخصوص "${userText}". لقد قمت بإعداد مسودة تحديث لقاعدة المعرفة وسيتم تطبيقها بعد مراجعتك.`,
        time: 'Just now',
      },
    ]);
    setChatInput('');
  };

  return (
    <aside className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 w-84 sm:w-96 bg-white shadow-2xl border-l rtl:border-l-0 rtl:border-r border-[#E7ECF2] z-50 flex flex-col animate-in slide-in-from-right rtl:slide-in-from-left duration-200">
      {/* Copilot Header */}
      <div className="p-4 bg-[#123B3A] text-white flex items-center justify-between border-b border-[#0F9D8C]/30">
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          <div className="p-2 rounded-xl bg-[#6C63FF] text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
              <span>{t('copilot.title', 'Jawebni Copilot')}</span>
              <span className="text-[10px] bg-[#6C63FF] text-white px-2 py-0.5 rounded-full">AI Live</span>
            </h3>
            <p className="text-[11px] text-slate-300">مساعدك الإداري والتحليلي الفوري</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Proactive Insights Cards */}
      <div className="p-3 bg-[#F6F8FB] border-b border-[#E7ECF2] space-y-2">
        <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-xs flex items-start space-x-2.5 rtl:space-x-reverse">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[#172033] block">نقص في سياسة الاسترجاع</span>
            <p className="text-[#667085] mt-0.5">سأل 8 عملاء عن شروط استبدال المقاس ولم يجد AI إجابة كافية.</p>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-emerald-200/80 shadow-xs flex items-start space-x-2.5 rtl:space-x-reverse">
          <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[#172033] block">ارتفاع فرص البيع المؤكدة (+18%)</span>
            <p className="text-[#667085] mt-0.5">قفطان العروسة الملكي الأكثر طلباً اليوم عبر واتساب.</p>
          </div>
        </div>
      </div>

      {/* Interactive Chat Timeline */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              m.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-xs ${
                m.role === 'user'
                  ? 'bg-[#0F9D8C] text-white rounded-br-none rtl:rounded-bl-none rtl:rounded-br-2xl'
                  : 'bg-[#F6F8FB] text-[#172033] border border-[#E7ECF2] rounded-bl-none rtl:rounded-br-none rtl:rounded-bl-2xl'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
          </div>
        ))}
      </div>

      {/* Bottom Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#E7ECF2] flex items-center space-x-2 rtl:space-x-reverse">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="اسأل Copilot أو اطلب تحليل أداء..."
          className="flex-1 px-3 py-2 text-xs bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C] text-[#172033]"
        />
        <button
          type="submit"
          className="p-2 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white rounded-xl shadow-xs transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
};
