import { getRequestConfig } from 'next-intl/server';
import frTranslator from '@/translator/fr.json';
import enTranslator from '@/translator/en.json';

export default getRequestConfig(({ locale }) => {
  const resolvedLocale = locale || 'fr';
  const messages = locale === 'fr' ? frTranslator : enTranslator;

  return {
    locale: resolvedLocale,
    messages: messages,
    timeZone: 'America/Toronto',
  };
});