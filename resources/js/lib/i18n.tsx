import React, { createContext, useContext, useEffect, useState } from 'react';

export type Locale = 'ar' | 'fr' | 'en';
export type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  locale: Locale;
  direction: Direction;
  setLocale: (locale: Locale) => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  ar: {
    'brand.name': 'جاوبني',
    'brand.tagline': 'موظفك الذكي على واتساب',
    'nav.pulse': 'نبض الأعمال (Pulse)',
    'nav.inbox': 'صندوق المحادثات (Inbox)',
    'nav.ai_studio': 'استوديو الذكاء الاصطناعي',
    'nav.customers': 'عملاء وذاكرة AI',
    'nav.agents': 'الوكلاء الأذكياء',
    'nav.booking': 'المواعيد والحجوزات',
    'nav.campaigns': 'الحملات التسويقية',
    'nav.automation': 'الأتمتة ومسارات العمل',
    'nav.analytics': 'التحليلات الذكية',
    'nav.settings': 'إعدادات النظام',
    'nav.admin': 'مركز التحكم العام',
    'cmd.placeholder': 'ابحث في المحادثات، تدريب AI، العملاء، الإجراءات... (Ctrl + K)',
    'copilot.title': 'مساعد جاوبني الذكي (Copilot)',
    'copilot.recommendation': 'توصيات واقتراحات لتحسين الأداء',
    'status.ai_active': 'الذكاء الاصطناعي نشط 24/7',
    'status.whatsapp_connected': 'واتساب متصل بالخدمة السحابية',
    'btn.save': 'حفظ ومتابعة',
    'btn.go_live': 'إطلاق موظفك الذكي الآن 🚀',
  },
  fr: {
    'brand.name': 'Jawebni',
    'brand.tagline': 'Votre employé IA sur WhatsApp 24/7',
    'nav.pulse': 'Business Pulse',
    'nav.inbox': 'Boîte de réception IA',
    'nav.ai_studio': 'AI Studio & Savoir',
    'nav.customers': 'Clients & Mémoire IA',
    'nav.agents': 'Agents IA',
    'nav.booking': 'Rendez-vous',
    'nav.campaigns': 'Campagnes',
    'nav.automation': 'Automatisation & Flux',
    'nav.analytics': 'Analytique & Intelligence',
    'nav.settings': 'Paramètres Entreprise',
    'nav.admin': 'Super Admin Hub',
    'cmd.placeholder': 'Rechercher conversations, entraînement IA, clients... (Ctrl + K)',
    'copilot.title': 'Copilote Intelligent Jawebni',
    'copilot.recommendation': 'Recommandations proactives',
    'status.ai_active': 'Employé IA Actif 24/7',
    'status.whatsapp_connected': 'WhatsApp Cloud API Connecté',
    'btn.save': 'Enregistrer & Continuer',
    'btn.go_live': 'Lancer votre Employé IA 🚀',
  },
  en: {
    'brand.name': 'Jawebni',
    'brand.tagline': 'Your AI Employee for WhatsApp',
    'nav.pulse': 'Business Pulse',
    'nav.inbox': 'Inbox & Conversations',
    'nav.ai_studio': 'AI Studio & Knowledge',
    'nav.customers': 'Customer Intelligence',
    'nav.agents': 'AI Agents',
    'nav.booking': 'Bookings',
    'nav.campaigns': 'Campaigns',
    'nav.automation': 'Automation & Workflows',
    'nav.analytics': 'Intelligence Storytelling',
    'nav.settings': 'Settings & Team',
    'nav.admin': 'Jawebni Super Admin',
    'cmd.placeholder': 'Search conversations, AI knowledge, customers... (Ctrl + K)',
    'copilot.title': 'Jawebni In-App Copilot',
    'copilot.recommendation': 'Proactive AI Insights',
    'status.ai_active': 'AI Active 24/7',
    'status.whatsapp_connected': 'WhatsApp Cloud Connected',
    'btn.save': 'Save & Continue',
    'btn.go_live': 'Launch AI Employee 🚀',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode; initialLocale?: Locale }> = ({
  children,
  initialLocale = 'ar',
}) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return (localStorage.getItem('jawebni_locale') as Locale) || initialLocale;
  });

  const direction: Direction = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', locale);
    localStorage.setItem('jawebni_locale', locale);
  }, [locale, direction]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = (key: string, defaultText?: string): string => {
    return translations[locale]?.[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, direction, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
