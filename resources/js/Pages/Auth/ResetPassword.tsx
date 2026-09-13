import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Bot, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface ResetPasswordProps {
  token: string;
  email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
  const { data, setData, post, processing, errors } = useForm({
    token,
    email,
    password: '',
    password_confirmation: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/reset-password');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F8FB] p-6" dir="rtl">
      <Head title="كلمة مرور جديدة — جاوبني" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E7ECF2] shadow-xl p-8 space-y-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-3 bg-[#0F9D8C] text-white rounded-2xl shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#172033]">كلمة مرور جديدة</h1>
            <p className="text-[11px] text-[#667085]">اختر كلمة مرور قوية مكوّنة من 8 أحرف على الأقل</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#172033]">البريد الإلكتروني</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              className="w-full mt-1.5 text-sm py-3 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              required
            />
            {errors.email && <p className="text-[11px] text-rose-500 mt-1.5">{errors.email}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-[#172033]">كلمة المرور الجديدة</label>
            <div className="relative mt-1.5">
              <input
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className="w-full text-sm py-3 px-3 pr-10 rtl:pr-3 rtl:pl-10 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 rtl:right-auto rtl:left-3 top-3.5" />
            </div>
            {errors.password && <p className="text-[11px] text-rose-500 mt-1.5">{errors.password}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-[#172033]">تأكيد كلمة المرور</label>
            <input
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
              className="w-full mt-1.5 text-sm py-3 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse bg-[#0F9D8C] hover:bg-[#0c8577] text-white text-sm font-bold py-3 rounded-xl disabled:opacity-60"
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>تغيير كلمة المرور</span>
          </button>
        </form>

        <Link href="/login" className="block text-center text-xs font-bold text-[#0F9D8C] hover:underline">
          الرجوع إلى صفحة الدخول
        </Link>
      </div>
    </div>
  );
}
