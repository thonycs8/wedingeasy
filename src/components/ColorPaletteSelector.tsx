import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Palette, Check } from "lucide-react";

interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
}

interface ColorPaletteSelectorProps {
  category: 'decoration' | 'groomsmen' | 'bridesmaids';
  value?: ColorPalette;
  onChange: (palette: ColorPalette) => void;
}

const predefinedPalettes: ColorPalette[] = [
  { name: 'blushGold', primary: '#FFC0CB', secondary: '#FFD700' },
  { name: 'navyWhite', primary: '#000080', secondary: '#FFFFFF' },
  { name: 'sageCream', primary: '#9DC183', secondary: '#FFFDD0' },
  { name: 'burgundyIvory', primary: '#800020', secondary: '#FFFFF0' },
  { name: 'lavenderSilver', primary: '#E6E6FA', secondary: '#C0C0C0' },
  { name: 'peachCoral', primary: '#FFDAB9', secondary: '#FF7F50' },
  { name: 'emeraldGold', primary: '#50C878', secondary: '#FFD700' },
  { name: 'dustyRoseMauve', primary: '#DCAE96', secondary: '#E0B0FF' },
  { name: 'terracottaCream', primary: '#E2725B', secondary: '#FFFDD0' },
  { name: 'navyGold', primary: '#000080', secondary: '#FFD700' },
  { name: 'blushIvory', primary: '#FFC0CB', secondary: '#FFFFF0' },
  { name: 'sageEucalyptus', primary: '#9DC183', secondary: '#44A08D' },
  { name: 'lilacWhite', primary: '#C8A2C8', secondary: '#FFFFFF' }
];

export const ColorPaletteSelector = ({ category, value, onChange }: ColorPaletteSelectorProps) => {
  const { t } = useTranslation();
  const [customPrimary, setCustomPrimary] = useState(value?.primary || '#FFC0CB');
  const [customSecondary, setCustomSecondary] = useState(value?.secondary || '#FFD700');
  const [useCustom, setUseCustom] = useState(false);

  const handlePredefinedSelect = (palette: ColorPalette) => {
    setUseCustom(false);
    onChange(palette);
  };

  const handleCustomApply = () => {
    onChange({
      name: 'custom',
      primary: customPrimary,
      secondary: customSecondary
    });
  };

  const isSelected = (palette: ColorPalette) => {
    return value?.primary === palette.primary && value?.secondary === palette.secondary;
  };

  return (
    <div className="space-y-2">
      {/* Category Label */}
      <div className="flex items-center gap-1.5 text-xs font-medium">
        <Palette className="w-3 h-3 text-primary" />
        {t(`choices.${category}`)}
      </div>

      {/* Predefined Palettes - Mobile First Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1">
        {predefinedPalettes.map((palette) => (
          <button
            key={palette.name}
            onClick={() => handlePredefinedSelect(palette)}
            className={`relative rounded border transition-all hover:scale-110 ${
              isSelected(palette) && !useCustom
                ? 'border-primary border-2'
                : 'border-border hover:border-primary/50'
            }`}
            title={t(`choices.colorOptions.${palette.name}`)}
          >
            <div className="flex h-6">
              <div
                className="flex-1 rounded-l"
                style={{ backgroundColor: palette.primary }}
              />
              <div
                className="flex-1 rounded-r"
                style={{ backgroundColor: palette.secondary }}
              />
            </div>
            {isSelected(palette) && !useCustom && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Custom Colors - Compact */}
      <div className="flex items-center gap-1.5 pt-1.5 border-t border-border">
        <input
          type="color"
          value={customPrimary}
          onChange={(e) => setCustomPrimary(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-border"
          title={t('choices.primaryColor')}
        />
        <input
          type="color"
          value={customSecondary}
          onChange={(e) => setCustomSecondary(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-border"
          title={t('choices.secondaryColor')}
        />
        <Button
          size="sm"
          onClick={() => {
            setUseCustom(true);
            handleCustomApply();
          }}
          variant="outline"
          className="flex-1 h-7 text-xs px-2"
        >
          {t('choices.customColors')}
        </Button>
      </div>

      {/* Selected Preview - Compact */}
      {value && (
        <div className="flex items-center gap-1.5 p-1.5 rounded bg-muted/30">
          <div className="flex h-6 w-12 rounded overflow-hidden shadow-sm shrink-0">
            <div className="flex-1" style={{ backgroundColor: value.primary }} />
            <div className="flex-1" style={{ backgroundColor: value.secondary }} />
          </div>
          <span className="text-xs text-muted-foreground truncate">
            {value.name === 'custom' 
              ? t('choices.customColors')
              : t(`choices.colorOptions.${value.name}`)}
          </span>
        </div>
      )}
    </div>
  );
};
