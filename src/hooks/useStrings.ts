import { strings } from '../i18n/strings';
import { useLanguageStore } from '../store/languageStore';

export function useStrings() {
  const { language } = useLanguageStore();
  return strings[language];
}
