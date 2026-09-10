import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Jawebni — جاوبني';

createInertiaApp({
  title: (title) => `${title} — ${appName}`,
  resolve: (name: string) => {
    const pages = import.meta.glob<any>('./Pages/**/*.tsx', { eager: true });
    return pages[`./Pages/${name}.tsx`];
  },
  setup({ el, App, props }) {
    if (!el) return;
    const root = createRoot(el);
    root.render(<App {...props} />);
  },
  progress: {
    color: '#0F9D8C',
    showSpinner: true,
  },
});
