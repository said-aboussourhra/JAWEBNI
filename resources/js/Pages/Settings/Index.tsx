import React from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { Settings, Shield, CreditCard } from 'lucide-react';

export default function SettingsIndex() {
  return (
    <AppShell activeHub="settings" title="إعدادات النظام — Settings">
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172033]">إعدادات النشاط التجاري والاشتراك</h1>
          <p className="text-xs text-[#667085] mt-1">
            إدارة بيانات النشاط التجاري، مفاتيح Meta API، ومعلومات التحويل البنكي (RIB / IBAN)
          </p>
        </div>
      </div>
    </AppShell>
  );
}
