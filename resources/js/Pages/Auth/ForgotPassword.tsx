import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Bot, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
  const { data, setData, post, processing, errors } = useForm({ email: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/forgot-password');
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#F6F8FB] p-6"
      dir="rtl"
    >
      <Head title="استعادة كلمة المرور — جاوبني" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E7ECF2] shadow-xl p-8 space-y-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-3 bg-[#0F9D8C] text-white rounded-2xl shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#172033]">استعادة كلمة المرور</h1>
            <p className="text-[11px] text-[#667085]">أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين</p>
          </div>
        </div>

        {status && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse bg-emerald-50 text-emerald-700 text-xs p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
            <span>{status}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#172033]">البريد الإلكتروني</label>
            <div className="relative mt-1.5">
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="w-full text-sm py-3 px-3 pr-10 rtl:pr-3 rtl:pl-10 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                placeholder="vous@entreprise.ma"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 rtl:right-auto rtl:left-3 top-3.5" />
            </div>
            {errors.email && <p className="text-[11px] text-rose-500 mt-1.5">{errors.email}</p>}
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse bg-[#0F9D8C] hover:bg-[#0c8577] text-white text-sm font-bold py-3 rounded-xl disabled:opacity-60"
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>إرسال الرابط</span>
          </button>
        </form>

        <Link href="/login" className="block text-center text-xs font-bold text-[#0F9D8C] hover:underline">
          الرجوع إلى صفحة الدخول
        </Link>
      </div>
    </div>
  );
}
