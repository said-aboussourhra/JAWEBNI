import React, { useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { useForm, usePage } from '@inertiajs/react';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Sliders,
  FlaskConical,
  PlusCircle,
  TrendingUp,
  Search,
  CheckCircle2,
  Bot,
  Zap,
  Play,
  Check,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Layers,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface KnowledgeItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: string;
  source: string;
  usage_count: number;
  confidence_score: number;
  is_active: boolean;
}

interface Personality {
  id: string;
  communication_style: string;
  darija_ratio: number;
  arabic_ratio: number;
  french_ratio: number;
  response_length: string;
  trait_helpfulness: number;
  trait_persuasiveness: number;
  trait_friendliness: number;
  custom_instructions?: string;
}

interface TestRun {
  id: string;
  input_prompt: string;
  output_response: string;
  detected_intent: string;
  selected_agent: string;
  knowledge_source: string;
  confidence_score: number;
  suggested_action: string;
  created_at: string;
}

interface AIStudioProps {
  knowledgeItems: KnowledgeItem[];
  personality: Personality;
  testRuns: TestRun[];
  healthScore: number;
}

export default function AIStudio({
  knowledgeItems = [],
  personality,
  testRuns = [],
  healthScore = 87,
}: AIStudioProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'knowledge' | 'personality' | 'test-lab'>('overview');
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Teach By Question Form
  const { data: qnaData, setData: setQnaData, post: postQna, reset: resetQna, processing: qnaProcessing } = useForm({
    question: '',
    answer: '',
    category: 'delivery',
    language: 'darija',
  });

  // Personality Lab Form
  const { data: pData, setData: setPData, post: postP, processing: pProcessing } = useForm({
    communication_style: personality?.communication_style || 'friendly_moroccan',
    darija_ratio: personality?.darija_ratio || 70,
    arabic_ratio: personality?.arabic_ratio || 20,
    french_ratio: personality?.french_ratio || 10,
    response_length: personality?.response_length || 'balanced',
    trait_helpfulness: personality?.trait_helpfulness || 90,
    trait_persuasiveness: personality?.trait_persuasiveness || 80,
    trait_friendliness: personality?.trait_friendliness || 95,
    custom_instructions: personality?.custom_instructions || '',
  });

  // Test Lab Simulation Form
  const [simulationPrompt, setSimulationPrompt] = useState('سلام، واش كاين livraison لطنجة وشحال الثمن؟');
  const [testResult, setTestResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  const handleSaveQnA = (e: React.FormEvent) => {
    e.preventDefault();
    postQna('/ai-studio/knowledge', {
      preserveScroll: true,
      onSuccess: () => {
        resetQna();
        setShowAddModal(false);
      },
    });
  };

  const handleSavePersonality = (e: React.FormEvent) => {
    e.preventDefault();
    postP('/ai-studio/personality', {
      preserveScroll: true,
    });
  };

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulationPrompt.trim()) return;

    setSimulating(true);
    // Instant simulation response
    setTimeout(() => {
      const isDelivery = /livraison|توصيل|طنجة|كازا/i.test(simulationPrompt);
      const isPrice = /ثمن|prix|شحال/i.test(simulationPrompt);
      const isComplaint = /شكوى|مشكل|استرجاع/i.test(simulationPrompt);

      if (isComplaint) {
        setTestResult({
          detected_intent: 'شكوى / طلب استرجاع مالي',
          selected_agent: 'Complaint Agent',
          knowledge_source: 'سياسة حماية الزبون والضمان',
          confidence_score: 45,
          suggested_action: 'تحويل فوري للموظف البشري (Human Takeover)',
          output_response: 'نعتذر منك بزاف على هاد الإشكال أخي! تم تحويل المحادثة للمسؤول دابا باش يتواصل معاك ويحل المشكل.',
        });
      } else if (isDelivery) {
        setTestResult({
          detected_intent: 'استفسار عن التوصيل والمدن',
          selected_agent: 'Sales Agent',
          knowledge_source: 'سياسة التوصيل الوطنية بالمغرب',
          confidence_score: 97,
          suggested_action: 'تأكيد مدن الشحن وإمكانية الدفع عند الاستلام',
          output_response: 'مرحباً بك أ لالة! نعم كنوصلو لطنجة في ظرف 24 إلى 48 ساعة وثمن التوصيل هو 35 درهم، والدفع عند الاستلام!',
        });
      } else {
        setTestResult({
          detected_intent: 'استفسار عن الكتالوج والأسعار',
          selected_agent: 'Sales Agent',
          knowledge_source: 'كتالوج القفطان والجلابة',
          confidence_score: 94,
          suggested_action: 'عرض الأسعار واقتراح المقاس',
          output_response: 'أهلاً وسهلاً! أثمنة القفطان الملكي كتبدا من 1,850 درهم بجودة رفيعة، واش تبغي نقترحو عليك المقاس المناسب؟',
        });
      }
      setSimulating(false);
    }, 400);
  };

  const filteredKnowledge = knowledgeItems.filter((k) =>
    k.question.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
    k.answer.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
    k.category.toLowerCase().includes(knowledgeSearch.toLowerCase())
  );

  return (
    <AppShell activeHub="ai-studio" activeSection={activeTab} title="استوديو الذكاء الاصطناعي — AI Studio">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Studio Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-xs">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-3 bg-[#0F9D8C] text-white rounded-2xl shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#172033]">استوديو الذكاء الاصطناعي (AI Studio)</h1>
              <p className="text-xs text-[#667085] mt-0.5">
                درّب موظفك الذكي، اضبط شخصيته ونبرته، واختبر استجاباته بالدارجة المغربية
              </p>
            </div>
          </div>

          {/* AI Knowledge Health Meter */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse bg-[#F6F8FB] px-4 py-2.5 rounded-2xl border border-[#E7ECF2]">
            <div className="text-right rtl:text-left">
              <span className="text-[11px] font-bold text-[#667085] block">صحة المعرفة الذكية</span>
              <span className="text-sm font-extrabold text-[#0F9D8C]">{healthScore} / 100 ممتازة</span>
            </div>
            <div className="w-16 bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#0F9D8C] h-full rounded-full transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sub-Canvases Tabs Navigation */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse border-b border-[#E7ECF2] pb-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 rtl:space-x-reverse ${
              activeTab === 'overview'
                ? 'bg-[#0F9D8C] text-white shadow-xs'
                : 'text-[#667085] hover:bg-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>نظرة عامة والأساليب (Overview)</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 rtl:space-x-reverse ${
              activeTab === 'knowledge'
                ? 'bg-[#0F9D8C] text-white shadow-xs'
                : 'text-[#667085] hover:bg-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>قاعدة المعرفة بالدارجة ({knowledgeItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('personality')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 rtl:space-x-reverse ${
              activeTab === 'personality'
                ? 'bg-[#0F9D8C] text-white shadow-xs'
                : 'text-[#667085] hover:bg-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>مختبر الشخصية واللغات (Personality Lab)</span>
          </button>

          <button
            onClick={() => setActiveTab('test-lab')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 rtl:space-x-reverse ${
              activeTab === 'test-lab'
                ? 'bg-[#6C63FF] text-white shadow-xs'
                : 'text-[#667085] hover:bg-white'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>مختبر الاختبار الفوري (Interactive Test Lab)</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Method 1: Teach by Q&A */}
              <div
                onClick={() => setActiveTab('knowledge')}
                className="p-6 bg-white rounded-3xl border border-[#E7ECF2] shadow-xs hover:border-[#0F9D8C] transition-all cursor-pointer group"
              >
                <div className="p-3 bg-[#DDF7F2] text-[#0F9D8C] w-fit rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-[#172033]">الطريقة 1: التعليم بالأسئلة والأجوبة</h3>
                <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">
                  أضف أسئلة الزبائن الشائعة بالدارجة المغربية واضبط الجواب المثالي المفضل لنشاطك.
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-[#0F9D8C] space-x-1 rtl:space-x-reverse">
                  <span>فتح إدارة الأسئلة</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </div>
              </div>

              {/* Method 2: Personality Lab */}
              <div
                onClick={() => setActiveTab('personality')}
                className="p-6 bg-white rounded-3xl border border-[#E7ECF2] shadow-xs hover:border-[#6C63FF] transition-all cursor-pointer group"
              >
                <div className="p-3 bg-[#6C63FF]/15 text-[#6C63FF] w-fit rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-[#172033]">الطريقة 2: ضبط الشخصية والمزيج اللغوي</h3>
                <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">
                  حدد نبرة الصوت (مغربي ودود، رسمي، فخم) ونسب اللغات (الدارجة 70%، العربية 20%، الفرنسية 10%).
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-[#6C63FF] space-x-1 rtl:space-x-reverse">
                  <span>فتح مختبر الشخصية</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </div>
              </div>

              {/* Method 3: Test Lab */}
              <div
                onClick={() => setActiveTab('test-lab')}
                className="p-6 bg-white rounded-3xl border border-[#E7ECF2] shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
              >
                <div className="p-3 bg-emerald-100 text-emerald-600 w-fit rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-[#172033]">الطريقة 3: اختبار المحاكاة المباشر</h3>
                <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">
                  حاكِ محادثات WhatsApp حقيقية وافحص سرعة الرد ومعدل الثقة والنية المكتشفة قبل الإطلاق.
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 space-x-1 rtl:space-x-reverse">
                  <span>بدء الاختبار الفوري</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KNOWLEDGE BASE (METHOD 1) */}
        {activeTab === 'knowledge' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <input
                  type="text"
                  placeholder="ابحث في بنك الأسئلة..."
                  value={knowledgeSearch}
                  onChange={(e) => setKnowledgeSearch(e.target.value)}
                  className="w-full text-xs py-2 px-3 pl-9 rtl:pl-3 rtl:pr-9 bg-white border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-2.5" />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>إضافة سؤال وجواب جديد</span>
              </button>
            </div>

            {/* Knowledge Table */}
            <div className="bg-white rounded-3xl border border-[#E7ECF2] overflow-hidden shadow-xs">
              <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
                <thead className="bg-[#F6F8FB] border-b border-[#E7ECF2] text-[#667085] font-bold">
                  <tr>
                    <th className="p-4">السؤال المتكرر (الدارجة / العربية)</th>
                    <th className="p-4">التصنيف</th>
                    <th className="p-4">اللغة</th>
                    <th className="p-4">معدل الثقة</th>
                    <th className="p-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7ECF2]">
                  {filteredKnowledge.length > 0 ? (
                    filteredKnowledge.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-[#172033] block">"{k.question}"</span>
                          <p className="text-[#667085] mt-1 text-[11px] line-clamp-1">{k.answer}</p>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                            {k.category}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-[#0F9D8C] font-bold">
                          {k.language}
                        </td>
                        <td className="p-4 text-emerald-600 font-bold">{k.confidence_score}%</td>
                        <td className="p-4">
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                            ● مفعّل
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        لا توجد عناصر تطابق بحثك. اضغط على "إضافة سؤال وجواب" لتدريب AI الآن.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Add Modal */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#E7ECF2] shadow-2xl space-y-4">
                  <h3 className="text-base font-extrabold text-[#172033]">تعليم سؤال وجواب جديد لـ AI</h3>
                  <form onSubmit={handleSaveQnA} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-[#172033] block mb-1">السؤال المتكرر للزبون (بالدارجة)</label>
                      <input
                        type="text"
                        placeholder="مثال: واش كاين التوصيل لأكادير؟"
                        value={qnaData.question}
                        onChange={(e) => setQnaData('question', e.target.value)}
                        className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172033] block mb-1">الجواب الذكي المعتمد</label>
                      <textarea
                        rows={3}
                        placeholder="مثال: نعم كنوصلو لأكادير وثمن التوصيل هو 35 درهم مع الدفع عند الاستلام..."
                        value={qnaData.answer}
                        onChange={(e) => setQnaData('answer', e.target.value)}
                        className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-[#172033] block mb-1">التصنيف</label>
                        <select
                          value={qnaData.category}
                          onChange={(e) => setQnaData('category', e.target.value)}
                          className="w-full text-xs p-2.5 border border-[#E7ECF2] rounded-xl outline-none bg-white"
                        >
                          <option value="delivery">التوصيل والشحن (Delivery)</option>
                          <option value="pricing">الأسعار والعروض (Pricing)</option>
                          <option value="products">المنتجات والمقاسات (Products)</option>
                          <option value="returns">الاستبدال والضمان (Returns)</option>
                          <option value="hours">ساعات العمل والمقر (Hours)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#172033] block mb-1">اللغة الأساسية</label>
                        <select
                          value={qnaData.language}
                          onChange={(e) => setQnaData('language', e.target.value)}
                          className="w-full text-xs p-2.5 border border-[#E7ECF2] rounded-xl outline-none bg-white"
                        >
                          <option value="darija">الدارجة المغربية (Darija)</option>
                          <option value="ar">العربية الفصحى (Arabic)</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-4 border-t border-[#E7ECF2]">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 text-xs font-semibold text-[#667085] hover:text-[#172033]"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={qnaProcessing}
                        className="px-6 py-2 bg-[#0F9D8C] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#0c7d6f]"
                      >
                        حفظ في قاعدة المعرفة
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PERSONALITY LAB */}
        {activeTab === 'personality' && (
          <form onSubmit={handleSavePersonality} className="space-y-6 bg-white p-6 md:p-8 rounded-3xl border border-[#E7ECF2] shadow-xs">
            <div>
              <h2 className="text-base font-extrabold text-[#172033]">مختبر نبرة الصوت وشخصية الرد</h2>
              <p className="text-xs text-[#667085] mt-1">اختر الطابع العام الذي يتحدث به موظفك الذكي مع زبنائك على WhatsApp.</p>
            </div>

            {/* Communication Style Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'friendly_moroccan', title: 'مغربي ودود ومرحّب 🌸', desc: 'ترحيب دافئ وأسلوب تجاري قريب من الزبون' },
                { id: 'professional_arabic', title: 'رسمي واحترافي 💼', desc: 'أسلوب شركات ومؤسسات راقية ورصينة' },
                { id: 'luxury_french', title: 'Luxury & Élégant ✨', desc: 'مزيج فرنسي مغربي راقٍ لعلامات الفخامة' },
              ].map((style) => (
                <div
                  key={style.id}
                  onClick={() => setPData('communication_style', style.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    pData.communication_style === style.id
                      ? 'border-[#0F9D8C] bg-[#DDF7F2]/30 shadow-xs'
                      : 'border-[#E7ECF2] hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-extrabold text-[#172033] block">{style.title}</span>
                  <span className="text-[11px] text-[#667085] mt-1 block leading-relaxed">{style.desc}</span>
                </div>
              ))}
            </div>

            {/* Language Mix Sliders */}
            <div className="p-5 bg-[#F6F8FB] rounded-2xl border border-[#E7ECF2] space-y-4">
              <h4 className="text-xs font-bold text-[#172033]">المزيج اللغوي الذكي (Language Mixer):</h4>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-[#0F9D8C] block mb-1">الدارجة المغربية: {pData.darija_ratio}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={pData.darija_ratio}
                    onChange={(e) => setPData('darija_ratio', parseInt(e.target.value))}
                    className="w-full accent-[#0F9D8C]"
                  />
                </div>
                <div>
                  <label className="font-bold text-blue-600 block mb-1">العربية الفصحى: {pData.arabic_ratio}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={pData.arabic_ratio}
                    onChange={(e) => setPData('arabic_ratio', parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-600 block mb-1">Français: {pData.french_ratio}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={pData.french_ratio}
                    onChange={(e) => setPData('french_ratio', parseInt(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={pProcessing}
              className="px-6 py-2.5 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 rtl:space-x-reverse cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>حفظ إعدادات الشخصية</span>
            </button>
          </form>
        )}

        {/* TAB 4: INTERACTIVE TEST LAB (SPLIT SCREEN) */}
        {activeTab === 'test-lab' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Screen: Simulated WhatsApp Chat Input (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2.5 rtl:space-x-reverse mb-4 pb-3 border-b border-[#E7ECF2]">
                  <Bot className="w-5 h-5 text-[#0F9D8C]" />
                  <h3 className="text-sm font-extrabold text-[#172033]">محاكاة رسالة زبون واتساب</h3>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#172033] block">اكتب رسالة تجريبية بالدارجة أو الفرنسية:</label>
                  <textarea
                    rows={4}
                    value={simulationPrompt}
                    onChange={(e) => setSimulationPrompt(e.target.value)}
                    className="w-full text-xs p-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-2xl outline-none focus:border-[#6C63FF] text-[#172033]"
                  />

                  {/* Preset Scenarios */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-bold text-[#667085] block">سيناريوهات سريعة للتجربة:</span>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSimulationPrompt('سلام، واش كاين livraison لطنجة وشحال الثمن؟')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[#172033]"
                      >
                        سؤال التوصيل لطنجة
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulationPrompt('شحال الثمن ديال القفطان الملكي الأخضر؟')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[#172033]"
                      >
                        استفسار سعر القفطان
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulationPrompt('طلبي ما وصلش وبغيت استرجاع فلوسي دابا!')}
                        className="px-2.5 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-red-800 font-bold"
                      >
                        شكوى وتحويل بشري 🔥
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={simulating}
                className="w-full mt-6 py-3 bg-[#6C63FF] hover:bg-[#5850e0] text-white text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{simulating ? 'جاري التحليل والتوليد...' : 'تشغيل الاختبار والفحص الفوري'}</span>
              </button>
            </div>

            {/* Right Screen: Execution Summary & Confidence (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E7ECF2]">
                  <h3 className="text-sm font-extrabold text-[#172033]">تقرير التنفيذ الفوري (AI Execution Summary)</h3>
                  {testResult && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      {testResult.confidence_score}% دقة وثقة
                    </span>
                  )}
                </div>

                {testResult ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-[#F6F8FB] rounded-xl border border-[#E7ECF2] flex justify-between">
                      <span className="text-[#667085]">النية المكتشفة (Intent):</span>
                      <span className="font-bold text-[#172033]">{testResult.detected_intent}</span>
                    </div>

                    <div className="p-3 bg-[#F6F8FB] rounded-xl border border-[#E7ECF2] flex justify-between">
                      <span className="text-[#667085]">الوكيل المخصص (Selected Agent):</span>
                      <span className="font-bold text-[#0F9D8C]">{testResult.selected_agent}</span>
                    </div>

                    <div className="p-3 bg-[#F6F8FB] rounded-xl border border-[#E7ECF2] flex justify-between">
                      <span className="text-[#667085]">مصدر المعرفة (Knowledge Source):</span>
                      <span className="font-bold text-[#6C63FF]">{testResult.knowledge_source}</span>
                    </div>

                    {/* Simulated Output Bubble */}
                    <div className="p-4 bg-gradient-to-r from-[#0F9D8C] to-[#123B3A] text-white rounded-2xl shadow-sm mt-3">
                      <span className="text-[10px] text-[#DDF7F2] font-bold block mb-1">الرد المولد للزبون:</span>
                      <p className="leading-relaxed">{testResult.output_response}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs">اضغط على "تشغيل الاختبار" لرؤية فحص التنفيذ الفوري لـ AI</p>
                  </div>
                )}
              </div>

              {testResult && (
                <div className="mt-4 pt-3 border-t border-[#E7ECF2] flex items-center justify-between text-xs">
                  <span className="text-[#667085]">هل النتيجة مرضية؟</span>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <button className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-xl flex items-center space-x-1 rtl:space-x-reverse">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>إجابة ممتازة</span>
                    </button>
                    <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center space-x-1 rtl:space-x-reverse">
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>تحتاج تحسين</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
