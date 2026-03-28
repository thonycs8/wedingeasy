import { MapPin, ExternalLink } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface MapProps {
  venueName: string;
  venueAddress: string;
  lat?: number | null;
  lng?: number | null;
  label?: string;
}

export function WeddingEventMap({ venueName, venueAddress, lat, lng, label = "Localização" }: MapProps) {
  const sectionRef = useScrollReveal();
  const query = lat && lng
    ? `${lat},${lng}`
    : encodeURIComponent(`${venueName} ${venueAddress}`);

  const mapsUrl = lat && lng
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(`${venueName} ${venueAddress}`)}`;

  return (
    <section className="py-16 px-4 scroll-reveal" ref={sectionRef}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <MapPin className="w-5 h-5 mx-auto mb-3 text-muted-foreground/40" />
          <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-2">{label}</h2>
          <p className="text-foreground/70 font-medium">{venueName}</p>
          {venueAddress && (
            <p className="text-sm text-muted-foreground/70 mt-1 font-light">{venueAddress}</p>
          )}
        </div>

        <div className="rounded-3xl overflow-hidden shadow-2xl border border-border/50 relative group">
          <iframe
            title={`Localização - ${venueName}`}
            width="100%"
            height="380"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${query}&output=embed`}
          />
          {/* Open in maps button */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm text-sm font-medium text-foreground/80 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 opacity-0 group-hover:opacity-100"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir no Maps
          </a>
        </div>
      </div>
    </section>
  );
}
