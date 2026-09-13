import React, { useState } from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { useForm } from '@inertiajs/react';
import {
  Calendar,
  Clock,
  Users,
  PlusCircle,
  Search,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  Scissors,
  DollarSign,
  Timer,
  Filter,
  CalendarDays,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface BookingItem {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  service_price: string;
  staff_name: string;
  datetime: string;
  status: string;
  booked_via: string;
  reminder_sent: boolean;
}

interface Service {
  id: string;
  name: string;
  price: string;
  duration_minutes: number;
  color: string;
}

interface Staff {
  id: string;
  name: string;
  role_title: string;
  phone: string;
}

interface BookingProps {
  bookings: BookingItem[];
  services: Service[];
  staff: Staff[];
}

export default function BookingIndex({ bookings = [], services = [], staff = [] }: BookingProps) {
  const [activeView, setActiveView] = useState<'calendar' | 'list' | 'services'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const createForm = useForm({
    customer_name: '',
    customer_phone: '',
    service_id: '',
    staff_member_id: '',
    booking_datetime: '',
    notes: '',
  });

  const defaultServices: Service[] = services.length
    ? services
    : [
        { id: '1', name: 'جلسة قياس قفطان ملكي', price: '0', duration_minutes: 45, color: '#0F9D8C' },
        { id: '2', name: 'استشارة ستايل وألوان', price: '150', duration_minutes: 30, color: '#6C63FF' },
        { id: '3', name: 'قياس وتعديل جلابة', price: '0', duration_minutes: 30, color: '#FF7A59' },
      ];

  const defaultStaff: Staff[] = staff.length
    ? staff
    : [
        { id: '1', name: 'سارة المنصوري', role_title: 'Styliste Principale', phone: '+212 661-111222' },
        { id: '2', name: 'فاطمة الزهراء', role_title: 'Conseillère Clientèle', phone: '+212 661-333444' },
        { id: '3', name: 'ياسمين بناني', role_title: 'Couturière Expert', phone: '+212 661-555666' },
      ];

  const defaultBookings: BookingItem[] = bookings.length
    ? bookings
    : [
        {
          id: '1',
          customer_name: 'أحمد الإدريسي',
          customer_phone: '+212 661-998877',
          service_name: 'جلسة قياس قفطان ملكي',
          service_price: 'مجاني',
          staff_name: 'سارة المنصوري',
          datetime: '2026-09-14 16:00',
          status: 'confirmed',
          booked_via: 'whatsapp_ai',
          reminder_sent: true,
        },
        {
          id: '2',
          customer_name: 'سارة التازي',
          customer_phone: '+212 662-445566',
          service_name: 'استشارة ستايل وألوان',
          service_price: '150 MAD',
          staff_name: 'فاطمة الزهراء',
          datetime: '2026-09-14 11:00',
          status: 'confirmed',
          booked_via: 'whatsapp_ai',
          reminder_sent: false,
        },
        {
          id: '3',
          customer_name: 'محمد العلمي',
          customer_phone: '+212 660-112233',
          service_name: 'قياس وتعديل جلابة',
          service_price: 'مجاني',
          staff_name: 'ياسمين بناني',
          datetime: '2026-09-15 10:30',
          status: 'confirmed',
          booked_via: 'manual',
          reminder_sent: true,
        },
      ];

  const filteredBookings = defaultBookings.filter(
    (b) => b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || b.customer_phone.includes(searchQuery)
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post('/booking/store', {
      preserveScroll: true,
      onSuccess: () => {
        setShowCreateModal(false);
        createForm.reset();
      },
    });
  };

  const todayBookings = filteredBookings.filter((b) => b.datetime.includes(selectedDate) || b.datetime.includes('2026-09-14'));
  const upcomingBookings = filteredBookings;

  return (
    <AppShell activeHub="booking" title="الحجوزات والمواعيد — Booking">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0F9D8C] text-white rounded-2xl shadow-md">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#172033]">إدارة الحجوزات والمواعيد (Booking Workspace)</h1>
              <p className="text-xs text-[#667085] mt-1">مواعيد القياس في المحل، تذكير تلقائي عبر واتساب، وتنسيق مع فريق العمل</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-[#0F9D8C] hover:bg-[#0c7d6f] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            حجز موعد جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#667085]">مواعيد اليوم</span>
              <Calendar className="w-4 h-4 text-[#0F9D8C]" />
            </div>
            <div className="text-2xl font-extrabold text-[#172033]">{todayBookings.length}</div>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">● 2 مؤكد، 1 في الانتظار</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#667085]">تم عبر AI</span>
              <Sparkles className="w-4 h-4 text-[#6C63FF]" />
            </div>
            <div className="text-2xl font-extrabold text-[#172033]">{defaultBookings.filter((b) => b.booked_via === 'whatsapp_ai').length}</div>
            <p className="text-[11px] text-[#6C63FF] font-bold mt-1">حجز تلقائي من واتساب</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#667085]">تذكير مرسل</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">{defaultBookings.filter((b) => b.reminder_sent).length}</div>
            <p className="text-[11px] text-[#667085] mt-1">تم إرسال تذكير واتساب</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#667085]">خدمات متاحة</span>
              <Scissors className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-[#172033]">{defaultServices.length}</div>
            <p className="text-[11px] text-[#667085] mt-1">أنواع جلسات القياس</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E7ECF2] pb-3">
          {[
            { id: 'calendar', label: 'التقويم اليومي', icon: Calendar },
            { id: 'list', label: 'قائمة المواعيد', icon: Clock },
            { id: 'services', label: 'الخدمات والطاقم', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeView === tab.id ? 'bg-[#172033] text-white shadow-md' : 'bg-white text-[#667085] border border-[#E7ECF2]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Calendar View */}
        {activeView === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E7ECF2] shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-[#172033]">مواعيد {selectedDate}</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs p-2 border border-[#E7ECF2] rounded-xl bg-[#F6F8FB] outline-none focus:border-[#0F9D8C]"
                />
              </div>

              <div className="space-y-3">
                {[
                  { time: '10:00', duration: '30m', available: true },
                  { time: '10:30', duration: '45m', booking: todayBookings[2] },
                  { time: '11:00', duration: '30m', booking: todayBookings[1] },
                  { time: '11:30', duration: '30m', available: true },
                  { time: '12:00', duration: '60m', available: true },
                  { time: '14:00', duration: '30m', available: true },
                  { time: '16:00', duration: '45m', booking: todayBookings[0] },
                  { time: '16:45', duration: '30m', available: true },
                ].map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 text-xs font-bold text-[#667085]">{slot.time}</div>
                    <div className="flex-1">
                      {slot.available ? (
                        <div className="p-3 bg-[#F6F8FB] border border-dashed border-[#E7ECF2] rounded-xl flex items-center justify-between hover:border-[#0F9D8C] transition-all cursor-pointer">
                          <span className="text-xs text-[#667085]">● متاح للحجز — {slot.duration}</span>
                          <button className="text-xs font-bold text-[#0F9D8C]">حجز هذا التوقيت →</button>
                        </div>
                      ) : slot.booking ? (
                        <div className="p-4 bg-white border border-[#0F9D8C]/30 rounded-xl shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0F9D8C] text-white flex items-center justify-center font-bold text-xs">
                              {slot.booking.customer_name.substring(0, 2)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#172033]">{slot.booking.customer_name}</div>
                              <div className="text-[11px] text-[#667085]">{slot.booking.service_name} • {slot.booking.staff_name}</div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">مؤكد</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-[#E7ECF2] shadow-sm">
                <h4 className="text-xs font-bold text-[#172033] mb-3">فريق العمل اليوم</h4>
                <div className="space-y-3">
                  {defaultStaff.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 bg-[#F6F8FB] rounded-xl border border-[#E7ECF2]">
                      <div className="w-9 h-9 rounded-xl bg-[#123B3A] text-white flex items-center justify-center font-bold text-xs">{s.name.substring(0, 2)}</div>
                      <div>
                        <div className="text-xs font-bold text-[#172033]">{s.name}</div>
                        <div className="text-[11px] text-[#667085]">{s.role_title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#0F9D8C] to-[#123B3A] text-white p-5 rounded-3xl shadow-xl">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  حجز تلقائي عبر AI
                </h4>
                <p className="text-xs text-white/80 leading-relaxed">
                  عندما يطلب زبون موعداً عبر واتساب (مثلاً "بغيت نحجز نهار الجمعة مع 4")، يقوم وكيل الحجوزات باقتراح الأوقات المتاحة وتأكيد الموعد وإرسال تذكير تلقائي قبل 24 ساعة.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {activeView === 'list' && (
          <div className="bg-white rounded-3xl border border-[#E7ECF2] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#E7ECF2] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172033]">جميع المواعيد</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث باسم الزبون أو الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs py-2 px-3 pr-8 bg-[#F6F8FB] border border-[#E7ECF2] rounded-xl outline-none focus:border-[#0F9D8C] w-64"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>
            <table className="w-full text-xs text-right">
              <thead className="bg-[#F6F8FB] border-b border-[#E7ECF2] text-[#667085] font-bold">
                <tr>
                  <th className="p-4">الزبون</th>
                  <th className="p-4">الخدمة</th>
                  <th className="p-4">الطاقم</th>
                  <th className="p-4">التاريخ والوقت</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">المصدر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7ECF2]">
                {upcomingBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-bold text-[#172033]">{b.customer_name}</div>
                      <div className="text-[11px] text-[#667085] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {b.customer_phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold">{b.service_name}</div>
                      <div className="text-[11px] text-[#667085]">{b.service_price}</div>
                    </td>
                    <td className="p-4">{b.staff_name}</td>
                    <td className="p-4 font-mono">{b.datetime}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">● {b.status}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${b.booked_via === 'whatsapp_ai' ? 'bg-[#6C63FF]/15 text-[#6C63FF]' : 'bg-slate-100 text-slate-600'}`}>
                        {b.booked_via === 'whatsapp_ai' ? '🤖 واتساب AI' : 'يدوي'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Services View */}
        {activeView === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-sm">
              <h3 className="text-sm font-bold text-[#172033] mb-4 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#0F9D8C]" />
                الخدمات المتاحة
              </h3>
              <div className="space-y-3">
                {defaultServices.map((s) => (
                  <div key={s.id} className="p-4 bg-[#F6F8FB] rounded-2xl border border-[#E7ECF2] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <div>
                        <div className="text-xs font-bold text-[#172033]">{s.name}</div>
                        <div className="text-[11px] text-[#667085] flex items-center gap-2 mt-1">
                          <Timer className="w-3 h-3" />
                          {s.duration_minutes} دقيقة • {s.price === '0' ? 'مجاني' : `${s.price} MAD`}
                        </div>
                      </div>
                    </div>
                    <button className="p-2 bg-white border border-[#E7ECF2] rounded-xl hover:border-[#0F9D8C]">
                      <Phone className="w-4 h-4 text-[#667085]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E7ECF2] shadow-sm">
              <h3 className="text-sm font-bold text-[#172033] mb-4 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#6C63FF]" />
                طاقم العمل
              </h3>
              <div className="space-y-3">
                {defaultStaff.map((st) => (
                  <div key={st.id} className="p-4 bg-[#F6F8FB] rounded-2xl border border-[#E7ECF2]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#123B3A] text-white flex items-center justify-center font-bold text-xs">{st.name.substring(0, 2)}</div>
                      <div>
                        <div className="text-xs font-bold text-[#172033]">{st.name}</div>
                        <div className="text-[11px] text-[#667085]">{st.role_title}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#667085] mt-2 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {st.phone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#E7ECF2] shadow-2xl">
              <h3 className="text-base font-bold text-[#172033] mb-1">حجز موعد جديد</h3>
              <p className="text-xs text-[#667085] mb-5">أدخل بيانات الزبون واختر الخدمة والوقت المناسب</p>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">اسم الزبون</label>
                    <input
                      type="text"
                      value={createForm.data.customer_name}
                      onChange={(e) => createForm.setData('customer_name', e.target.value)}
                      className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1.5">رقم الهاتف</label>
                    <input
                      type="text"
                      value={createForm.data.customer_phone}
                      onChange={(e) => createForm.setData('customer_phone', e.target.value)}
                      className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none font-mono"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#172033] block mb-1.5">الخدمة</label>
                  <select
                    value={createForm.data.service_id}
                    onChange={(e) => createForm.setData('service_id', e.target.value)}
                    className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none bg-white"
                  >
                    <option value="">اختر الخدمة</option>
                    {defaultServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.price === '0' ? 'مجاني' : `${s.price} MAD`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#172033] block mb-1.5">التاريخ والوقت</label>
                  <input
                    type="datetime-local"
                    value={createForm.data.booking_datetime}
                    onChange={(e) => createForm.setData('booking_datetime', e.target.value)}
                    className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#172033] block mb-1.5">ملاحظات</label>
                  <textarea
                    rows={3}
                    value={createForm.data.notes}
                    onChange={(e) => createForm.setData('notes', e.target.value)}
                    className="w-full text-xs p-3 border border-[#E7ECF2] rounded-xl focus:border-[#0F9D8C] outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-xs font-bold text-[#667085]">
                    إلغاء
                  </button>
                  <button type="submit" disabled={createForm.processing} className="px-6 py-2.5 bg-[#0F9D8C] text-white text-xs font-bold rounded-xl shadow-md">
                    تأكيد الحجز وإرسال تذكير
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
