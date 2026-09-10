import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Bot, Lock, Mail, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/lib/i18n';

function LoginForm() {
  const { t } = useLanguage();
  const { data, setData, post, processing, errors } = useForm({
    email: 'said@jawebni.ma',
    password: 'password123',
    remember: true,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#E7ECF2] shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#0F9D8C] text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#0F9D8C]/30">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033]">جاوبني — Jawebni</h1>
          <p className="text-xs text-[#667085] mt-1">موظفك الذكي على واتساب 24/7 للأنشطة المغربية</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#172033] block mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="w-full text-xs px-3 py-3 border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3.5" />
            </div>
            {errors.email && <span className="text-[11px] text-red-500 mt-1 block">{errors.email}</span>}
          </div>

          <div>
            <label className="text-xs font-bold text-[#172033] block mb-1">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className="w-full text-xs px-3 py-3 border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3.5" />
            </div>
            {errors.password && <span className="text-[11px] text-red-500 mt-1 block">{errors.password}</span>}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer text-[#667085]">
              <input
                type="checkbox"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
                className="rounded border-slate-300 text-[#0F9D8C] focus:ring-[#0F9D8C]"
              />
              <span>تذكر تسجيل الدخول</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-3 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer"
          >
            <span>دخول لوحة التحكم</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E7ECF2] text-center text-xs text-[#667085]">
          ليس لديك حساب بعد؟{' '}
          <Link href="/register" className="text-[#0F9D8C] font-bold hover:underline">
            أنشئ حسابك وابدأ تجربة الموظف الذكي
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <LanguageProvider>
      <Head title="تسجيل الدخول — جاوبني" />
      <LoginForm />
    </LanguageProvider>
  );
}
