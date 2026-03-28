import { useEffect, useState } from "react";
import { Heart, ChevronDown } from "lucide-react";

interface WeddingEventHeroProps {
  coupleNames: string;
  heroMessage: string | null;
  weddingDate: string | null;
  coverImageUrl: string | null;
  heroOverlay: string;
}

export function WeddingEventHero({ coupleNames, heroMessage, weddingDate, coverImageUrl, heroOverlay }: WeddingEventHeroProps) {
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.4;
  const opacity = Math.max(0, 1 - scrollY / 600);

  return (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Background with parallax */}
      <div
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{
          background: coverImageUrl
            ? `url(${coverImageUrl}) center/cover no-repeat`
            : heroOverlay,
          transform: `translateY(${parallaxOffset}px) scale(1.1)`,
          willChange: "transform",
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: coverImageUrl ? heroOverlay : "transparent" }}
      />

      {/* Animated gradient border at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />

      {/* Content */}
      <div
        className="relative z-20 px-6 max-w-3xl"
        style={{ opacity, transform: `translateY(${scrollY * 0.15}px)` }}
      >
        {/* Decorative line */}
        <div
          className={`mx-auto mb-6 transition-all duration-1000 ease-out ${loaded ? "w-16 opacity-100" : "w-0 opacity-0"}`}
        >
          <div className="h-px bg-white/40" />
        </div>

        {/* Heart icon with glow */}
        <div className={`transition-all duration-1000 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="relative inline-block mb-6">
            <Heart className="w-8 h-8 text-white/70 animate-heartbeat" />
            <div className="absolute inset-0 blur-xl bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Wedding date - small label above names */}
        {weddingDate && (
          <p className={`text-sm tracking-[0.3em] uppercase text-white/60 mb-4 font-light transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            {weddingDate}
          </p>
        )}

        {/* Couple names */}
        <h1 className={`text-5xl sm:text-7xl lg:text-8xl font-serif text-white mb-6 leading-[1.1] drop-shadow-2xl transition-all duration-1000 delay-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {coupleNames}
        </h1>

        {/* Hero message */}
        {heroMessage && (
          <p className={`text-lg sm:text-xl text-white/80 font-light max-w-lg mx-auto leading-relaxed transition-all duration-1000 delay-900 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            {heroMessage}
          </p>
        )}

        {/* Decorative line below */}
        <div
          className={`mx-auto mt-8 transition-all duration-1000 delay-[1100ms] ${loaded ? "w-24 opacity-100" : "w-0 opacity-0"}`}
        >
          <div className="h-px bg-white/30" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-scroll-bounce">
        <span className="text-[10px] tracking-[0.25em] uppercase text-white/40 font-light">Scroll</span>
        <ChevronDown className="w-5 h-5 text-white/40" />
      </div>
    </section>
  );
}
