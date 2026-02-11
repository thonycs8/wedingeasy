interface WeddingEventGalleryProps {
  urls: string[];
}

export function WeddingEventGallery({ urls }: WeddingEventGalleryProps) {
  if (!urls || urls.length === 0) return null;

  return (
    <section className="py-12 px-4">
      <h2 className="text-2xl font-serif text-center text-foreground mb-6">Galeria</h2>
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
        {urls.map((url, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-border shadow-sm aspect-square">
            <img
              src={url}
              alt={`Foto ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
