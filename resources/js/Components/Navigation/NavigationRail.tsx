import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  Activity,
  MessageSquare,
  Sparkles,
  Users,
  GitBranch,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Search,
  Globe,
  Bot,
  Zap,
} from 'lucide-react';
import { useLanguage, Locale } from '@/lib/i18n';

interface NavRailProps {
  activeHub: string;
  onOpenCommandPalette: () => void;
  onToggleCopilot: () => void;
  copilotOpen: boolean;
}

export const NavigationRail: React.FC<NavRailProps> = ({
  activeHub,
  onOpenCommandPalette,
  onToggleCopilot,
  copilotOpen,
}) => {
  const { auth } = usePage<{ auth: any }>().props;
  const { locale, direction, setLocale, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'pulse',
      href: '/pulse',
      label: t('nav.pulse', 'Business Pulse'),
      icon: Activity,
      badge: 'Live',
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'inbox',
      href: '/inbox',
      label: t('nav.inbox', 'Inbox'),
      icon: MessageSquare,
      badge: '3',
      badgeColor: 'bg-[#FF7A59]',
    },
    {
      id: 'ai-studio',
      href: '/ai-studio',
      label: t('nav.ai_studio', 'AI Studio'),
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'customers',
      href: '/customers',
      label: t('nav.customers', 'Customers'),
      icon: Users,
    },
    {
      id: 'automation',
      href: '/automation',
      label: t('nav.automation', 'Workflows'),
      icon: GitBranch,
    },
    {
      id: 'analytics',
      href: '/analytics',
      label: t('nav.analytics', 'Analytics'),
      icon: BarChart3,
    },
  ];

  const handleLocaleChange = (newLoc: Locale) => {
    setLocale(newLoc);
    setLangMenuOpen(false);
  };

  return (
    <aside className="w-16 md:w-18 bg-[#123B3A] text-white flex flex-col items-center py-4 z-40 select-none shadow-xl border-r border-[#0F9D8C]/20 shrink-0">
      {/* Brand Icon & Status */}
      <Link
        href="/pulse"
        className="relative group p-2.5 rounded-2xl bg-[#0F9D8C]/20 hover:bg-[#0F9D8C] transition-all duration-300 text-white shadow-sm flex items-center justify-center mb-6"
      >
        <Bot className="w-7 h-7 text-[#DDF7F2] group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#123B3A] animate-pulse" />
      </Link>

      {/* Global Command Center Search Quick Trigger */}
      <button
        onClick={onOpenCommandPalette}
        title="Command Center (Ctrl+K)"
        className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all mb-4 relative"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Core Nav Destinations */}
      <nav className="flex-1 flex flex-col space-y-2 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeHub === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex items-center justify-center w-full h-12 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-[#0F9D8C] text-white shadow-md shadow-[#0F9D8C]/30'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.highlight && !isActive ? 'text-[#6C63FF]' : ''}`} />

              {/* Badges */}
              {item.badge && (
                <span
                  className={`absolute top-1.5 right-1.5 text-[9px] font-bold text-white px-1.5 py-0.2 rounded-full ring-2 ring-[#123B3A] ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip on hover */}
              <div
                className={`absolute ${
                  direction === 'rtl' ? 'right-full mr-3' : 'left-full ml-3'
                } hidden group-hover:flex items-center px-3 py-1.5 bg-[#172033] text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none`}
              >
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Hub: Copilot, Language Switcher, Admin, Settings */}
      <div className="flex flex-col space-y-2 w-full px-2 pt-4 border-t border-white/10 items-center">
        {/* In-App Copilot Trigger */}
        <button
          onClick={onToggleCopilot}
          title={t('copilot.title', 'Jawebni Copilot')}
          className={`relative p-2.5 rounded-xl transition-all w-full flex items-center justify-center ${
            copilotOpen
              ? 'bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/40'
              : 'text-[#6C63FF] bg-[#6C63FF]/15 hover:bg-[#6C63FF]/30'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#6C63FF] rounded-full animate-ping" />
        </button>

        {/* Language Switcher */}
        <div className="relative w-full flex justify-center">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            title="Switch Language / تبديل اللغة"
            className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center justify-center"
          >
            <Globe className="w-5 h-5" />
          </button>

          {langMenuOpen && (
            <div
              className={`absolute bottom-0 ${
                direction === 'rtl' ? 'right-full mr-3' : 'left-full ml-3'
              } bg-[#172033] border border-slate-700 shadow-2xl rounded-xl py-2 px-1 w-36 z-50 text-xs text-white`}
            >
              <button
                onClick={() => handleLocaleChange('ar')}
                className={`w-full text-right px-3 py-2 rounded-lg flex items-center justify-between ${
                  locale === 'ar' ? 'bg-[#0F9D8C] text-white font-bold' : 'hover:bg-white/10'
                }`}
              >
                <span>العربية (الدارجة)</span>
                {locale === 'ar' && <span>✓</span>}
              </button>
              <button
                onClick={() => handleLocaleChange('fr')}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                  locale === 'fr' ? 'bg-[#0F9D8C] text-white font-bold' : 'hover:bg-white/10'
                }`}
              >
                <span>Français</span>
                {locale === 'fr' && <span>✓</span>}
              </button>
              <button
                onClick={() => handleLocaleChange('en')}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                  locale === 'en' ? 'bg-[#0F9D8C] text-white font-bold' : 'hover:bg-white/10'
                }`}
              >
                <span>English</span>
                {locale === 'en' && <span>✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Super Admin Hub link if superadmin */}
        {auth?.user?.is_super_admin && (
          <Link
            href="/admin"
            title="Super Admin Control Hub"
            className={`p-2.5 rounded-xl transition-all w-full flex items-center justify-center ${
              activeHub === 'admin'
                ? 'bg-amber-500 text-white'
                : 'text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </Link>
        )}

        {/* Settings */}
        <Link
          href="/settings"
          title={t('nav.settings', 'Settings')}
          className={`p-2.5 rounded-xl transition-all w-full flex items-center justify-center ${
            activeHub === 'settings'
              ? 'bg-[#0F9D8C] text-white'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </aside>
  );
};
