import { Heart, ChevronDown } from "lucide-react";

interface WeddingEventHeroProps {
  coupleNames: string;
  heroMessage: string | null;
  weddingDate: string | null;
  coverImageUrl: string | null;
  heroOverlay: string;
}

export function WeddingEventHero({ coupleNames, heroMessage, weddingDate, coverImageUrl, heroOverlay }: WeddingEventHeroProps) {
  return (
    <section
      className="relative min-h-[70vh] flex items-center justify-center text-center px-4"
      style={{
        background: coverImageUrl
          ? `${heroOverlay}, url(${coverImageUrl}) center/cover no-repeat`
          : heroOverlay,
        backgroundAttachment: "fixed",
      }}
    >
      <div className="animate-fade-in-up">
        <Heart className="w-10 h-10 text-primary-foreground/80 mx-auto mb-4 animate-heartbeat" />
        <h1 className="text-4xl sm:text-6xl font-serif text-primary-foreground mb-4 drop-shadow-lg">
          {coupleNames}
        </h1>
        {heroMessage && (
          <p className="text-xl text-primary-foreground/90 mb-4">{heroMessage}</p>
        )}
        {weddingDate && (
          <p className="text-lg text-primary-foreground/80 font-medium">{weddingDate}</p>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-scroll-bounce">
        <ChevronDown className="w-7 h-7 text-primary-foreground/60" />
      </div>
    </section>
  );
}
