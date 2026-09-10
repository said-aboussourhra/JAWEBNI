import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { router } from '@inertiajs/react';
import {
  Search,
  MessageSquare,
  Sparkles,
  Users,
  GitBranch,
  BarChart3,
  Settings,
  PlusCircle,
  FileText,
  Bot,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!open) return null;

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E7ECF2] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Center" className="w-full">
          <div className="flex items-center px-4 border-b border-[#E7ECF2]">
            <Search className="w-5 h-5 text-[#667085] shrink-0" />
            <Command.Input
              placeholder={t('cmd.placeholder', 'Type a command or search (e.g. Train AI, Open Inbox, Ahmed)...')}
              className="w-full px-3 py-4 text-sm bg-transparent outline-none text-[#172033] placeholder-[#667085]"
              autoFocus
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-xs">
            <Command.Empty className="py-6 text-center text-slate-500">
              No matching commands or resources found.
            </Command.Empty>

            <Command.Group heading="Quick Navigation" className="text-[11px] font-bold text-[#667085] px-2 py-1.5">
              <Command.Item
                onSelect={() => runCommand(() => router.visit('/pulse'))}
                className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#F6F8FB] hover:text-[#0F9D8C]"
              >
                <Zap className="w-4 h-4 text-[#0F9D8C]" />
                <span>Open Business Pulse (نبض الأعمال)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.visit('/inbox'))}
                className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#F6F8FB] hover:text-[#0F9D8C]"
              >
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span>Open AI Inbox & Live Chats (المحادثات)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.visit('/ai-studio'))}
                className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#F6F8FB] hover:text-[#0F9D8C]"
              >
                <Sparkles className="w-4 h-4 text-[#6C63FF]" />
                <span>Open AI Studio & Knowledge Canvas (استوديو AI)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.visit('/customers'))}
                className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#F6F8FB] hover:text-[#0F9D8C]"
              >
                <Users className="w-4 h-4 text-amber-500" />
                <span>Customer Intelligence & Memory (العملاء)</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="AI Actions & Training" className="text-[11px] font-bold text-[#667085] px-2 py-1.5 mt-2">
              <Command.Item
                onSelect={() => runCommand(() => router.visit('/ai-studio#training'))}
                className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#F6F8FB] hover:text-[#0F9D8C]"
              >
                <PlusCircle className="w-4 h-4 text-[#0F9D8C]" />
                <span>Teach AI New Darija / Arabic Q&A</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.visit('/ai-studio#knowledge'))}
                className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#F6F8FB] hover:text-[#0F9D8C]"
              >
                <FileText className="w-4 h-4 text-[#6C63FF]" />
                <span>Upload Product Catalog or PDF Document (RAG)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.visit('/ai-studio#test-lab'))}
                className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#F6F8FB] hover:text-[#0F9D8C]"
              >
                <Bot className="w-4 h-4 text-emerald-500" />
                <span>Test Simulated Customer WhatsApp Conversation</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F6F8FB] border-t border-[#E7ECF2] text-[11px] text-[#667085]">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Esc</kbd>
              <span>to close</span>
            </div>
            <span>Jawebni Command Engine</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
