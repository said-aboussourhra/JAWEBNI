import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Sliders,
  Users2,
  Cpu,
  FlaskConical,
  TrendingUp,
  Building2,
  ChevronDown,
  CheckCircle2,
  Shield,
  Layers,
  Inbox,
  Filter,
  CheckSquare,
  Bot,
  MessageSquareText,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface ContextPanelProps {
  activeHub: string;
  activeSection?: string;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ activeHub, activeSection = 'overview' }) => {
  const { auth } = usePage<{ auth: any }>().props;
  const { t, direction } = useLanguage();
  const business = auth?.business;

  // Context sections per active hub
  const getContextConfig = () => {
    switch (activeHub) {
      case 'ai-studio':
        return {
          title: t('nav.ai_studio', 'AI Studio'),
          badge: `${business?.ai_readiness_score || 85}% Ready`,
          items: [
            { id: 'overview', label: 'Overview & Canvas', icon: Layers, href: '/ai-studio' },
            { id: 'knowledge', label: 'Knowledge Base (RAG)', icon: BookOpen, href: '/ai-studio#knowledge' },
            { id: 'training', label: 'Training & Darija Q&A', icon: GraduationCap, href: '/ai-studio#training' },
            { id: 'personality', label: 'Personality Lab', icon: Sliders, href: '/ai-studio#personality' },
            { id: 'agents', label: 'Agents Control Room', icon: Users2, href: '/ai-studio#agents' },
            { id: 'memory', label: 'Customer AI Memory', icon: Cpu, href: '/ai-studio#memory' },
            { id: 'test-lab', label: 'Interactive Test Lab', icon: FlaskConical, href: '/ai-studio#test-lab' },
            { id: 'improvements', label: 'Proactive Improvements', icon: TrendingUp, href: '/ai-studio#improvements' },
          ],
        };
      case 'inbox':
        return {
          title: t('nav.inbox', 'AI Inbox Workspace'),
          badge: 'Real-time',
          items: [
            { id: 'all', label: 'All Conversations', icon: Inbox, href: '/inbox' },
            { id: 'ai-handling', label: 'AI Handling Active', icon: Bot, href: '/inbox?filter=ai' },
            { id: 'human-handoff', label: 'Needs Human Attention', icon: MessageSquareText, href: '/inbox?filter=human', badge: '1' },
            { id: 'closed', label: 'Resolved & Archived', icon: CheckSquare, href: '/inbox?filter=closed' },
          ],
        };
      case 'pulse':
      default:
        return {
          title: t('nav.pulse', 'Business Pulse'),
          badge: 'Live Stream',
          items: [
            { id: 'overview', label: 'Today\'s Business Story', icon: Layers, href: '/pulse' },
            { id: 'opportunities', label: 'Opportunity Radar', icon: TrendingUp, href: '/pulse#opportunities' },
            { id: 'live-stream', label: 'AI Real-time Activity', icon: Bot, href: '/pulse#live-stream' },
          ],
        };
    }
  };

  const config = getContextConfig();

  return (
    <aside className="w-64 bg-[#FFFFFF] border-r border-[#E7ECF2] flex flex-col shrink-0 h-screen select-none">
      {/* Tenant Brand Identity Selector */}
      <div className="p-4 border-b border-[#E7ECF2] flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#DDF7F2] text-[#0F9D8C] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#172033] truncate">
              {business?.name || 'Jawebni Workspace'}
            </h2>
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs text-[#667085]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="truncate">{business?.city || 'Morocco'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Context Hub Header */}
      <div className="px-4 pt-5 pb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
          {config.title}
        </span>
        {config.badge && (
          <span className="text-[11px] font-semibold bg-[#DDF7F2] text-[#0F9D8C] px-2 py-0.5 rounded-full">
            {config.badge}
          </span>
        )}
      </div>

      {/* Context Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {config.items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-[#F6F8FB] text-[#0F9D8C] shadow-xs border border-[#E7ECF2]'
                  : 'text-[#667085] hover:bg-[#F6F8FB] hover:text-[#172033]'
              }`}
            >
              <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#0F9D8C]' : 'text-slate-400 group-hover:text-[#172033]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-[#FF7A59] text-white px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Health Indicator */}
      <div className="p-4 m-3 bg-[#F6F8FB] rounded-2xl border border-[#E7ECF2]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#172033]">AI Readiness Score</span>
          <span className="text-xs font-extrabold text-[#0F9D8C]">{business?.ai_readiness_score || 85}%</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#0F9D8C] h-full rounded-full transition-all duration-500"
            style={{ width: `${business?.ai_readiness_score || 85}%` }}
          />
        </div>
        <div className="mt-2 flex items-center text-[11px] text-[#667085] space-x-1 rtl:space-x-reverse">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Moroccan Darija Model Active</span>
        </div>
      </div>
    </aside>
  );
};
