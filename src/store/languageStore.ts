import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { Language } from '../i18n/strings';

function detectLanguage(): Language {
  try {
    const locale = getLocales()[0]?.languageCode ?? 'en';
    return locale === 'ko' ? 'ko' : 'en';
  } catch {
    return 'en';
  }
}

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: detectLanguage(),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
