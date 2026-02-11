import { getCoverImagesByCategory } from "@/config/coverImages";
import { cn } from "@/lib/utils";
import { Check, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface CoverImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
}

export function CoverImageSelector({ value, onChange }: CoverImageSelectorProps) {
  const grouped = getCoverImagesByCategory();
  const isCustom = value && !Object.values(grouped).flat().some((img) => img.url === value);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, images]) => (
        <div key={category}>
          <p className="text-sm font-medium text-foreground mb-2">{category}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => onChange(img.url)}
                className={cn(
                  "relative rounded-lg overflow-hidden border-2 transition-all",
                  value === img.url
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={img.thumbnail}
                    alt={img.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </AspectRatio>
                {value === img.url && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <p className="text-[10px] text-center text-muted-foreground py-1 truncate px-1">
                  {img.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-2 border-t border-border">
        <Label className="flex items-center gap-2 mb-2">
          <Link2 className="w-4 h-4" /> URL personalizado
        </Label>
        <Input
          value={isCustom ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      </div>
    </div>
  );
}
