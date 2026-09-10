import React from 'react';
import { AppShell } from '@/Layouts/AppShell';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function AnalyticsIndex() {
  return (
    <AppShell activeHub="analytics" title="التحليلات الذكية — Intelligence Storytelling">
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172033]">التحليلات وسرد الرؤى (Intelligence Storytelling)</h1>
          <p className="text-xs text-[#667085] mt-1">
            إحصائيات استهلاك التوكنز، معدلات التحويل، وأكثر الأسئلة تكراراً
          </p>
        </div>
      </div>
    </AppShell>
  );
}
