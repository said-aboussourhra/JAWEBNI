import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { NavigationRail } from '@/Components/Navigation/NavigationRail';
import { ContextPanel } from '@/Components/Navigation/ContextPanel';
import { CommandPalette } from '@/Components/CommandPalette/CommandPalette';
import { JawebniCopilot } from '@/Components/Copilot/JawebniCopilot';
import { LanguageProvider } from '@/lib/i18n';

interface AppShellProps {
  title?: string;
  activeHub: string;
  activeSection?: string;
  showContextPanel?: boolean;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  title = 'Jawebni — جاوبني',
  activeHub,
  activeSection = 'overview',
  showContextPanel = true,
  children,
}) => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <LanguageProvider>
      <Head title={title} />
      <div className="flex h-screen w-screen overflow-hidden bg-[#F6F8FB] text-[#172033]">
        {/* Level 1: Navigation Rail */}
        <NavigationRail
          activeHub={activeHub}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
          copilotOpen={copilotOpen}
        />

        {/* Level 2: Context Panel (when applicable) */}
        {showContextPanel && (
          <ContextPanel activeHub={activeHub} activeSection={activeSection} />
        )}

        {/* Level 3: Main Workspace Canvas */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
          {children}
        </main>

        {/* Global Command Palette (Ctrl+K) */}
        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
        />

        {/* Jawebni Copilot Drawer */}
        <JawebniCopilot
          open={copilotOpen}
          onClose={() => setCopilotOpen(false)}
        />
      </div>
    </LanguageProvider>
  );
};
