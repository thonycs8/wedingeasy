import { useState, useCallback } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-lightbox-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-label="Galeria de fotos"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-10" aria-label="Fechar">
        <X className="w-8 h-8" />
      </button>

      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNav(index - 1); }}
          className="absolute left-4 text-white/80 hover:text-white z-10"
          aria-label="Foto anterior"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}

      {index < urls.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNav(index + 1); }}
          className="absolute right-4 text-white/80 hover:text-white z-10"
          aria-label="Próxima foto"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}

      <img
        src={urls[index]}
        alt={`Foto ${index + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      <div className="absolute bottom-4 text-white/60 text-sm">
        {index + 1} / {urls.length}
      </div>
    </div>
  );
}

export function WeddingEventGallery({ urls }: WeddingEventGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sectionRef = useScrollReveal();

  if (!urls || urls.length === 0) return null;

  return (
    <>
      <section className="py-12 px-4 scroll-reveal" ref={sectionRef}>
        <h2 className="text-2xl font-serif text-center text-foreground mb-6">Galeria</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="rounded-xl overflow-hidden border border-border shadow-sm aspect-square cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={`Ver foto ${i + 1}`}
            >
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
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
