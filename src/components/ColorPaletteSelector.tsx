import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Palette } from "lucide-react";

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

export const ColorPaletteSelector = ({ category, value, onChange }: ColorPaletteSelectorProps) => {
  const { t } = useTranslation();
  const [customPrimary, setCustomPrimary] = useState(value?.primary || '#FFC0CB');
  const [customSecondary, setCustomSecondary] = useState(value?.secondary || '#FFD700');

  const handleCustomApply = () => {
    onChange({
      name: 'custom',
      primary: customPrimary,
      secondary: customSecondary
    });
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
        {/* Custom Colors */}
        <div>
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
              onClick={handleCustomApply}
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
                {t('choices.customColors')}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
