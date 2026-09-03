import { getRequestConfig } from 'next-intl/server';
import frTranslator from '@/translator/fr.json';
import enTranslator from '@/translator/en.json';

export default getRequestConfig(({ locale }) => {
  const resolvedLocale = locale || 'fr';
  const translator = locale === 'fr' ? frTranslator : enTranslator;

  return {
    locale: resolvedLocale,
    translator: translator,
    timeZone: 'America/Toronto',
  };
});