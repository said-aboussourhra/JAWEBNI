import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Sparkles,
  Building,
  Smartphone,
  BookOpen,
  Sliders,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Bot,
  Zap,
  Check,
  Upload,
  MessageSquare,
} from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/lib/i18n';

interface OnboardingProps {
  business: any;
}

const OnboardingFlow: React.FC<OnboardingProps> = ({ business }) => {
  const { t, direction } = useLanguage();
  const [currentStep, setCurrentStep] = useState(business?.onboarding_step || 1);
  const [readinessScore, setReadinessScore] = useState(business?.ai_readiness_score || 25);

  // Form State across steps
  const [formData, setFormData] = useState({
    business_type: 'retail_ecommerce',
    products: 'قفطان مغربي أصيل، جلابة عصرية، بلغة فاس الجلدية',
    delivery_cities: 'الدار البيضاء، الرباط، مراكش، طنجة، فاس، أكادير',
    delivery_price: '35 درهم (توصيل مجاني للطلبات فوق 500 درهم)',
    whatsapp_number: business?.phone_number || '+212 661-000000',
    communication_style: 'friendly_moroccan', // friendly_moroccan, professional_arabic, luxury_french
    darija_ratio: 70,
    arabic_ratio: 20,
    french_ratio: 10,
    sample_question: 'واش كاين التوصيل لأكادير وشحال كياخد ديال الوقت؟',
    sample_answer: 'نعم أ لالة كنوصلو لأكادير في ظرف 24 إلى 48 ساعة وثمن التوصيل هو 35 درهم والدفع عند الاستلام!',
  });

  const steps = [
    { num: 1, title: 'هوية النشاط التجاري', desc: 'Business Identity', icon: Building },
    { num: 2, title: 'ربط واتساب السحابي', desc: 'Connect WhatsApp', icon: Smartphone },
    { num: 3, title: 'تعليم الذكاء الاصطناعي', desc: 'Teach Your AI', icon: BookOpen },
    { num: 4, title: 'تحديد الشخصية والأسلوب', desc: 'Define Personality', icon: Sliders },
    { num: 5, title: 'اختبار وإطلاق الموظف', desc: 'Test & Go Live', icon: FlaskConical },
  ];

  const handleNext = () => {
    const nextStep = currentStep + 1;
    const newScore = Math.min(100, 20 + nextStep * 16);
    setReadinessScore(newScore);
    setCurrentStep(nextStep);

    router.post('/onboarding/step', {
      step: nextStep,
      data: formData,
      ai_readiness_score: newScore,
      completed: nextStep > 5,
    }, {
      preserveScroll: true,
    });
  };

  const handleCompleteAndGoLive = () => {
    router.post('/onboarding/step', {
      step: 5,
      data: formData,
      ai_readiness_score: 100,
      completed: true,
    }, {
      onSuccess: () => router.visit('/pulse'),
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#172033] flex flex-col justify-between p-4 md:p-8">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#E7ECF2]">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-3 bg-[#0F9D8C] text-white rounded-2xl shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#172033]">إطلاق الموظف الذكي — جاوبني</h1>
            <p className="text-xs text-[#667085]">Launch Your AI WhatsApp Business Employee</p>
          </div>
        </div>

        {/* Dynamic AI Readiness Score Gauge */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse bg-white px-4 py-2.5 rounded-2xl border border-[#E7ECF2] shadow-xs">
          <div className="text-right rtl:text-left">
            <span className="text-[11px] font-bold text-[#667085] block">AI Readiness</span>
            <span className="text-sm font-extrabold text-[#0F9D8C]">{readinessScore}% جاهزية</span>
          </div>
          <div className="w-16 bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#0F9D8C] h-full rounded-full transition-all duration-500"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>
      </header>

      {/* Stepper Navigation */}
      <div className="max-w-4xl mx-auto w-full py-6">
        <div className="grid grid-cols-5 gap-2">
          {steps.map((s) => {
            const isDone = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            const Icon = s.icon;

            return (
              <div
                key={s.num}
                className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center ${
                  isCurrent
                    ? 'bg-white border-[#0F9D8C] shadow-md ring-2 ring-[#0F9D8C]/20'
                    : isDone
                    ? 'bg-[#DDF7F2]/50 border-[#0F9D8C]/30 text-[#0F9D8C]'
                    : 'bg-white/50 border-[#E7ECF2] text-slate-400 opacity-60'
                }`}
              >
                <div className="mb-1.5">
                  {isDone ? (
                    <Check className="w-4 h-4 text-[#0F9D8C]" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#0F9D8C]' : ''}`} />
                  )}
                </div>
                <span className="text-[11px] font-bold truncate block w-full">{s.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Step Canvas */}
      <main className="max-w-3xl mx-auto w-full bg-white rounded-3xl p-6 md:p-8 border border-[#E7ECF2] shadow-xl my-4">
        {/* Step 1: Business Identity */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-[#E7ECF2] pb-4">
              <h2 className="text-base font-bold text-[#172033]">1. ما هي طبيعة نشاطك التجاري ومنتجاتك؟</h2>
              <p className="text-xs text-[#667085] mt-1">
                سيتعلم الموظف الذكي تفاصيل المنتجات ليجيب على الزبائن بدقة فورية.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1.5">قائمة المنتجات أو الخدمات الرئيسية</label>
              <textarea
                rows={3}
                value={formData.products}
                onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#172033] block mb-1.5">مدن التوصيل في المغرب</label>
                <input
                  type="text"
                  value={formData.delivery_cities}
                  onChange={(e) => setFormData({ ...formData, delivery_cities: e.target.value })}
                  className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#172033] block mb-1.5">سعر وسياسة التوصيل</label>
                <input
                  type="text"
                  value={formData.delivery_price}
                  onChange={(e) => setFormData({ ...formData, delivery_price: e.target.value })}
                  className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Connect WhatsApp */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-[#E7ECF2] pb-4">
              <h2 className="text-base font-bold text-[#172033]">2. ربط رقم الواتساب الرسمي (Meta Cloud API)</h2>
              <p className="text-xs text-[#667085] mt-1">
                ربط آمن ومعتمد رسميًا من WhatsApp دون الحاجة لإبقاء الهاتف متصلاً بالإنترنت.
              </p>
            </div>

            <div className="p-4 bg-[#DDF7F2]/40 rounded-2xl border border-[#0F9D8C]/30 flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Smartphone className="w-8 h-8 text-[#0F9D8C]" />
                <div>
                  <h4 className="text-xs font-bold text-[#123B3A]">رقم الهاتف للأعمال</h4>
                  <p className="text-[11px] text-[#667085]">{formData.whatsapp_number}</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                ✓ متصل وجاهز للرد
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Teach AI */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-[#E7ECF2] pb-4">
              <h2 className="text-base font-bold text-[#172033]">3. تعليم الذكاء الاصطناعي (Q&A + Documents)</h2>
              <p className="text-xs text-[#667085] mt-1">
                علّم الموظف الذكي بالدارجة المغربية كيف يجيب على الأسئلة الشائعة لزبنائك.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1.5">سؤال الزبون المتكرر (بالدارجة)</label>
              <input
                type="text"
                value={formData.sample_question}
                onChange={(e) => setFormData({ ...formData, sample_question: e.target.value })}
                className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1.5">الجواب الذكي المتوقع من الموظف</label>
              <textarea
                rows={3}
                value={formData.sample_answer}
                onChange={(e) => setFormData({ ...formData, sample_answer: e.target.value })}
                className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 4: Define Personality */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-[#E7ECF2] pb-4">
              <h2 className="text-base font-bold text-[#172033]">4. أسلوب وشخصية الرد والمزيج اللغوي</h2>
              <p className="text-xs text-[#667085] mt-1">
                اختر نبرة الصوت وتوزيع اللغات بين الدارجة المغربية، العربية الفصحى، والفرنسية.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'friendly_moroccan', title: 'مغربي ودود ومرحّب', desc: 'ترحيب دافئ وأسلوب تجاري قريب من الزبون' },
                { id: 'professional_arabic', title: 'رسمي واحترافي', desc: 'أسلوب شركات ومؤسسات راقية' },
                { id: 'luxury_french', title: 'Luxury & Élégant', desc: 'مزيج فرنسي مغربي فاخر' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, communication_style: style.id })}
                  className={`p-3.5 rounded-2xl border text-right rtl:text-right ltr:text-left transition-all ${
                    formData.communication_style === style.id
                      ? 'border-[#0F9D8C] bg-[#DDF7F2]/30 shadow-xs'
                      : 'border-[#E7ECF2] hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-[#172033] block">{style.title}</span>
                  <span className="text-[10px] text-[#667085] mt-1 block">{style.desc}</span>
                </button>
              ))}
            </div>

            {/* Language Mixer */}
            <div className="p-4 bg-[#F6F8FB] rounded-2xl border border-[#E7ECF2] space-y-2 mt-4">
              <span className="text-xs font-bold text-[#172033] block">المزيج اللغوي للرد التلقائي:</span>
              <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs">
                <span className="text-[#0F9D8C] font-bold">الدارجة: 70%</span>
                <span className="text-blue-600 font-bold">العربية: 20%</span>
                <span className="text-purple-600 font-bold">Français: 10%</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Test & Go Live */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-[#E7ECF2] pb-4 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-base font-extrabold text-[#172033]">موظفك الذكي جاهز للانطلاق 24/7!</h2>
              <p className="text-xs text-[#667085] mt-1">
                لقد تم تدريب الموظف، ربط الواتساب، وضبط قواعد التوصيل والمبيعات بنجاح.
              </p>
            </div>

            <div className="p-4 bg-[#F6F8FB] rounded-2xl border border-[#E7ECF2] space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-[#667085]">حالة الموظف الذكي:</span>
                <span className="font-bold text-emerald-600">● جاهز للرد الفوري</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-[#667085]">رقم الواتساب المتصل:</span>
                <span className="font-bold text-[#172033]">{formData.whatsapp_number}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#667085]">معدل الجاهزية الكلي:</span>
                <span className="font-extrabold text-[#0F9D8C]">100% جاهز</span>
              </div>
            </div>
          </div>
        )}

        {/* Step Actions */}
        <div className="mt-8 pt-4 border-t border-[#E7ECF2] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 text-xs font-semibold text-[#667085] hover:text-[#172033] transition-colors"
            >
              العودة للخطوة السابقة
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 rtl:space-x-reverse"
            >
              <span>متابعة الخطوة التالية</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteAndGoLive}
              className="px-8 py-3 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-[#0F9D8C]/30 transition-all flex items-center space-x-2 rtl:space-x-reverse animate-bounce"
            >
              <Zap className="w-4 h-4" />
              <span>إطلاق الموظف الذكي والدخول للوحة التحكم 🚀</span>
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#667085] py-2">
        جاوبني — Jawebni AI WhatsApp Business Operating System © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default function OnboardingPage(props: OnboardingProps) {
  return (
    <LanguageProvider>
      <Head title="إطلاق الموظف الذكي — جاوبني" />
      <OnboardingFlow {...props} />
    </LanguageProvider>
  );
}
