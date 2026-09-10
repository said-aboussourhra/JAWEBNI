import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Bot, Lock, Mail, Building, Phone, User, ArrowRight } from 'lucide-react';
import { LanguageProvider } from '@/lib/i18n';

function RegisterForm() {
  const { data, setData, post, processing, errors } = useForm({
    business_name: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    city: 'Casablanca',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/register');
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-[#E7ECF2] shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#0F9D8C] text-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
            <Bot className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-[#172033]">إنشاء حساب نشاط تجاري جديد</h1>
          <p className="text-xs text-[#667085] mt-0.5">ابدأ مع موظفك الذكي على واتساب خلال 3 دقائق</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[#172033] block mb-1">اسم النشاط التجاري / العلامة</label>
            <input
              type="text"
              placeholder="مثال: قفطان لالة سلطانة"
              value={data.business_name}
              onChange={(e) => setData('business_name', e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              required
            />
            {errors.business_name && <span className="text-[11px] text-red-500 mt-1 block">{errors.business_name}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">اسم المسؤول</label>
              <input
                type="text"
                placeholder="سعيد المنصوري"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">المدينة بالمغرب</label>
              <input
                type="text"
                placeholder="Casablanca"
                value={data.city}
                onChange={(e) => setData('city', e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                placeholder="contact@business.ma"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
              {errors.email && <span className="text-[11px] text-red-500 mt-1 block">{errors.email}</span>}
            </div>
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">رقم واتساب للتواصل</label>
              <input
                type="text"
                placeholder="+212 661 000000"
                value={data.phone}
                onChange={(e) => setData('phone', e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">كلمة المرور</label>
              <input
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172033] block mb-1">تأكيد كلمة المرور</label>
              <input
                type="password"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full mt-4 py-3 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer"
          >
            <span>إنشاء الحساب وبدء إعداد الموظف الذكي</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-[#E7ECF2] text-center text-xs text-[#667085]">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="text-[#0F9D8C] font-bold hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <LanguageProvider>
      <Head title="إنشاء حساب — جاوبني" />
      <RegisterForm />
    </LanguageProvider>
  );
}
