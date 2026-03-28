import { useState, useCallback } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ChevronLeft, ChevronRight, X, Camera } from "lucide-react";

interface WeddingEventGalleryProps {
  urls: string[];
}

function Lightbox({ urls, index, onClose, onNav }: { urls: string[]; index: number; onClose: () => void; onNav: (i: number) => void }) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft" && index > 0) onNav(index - 1);
    if (e.key === "ArrowRight" && index < urls.length - 1) onNav(index + 1);
  }, [index, urls.length, onClose, onNav]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-lightbox-in backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-label="Galeria de fotos"
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white z-10 transition-colors" aria-label="Fechar">
        <X className="w-6 h-6" />
      </button>

      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNav(index - 1); }}
          className="absolute left-4 sm:left-8 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white z-10 transition-all"
          aria-label="Foto anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {index < urls.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNav(index + 1); }}
          className="absolute right-4 sm:right-8 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white z-10 transition-all"
          aria-label="Próxima foto"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <img
        src={urls[index]}
        alt={`Foto ${index + 1}`}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Bottom progress */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {urls.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onNav(i); }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? "bg-white w-6" : "bg-white/30 hover:bg-white/50"}`}
            aria-label={`Ir para foto ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function WeddingEventGallery({ urls }: WeddingEventGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sectionRef = useScrollReveal();

  if (!urls || urls.length === 0) return null;

  // Masonry-like layout with varying sizes
  const getGridClass = (index: number, total: number) => {
    if (total <= 3) return "aspect-[4/3]";
    if (index === 0) return "aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto";
    return "aspect-square";
  };

  return (
    <>
      <section className="py-20 px-4 scroll-reveal" ref={sectionRef}>
        <div className="text-center mb-12">
          <Camera className="w-5 h-5 mx-auto mb-3 text-muted-foreground/40" />
          <h2 className="text-3xl sm:text-4xl font-serif text-foreground">Galeria</h2>
        </div>

        <div className={`max-w-5xl mx-auto grid gap-2 sm:gap-3 ${urls.length <= 3 ? "grid-cols-1 sm:grid-cols-3 max-w-3xl" : "grid-cols-2 sm:grid-cols-3"}`}>
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className={`relative group overflow-hidden rounded-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring ${getGridClass(i, urls.length)}`}
              aria-label={`Ver foto ${i + 1}`}
            >
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/0 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300 scale-0 group-hover:scale-100">
                  <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          urls={urls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNav={setLightboxIndex}
        />
      )}
    </>
  );
}
