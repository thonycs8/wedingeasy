interface MapProps {
  venueName: string;
  venueAddress: string;
  lat?: number | null;
  lng?: number | null;
}

export function WeddingEventMap({ venueName, venueAddress, lat, lng }: MapProps) {
  const query = lat && lng
    ? `${lat},${lng}`
    : encodeURIComponent(`${venueName} ${venueAddress}`);

  return (
    <section className="py-12 px-4">
      <h2 className="text-2xl font-serif text-center text-foreground mb-4">Localização</h2>
      <p className="text-center text-muted-foreground mb-2 font-medium">{venueName}</p>
      <p className="text-center text-muted-foreground mb-6 text-sm">{venueAddress}</p>
      <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-lg border border-border">
        <iframe
          title="Localização do evento"
          width="100%"
          height="350"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${query}&output=embed`}
        />
      </div>
    </section>
  );
}
