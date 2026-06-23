import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { I18nManager, useColorScheme } from 'react-native';
import { Language, translations } from '../constants/i18n';

interface UserProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  username: string;
  location: string;
}

interface Settings {
  darkMode: boolean;
  language: Language;
  showCurrency: boolean;
  showTransactionNumber: boolean;
  noNegativeStock: boolean;
  voiceMode: boolean;
  whatsappIntegration: boolean;
  dailyBackup: boolean;
  showDate: boolean;
  showBalance: boolean;
  shortFormat: boolean;
  printHeader: string;
  printFooter: string;
  pin: string;
  fingerprint: boolean;
  rememberSession: boolean;
}

interface Subscription {
  active: boolean;
  plan: 'trial' | 'semi_annual' | 'annual';
  startDate: string;
  endDate: string;
  daysLeft: number;
}

interface AppContextType {
  isAuthenticated: boolean;
  language: Language;
  t: typeof translations.ar;
  isRTL: boolean;
  settings: Settings;
  profile: UserProfile;
  subscription: Subscription;
  login: (pin: string) => boolean;
  logout: () => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  toggleLanguage: () => void;
  toggleDarkMode: () => void;
  isDark: boolean;
}

const defaultSettings: Settings = {
  darkMode: false,
  language: 'ar',
  showCurrency: true,
  showTransactionNumber: true,
  noNegativeStock: true,
  voiceMode: true,
  whatsappIntegration: false,
  dailyBackup: false,
  showDate: true,
  showBalance: true,
  shortFormat: false,
  printHeader: 'دفتر المحاسب الذكي',
  printFooter: 'م/ صدام بشير - 736002798',
  pin: '1234',
  fingerprint: false,
  rememberSession: false,
};

const defaultProfile: UserProfile = {
  name: '',
  address: '',
  phone: '736002798',
  email: '',
  username: 'owner',
  location: '',
};

const defaultSubscription: Subscription = {
  active: true,
  plan: 'trial',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  daysLeft: 90,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [subscription, setSubscription] = useState<Subscription>(defaultSubscription);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      const savedProfile = await AsyncStorage.getItem('profile');
      const savedSubscription = await AsyncStorage.getItem('subscription');
      const savedAuth = await AsyncStorage.getItem('isAuthenticated');

      if (savedSettings) setSettings(JSON.parse(savedSettings));
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedSubscription) {
        const sub = JSON.parse(savedSubscription) as Subscription;
        const end = new Date(sub.endDate);
        const now = new Date();
        const daysLeft = Math.max(0, Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        setSubscription({ ...sub, daysLeft, active: daysLeft > 0 });
      }
      if (savedAuth === 'true') {
        const parsedSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
        if (parsedSettings.rememberSession) {
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const login = useCallback((pin: string): boolean => {
    if (pin === settings.pin) {
      setIsAuthenticated(true);
      if (settings.rememberSession) {
        AsyncStorage.setItem('isAuthenticated', 'true');
      }
      return true;
    }
    return false;
  }, [settings.pin, settings.rememberSession]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    AsyncStorage.removeItem('isAuthenticated');
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await AsyncStorage.setItem('settings', JSON.stringify(updated));
  }, [settings]);

  const updateProfile = useCallback(async (newProfile: Partial<UserProfile>) => {
    const updated = { ...profile, ...newProfile };
    setProfile(updated);
    await AsyncStorage.setItem('profile', JSON.stringify(updated));
  }, [profile]);

  const toggleLanguage = useCallback(() => {
    const newLang: Language = settings.language === 'ar' ? 'en' : 'ar';
    updateSettings({ language: newLang });
  }, [settings.language, updateSettings]);

  const toggleDarkMode = useCallback(() => {
    updateSettings({ darkMode: !settings.darkMode });
  }, [settings.darkMode, updateSettings]);

  const isDark = settings.darkMode || systemColorScheme === 'dark';
  const language = settings.language;
  const t = translations[language];
  const isRTL = language === 'ar';

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      language,
      t,
      isRTL,
      settings,
      profile,
      subscription,
      login,
      logout,
      updateSettings,
      updateProfile,
      toggleLanguage,
      toggleDarkMode,
      isDark,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
