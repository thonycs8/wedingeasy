import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ptTranslations } from './locales/pt';
import { enTranslations } from './locales/en';

export type Currency = 'EUR' | 'USD' | 'BRL';

export const currencyFormats: Record<Currency, { symbol: string; locale: string; code: string }> = {
  EUR: { symbol: '€', locale: 'pt-PT', code: 'EUR' },
  USD: { symbol: '$', locale: 'en-US', code: 'USD' },
  BRL: { symbol: 'R$', locale: 'pt-BR', code: 'BRL' },
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const format = currencyFormats[currency];
  return new Intl.NumberFormat(format.locale, {
    style: 'currency',
    currency: format.code,
  }).format(amount);
};

const resources = {
  pt: ptTranslations,
  en: enTranslations,
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt', // Default language (Portuguese for Portugal)
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;