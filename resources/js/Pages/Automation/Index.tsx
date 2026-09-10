import React from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { GitBranch, Zap } from 'lucide-react';

export default function AutomationIndex() {
  return (
    <AppShell activeHub="automation" title="الأتمتة ومسارات العمل — Workflows">
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172033]">محرك الأتمتة ومسارات العمل (Visual Automation Engine)</h1>
          <p className="text-xs text-[#667085] mt-1">
            بناء تدفقات تلقائية مبنية على نية العميل وحالات الشراء والتذكير
          </p>
        </div>
      </div>
    </AppShell>
  );
}
