import weddingLogoKA from "@/assets/wedding-logo-ka.png";
import { WeddingOrnament } from "./WeddingOrnament";

interface WeddingEventFooterProps {
  coupleNames: string;
  weddingDate: string | null;
  themeColor: string;
}

export function WeddingEventFooter({ coupleNames, weddingDate, themeColor }: WeddingEventFooterProps) {
  return (
    <footer className="relative z-10 pb-10 pt-4">
      <WeddingOrnament color={themeColor} />
      <div className="text-center space-y-3">
        <img
          src={weddingLogoKA}
          alt="K & A"
          className="w-28 h-28 mx-auto object-contain opacity-60"
        />
        <p className="text-lg font-serif text-foreground/70">{coupleNames}</p>
        {weddingDate && (
          <p className="text-sm text-muted-foreground">{weddingDate}</p>
        )}
        <p className="text-xs text-muted-foreground/50 pt-2">Powered by weddingeasy</p>
      </div>
    </footer>
  );
}
