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
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Palette className="w-4 h-4" />
          {t(`choices.${category}`)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Predefined Palettes */}
        <div>
          <Label className="text-sm mb-2 block">{t('choices.selectPalette')}</Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {predefinedPalettes.map((palette) => (
              <button
                key={palette.name}
                onClick={() => handlePredefinedSelect(palette)}
                className={`relative p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                  isSelected(palette) && !useCustom
                    ? 'border-primary shadow-lg'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex gap-1 h-8">
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
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {t(`choices.colorOptions.${palette.name}`)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="pt-4 border-t border-border">
          <Label className="text-sm mb-3 block">{t('choices.customColors')}</Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`${category}-primary`} className="text-xs">
                  {t('choices.primaryColor')}
                </Label>
                <div className="flex gap-2 mt-1">
                  <input
                    id={`${category}-primary`}
                    type="color"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-border"
                  />
                  <input
                    type="text"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs rounded border border-input bg-background"
                    placeholder="#FFC0CB"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`${category}-secondary`} className="text-xs">
                  {t('choices.secondaryColor')}
                </Label>
                <div className="flex gap-2 mt-1">
                  <input
                    id={`${category}-secondary`}
                    type="color"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-border"
                  />
                  <input
                    type="text"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs rounded border border-input bg-background"
                    placeholder="#FFD700"
                  />
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setUseCustom(true);
                handleCustomApply();
              }}
              className="w-full btn-gradient"
            >
              {t('choices.save')}
            </Button>
          </div>
        </div>

        {/* Selected Preview */}
        {value && (
          <div className="p-3 rounded-lg bg-muted/50">
            <Label className="text-xs text-muted-foreground mb-2 block">
              {t('choices.selected')}
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 h-12 flex-1 rounded-lg overflow-hidden shadow-sm">
                <div
                  className="flex-1"
                  style={{ backgroundColor: value.primary }}
                />
                <div
                  className="flex-1"
                  style={{ backgroundColor: value.secondary }}
                />
              </div>
              <Badge variant="secondary" className="text-xs">
                {value.name === 'custom' 
                  ? t('choices.customColors')
                  : t(`choices.colorOptions.${value.name}`)}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
