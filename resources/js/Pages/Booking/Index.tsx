import React, { useMemo, useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { router, useForm } from '@inertiajs/react';
import {
  Calendar,
  Clock,
  Users,
  UserCheck,
  Scissors,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Phone,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface BookingItem {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  service_price: string;
  staff_name: string;
  datetime: string;
  human_date?: string;
  status: string;
  booked_via: string;
  reminder_sent: boolean;
  notes?: string | null;
}

interface ServiceItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration_minutes: number;
  color?: string | null;
}

interface StaffItem {
  id: string;
  name: string;
  role_title?: string | null;
  phone?: string | null;
}

interface BookingProps {
  bookings: BookingItem[];
  services: ServiceItem[];
  staff: StaffItem[];
  customers: Array<{ id: string; name: string; phone: string }>;
  stats: { upcoming: number; today: number; completed: number; cancelled: number };
}

const statusStyles: Record<string, string> = {
  confirmed: 'bg-[#DDF7F2] text-[#0F9D8C]',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-rose-50 text-rose-500',
  no_show: 'bg-amber-50 text-amber-600',
};

export default function BookingIndex({
  bookings = [],
  services = [],
  staff = [],
  customers = [],
  stats = { upcoming: 0, today: 0, completed: 0, cancelled: 0 },
}: BookingProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [showCreate, setShowCreate] = useState(false);

  const bookingForm = useForm({
    customer_name: '',
    customer_phone: '',
    service_id: services[0]?.id ?? '',
    staff_member_id: staff[0]?.id ?? '',
    booking_datetime: '',
    notes: '',
    booked_via: 'manual',
  });

  const serviceForm = useForm({ name: '', description: '', price: 0, duration_minutes: 30, color: '#0F9D8C' });
  const staffForm = useForm({ name: '', phone: '', email: '', role_title: '' });

  const now = new Date();

  const filtered = useMemo(() => {
    const sorted = [...bookings].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );

    if (tab === 'upcoming') return sorted.filter((b) => new Date(b.datetime) >= now && b.status !== 'cancelled');
    if (tab === 'past') return sorted.filter((b) => new Date(b.datetime) < now || b.status === 'cancelled').reverse();

    return sorted;
  }, [bookings, tab, now]);

  const submitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    bookingForm.post('/booking/store', {
      preserveScroll: true,
      onSuccess: () => {
        bookingForm.reset();
        setShowCreate(false);
      },
    });
  };

  const changeStatus = (booking: BookingItem, status: string) => {
    router.put(`/booking/${booking.id}`, { status }, { preserveScroll: true });
  };

  const removeBooking = (booking: BookingItem) => {
    if (!confirm('واش بصّح بغيتي تحذف هاد الموعد؟')) return;
    router.delete(`/booking/${booking.id}`, { preserveScroll: true });
  };

  return (
    <AppShell activeHub="booking" activeSection="overview" title="المواعيد والحجوزات — Booking Workspace">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-xs">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-3 bg-[#0F9D8C] text-white rounded-2xl shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#172033]">
                مساحة المواعيد والحجوزات (Booking Workspace)
              </h1>
              <p className="text-xs text-[#667085] mt-0.5">
                المواعيد المحجوزة عبر واتساب بالذكاء الاصطناعي أو يدوياً من طرف الفريق
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center space-x-2 rtl:space-x-reverse bg-[#0F9D8C] hover:bg-[#0c8577] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>موعد جديد</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'مواعيد قادمة', value: stats.upcoming, icon: Calendar, color: 'text-[#0F9D8C]' },
            { label: 'مواعيد اليوم', value: stats.today, icon: Clock, color: 'text-[#6C63FF]' },
            { label: 'مكتملة', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: 'ملغاة', value: stats.cancelled, icon: XCircle, color: 'text-rose-400' },
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

        {/* Create form */}
        {showCreate && (
          <form onSubmit={submitBooking} className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-extrabold text-[#172033]">حجز موعد جديد</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                placeholder="اسم الزبون"
                value={bookingForm.data.customer_name}
                onChange={(e) => bookingForm.setData('customer_name', e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
              <input
                placeholder="رقم الهاتف (+212...)"
                value={bookingForm.data.customer_phone}
                onChange={(e) => bookingForm.setData('customer_phone', e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
              <input
                type="datetime-local"
                value={bookingForm.data.booking_datetime}
                onChange={(e) => bookingForm.setData('booking_datetime', e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
              <select
                value={bookingForm.data.service_id}
                onChange={(e) => bookingForm.setData('service_id', e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              >
                <option value="">بدون خدمة</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} • {service.duration_minutes} دقيقة
                  </option>
                ))}
              </select>
              <select
                value={bookingForm.data.staff_member_id}
                onChange={(e) => bookingForm.setData('staff_member_id', e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              >
                <option value="">أي عضو متاح</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <input
                placeholder="ملاحظات (اختياري)"
                value={bookingForm.data.notes}
                onChange={(e) => bookingForm.setData('notes', e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              />
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                type="submit"
                disabled={bookingForm.processing}
                className="flex items-center space-x-2 rtl:space-x-reverse bg-[#0F9D8C] text-white text-xs font-bold px-5 py-2.5 rounded-xl disabled:opacity-60"
              >
                {bookingForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>تأكيد الموعد</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-xs font-bold text-[#667085] px-4 py-2.5 rounded-xl hover:bg-[#F6F8FB]"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        {/* Tabs */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold">
          {([
            { key: 'upcoming', label: 'القادمة' },
            { key: 'past', label: 'السابقة' },
            { key: 'all', label: 'الكل' },
          ] as const).map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`px-4 py-2 rounded-xl transition-all ${
                tab === item.key ? 'bg-[#0F9D8C] text-white shadow-xs' : 'bg-white text-[#667085] border border-[#E7ECF2]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#667085]">
              <AlertTriangle className="w-6 h-6 mx-auto mb-3 text-amber-400" />
              لا توجد مواعيد في هذا القسم حالياً.
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-[#F6F8FB] border-b border-[#E7ECF2] text-[#667085] font-bold">
                <tr>
                  <th className="px-5 py-3 text-right">الزبون</th>
                  <th className="px-5 py-3 text-right">الخدمة</th>
                  <th className="px-5 py-3 text-right">المسؤول</th>
                  <th className="px-5 py-3 text-right">التاريخ والساعة</th>
                  <th className="px-5 py-3 text-right">الحالة</th>
                  <th className="px-5 py-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking.id} className="border-b border-[#F1F4F8] hover:bg-[#FAFCFD] transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-bold text-[#172033]">{booking.customer_name}</div>
                      <div className="text-[10px] text-[#98A2B3] flex items-center space-x-1 rtl:space-x-reverse mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{booking.customer_phone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div>{booking.service_name}</div>
                      <div className="text-[10px] text-[#98A2B3]">{booking.service_price}</div>
                    </td>
                    <td className="px-5 py-3">{booking.staff_name}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold">{booking.human_date ?? booking.datetime}</div>
                      <div className="text-[10px] text-[#98A2B3]">
                        {booking.booked_via === 'whatsapp_ai' ? 'محجوز عبر واتساب AI' : 'محجوز يدوياً'}
                        {booking.reminder_sent ? ' • تم إرسال التذكير' : ''}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-lg font-bold ${statusStyles[booking.status] ?? 'bg-slate-100 text-slate-500'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                        {booking.status !== 'completed' && (
                          <button
                            onClick={() => changeStatus(booking, 'completed')}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            title="تم الحضور"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => changeStatus(booking, 'cancelled')}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                            title="إلغاء الموعد"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => removeBooking(booking)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                          title="حذف"
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

        {/* Services & Staff management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6 space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Scissors className="w-4 h-4 text-[#0F9D8C]" />
              <h3 className="text-sm font-extrabold text-[#172033]">الخدمات ({services.length})</h3>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F6F8FB]">
                  <div>
                    <p className="text-xs font-bold text-[#172033]">{service.name}</p>
                    <p className="text-[10px] text-[#667085]">
                      {service.duration_minutes} دقيقة • {service.price} MAD
                    </p>
                  </div>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: service.color ?? '#0F9D8C' }}
                  />
                </div>
              ))}
              {services.length === 0 && <p className="text-xs text-[#667085]">لا توجد خدمات بعد.</p>}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                serviceForm.post('/booking/services', {
                  preserveScroll: true,
                  onSuccess: () => serviceForm.reset(),
                });
              }}
              className="grid grid-cols-2 gap-3"
            >
              <input
                placeholder="اسم الخدمة"
                value={serviceForm.data.name}
                onChange={(e) => serviceForm.setData('name', e.target.value)}
                className="col-span-2 text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
              <input
                type="number"
                placeholder="الثمن (MAD)"
                value={serviceForm.data.price}
                onChange={(e) => serviceForm.setData('price', Number(e.target.value))}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              />
              <input
                type="number"
                placeholder="المدة (دقيقة)"
                value={serviceForm.data.duration_minutes}
                onChange={(e) => serviceForm.setData('duration_minutes', Number(e.target.value))}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              />
              <button
                type="submit"
                disabled={serviceForm.processing}
                className="col-span-2 bg-[#172033] text-white text-xs font-bold py-2.5 rounded-xl disabled:opacity-60"
              >
                إضافة الخدمة
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-xs p-6 space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <UserCheck className="w-4 h-4 text-[#6C63FF]" />
              <h3 className="text-sm font-extrabold text-[#172033]">فريق العمل ({staff.length})</h3>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F6F8FB]">
                  <div>
                    <p className="text-xs font-bold text-[#172033]">{member.name}</p>
                    <p className="text-[10px] text-[#667085]">{member.role_title ?? 'عضو الفريق'}</p>
                  </div>
                  {member.phone && (
                    <span className="text-[10px] text-[#98A2B3] flex items-center space-x-1 rtl:space-x-reverse">
                      <Phone className="w-3 h-3" />
                      <span>{member.phone}</span>
                    </span>
                  )}
                </div>
              ))}
              {staff.length === 0 && <p className="text-xs text-[#667085]">لا يوجد أعضاء بعد.</p>}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                staffForm.post('/booking/staff', {
                  preserveScroll: true,
                  onSuccess: () => staffForm.reset(),
                });
              }}
              className="grid grid-cols-2 gap-3"
            >
              <input
                placeholder="الاسم الكامل"
                value={staffForm.data.name}
                onChange={(e) => staffForm.setData('name', e.target.value)}
                className="col-span-2 text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
                required
              />
              <input
                placeholder="الهاتف"
                value={staffForm.data.phone}
                onChange={(e) => staffForm.setData('phone', e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline:none focus:border-[#0F9D8C]"
              />
              <input
                placeholder="الصفة المهنية"
                value={staffForm.data.role_title}
                onChange={(e) => staffForm.setData('role_title', e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C]"
              />
              <button
                type="submit"
                disabled={staffForm.processing}
                className="col-span-2 bg-[#172033] text-white text-xs font-bold py-2.5 rounded-xl disabled:opacity-60"
              >
                إضافة عضو
              </button>
            </form>
          </div>
        </div>

        {customers.length > 0 && (
          <p className="text-[11px] text-[#98A2B3] text-center">
            {customers.length} زبون مسجل في قاعدة البيانات — اختر أحدهم من صندوق المحادثات لحجز موعد مباشرة.
          </p>
        )}
      </div>
    </AppShell>
  );
}
