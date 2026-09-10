import React from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { ShieldCheck, Building2, CreditCard, DollarSign } from 'lucide-react';

export default function AdminIndex() {
  return (
    <AppShell activeHub="admin" title="مركز التحكم العام — Jawebni Super Admin">
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172033]">مركز التحكم العام (Super Admin Control Center)</h1>
          <p className="text-xs text-[#667085] mt-1">
            مراجعة مدفوعات التحويل البنكي (RIB / IBAN)، إدارة المستأجرين، ومراقبة تكاليف نماذج AI
          </p>
        </div>
      </div>
    </AppShell>
  );
}
