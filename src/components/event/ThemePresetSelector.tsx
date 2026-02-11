import { WEDDING_THEMES, type WeddingTheme } from "@/config/weddingThemes";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ThemePresetSelectorProps {
  selected: string | null;
  onSelect: (themeId: string | null) => void;
}

export function ThemePresetSelector({ selected, onSelect }: ThemePresetSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {WEDDING_THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onSelect(selected === theme.id ? null : theme.id)}
          className={cn(
            "relative rounded-xl p-4 text-left border-2 transition-all",
            selected === theme.id
              ? "border-primary ring-2 ring-primary/20"
              : "border-border hover:border-muted-foreground/30"
          )}
        >
          {selected === theme.id && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full border border-border"
              style={{ backgroundColor: theme.primaryColor }}
            />
            <div
              className="w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: theme.secondaryColor }}
            />
          </div>
          <p className="text-sm font-medium text-foreground">{theme.label}</p>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: theme.fontFamily }}>
            Aa Bb Cc
          </p>
        </button>
      ))}
    </div>
  );
}
