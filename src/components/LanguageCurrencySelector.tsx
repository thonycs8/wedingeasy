import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Globe, DollarSign } from 'lucide-react';
import { Currency } from '@/i18n';
import { useSettings } from '@/contexts/SettingsContext';

export const LanguageCurrencySelector = () => {
  const { t, i18n } = useTranslation();
  const { currency, setCurrency } = useSettings();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currencies: { value: Currency; label: string }[] = [
    { value: 'EUR', label: t('currency.eur') },
    { value: 'USD', label: t('currency.usd') },
    { value: 'BRL', label: t('currency.brl') },
  ];

  const languages = [
    { value: 'pt', label: t('language.pt') },
    { value: 'en', label: t('language.en') },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">{t('settings.language')} & {t('settings.currency')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          {t('settings.language')}
        </DropdownMenuLabel>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => changeLanguage(lang.value)}
            className={`cursor-pointer ${i18n.language === lang.value ? 'bg-primary/10' : ''}`}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          {t('settings.currency')}
        </DropdownMenuLabel>
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.value}
            onClick={() => setCurrency(curr.value)}
            className={`cursor-pointer ${currency === curr.value ? 'bg-primary/10' : ''}`}
          >
            {curr.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};