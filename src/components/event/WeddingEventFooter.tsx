import weddingLogoKA from "@/assets/wedding-logo-ka.png";

interface WeddingEventFooterProps {
  coupleNames: string;
  weddingDate: string | null;
  themeColor: string;
}

export function WeddingEventFooter({ coupleNames, weddingDate, themeColor }: WeddingEventFooterProps) {
  return (
    <footer className="relative z-10 py-16">
      {/* Top fade line */}
      <div className="max-w-xs mx-auto mb-12">
        <div className="h-px" style={{ background: `linear-gradient(to right, transparent, ${themeColor}20, transparent)` }} />
      </div>

      <div className="text-center space-y-4">
        <img
          src={weddingLogoKA}
          alt="K & A"
          className="w-20 h-20 mx-auto object-contain opacity-40 hover:opacity-60 transition-opacity"
        />
        <p className="text-xl font-serif text-foreground/50 tracking-wide">{coupleNames}</p>
        {weddingDate && (
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground/40 font-light">{weddingDate}</p>
        )}
        <div className="pt-8">
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/30 font-light">
            Powered by weddingeasy
          </p>
        </div>
      </div>
    </footer>
  );
}
