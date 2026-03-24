import { Clock, Shirt, MapPin } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface WeddingEventDetailsProps {
  ceremonyTime: string | null;
  partyTime: string | null;
  dressCode: string | null;
  receptionVenueName: string | null;
  sameVenue: boolean;
  themeColor: string;
}

interface DetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  themeColor: string;
}

function DetailCard({ icon, label, value, subtitle, themeColor }: DetailCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground mb-3"
        style={{ backgroundColor: themeColor }}
      >
        {icon}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-foreground text-lg">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

export function WeddingEventDetails({ ceremonyTime, partyTime, dressCode, receptionVenueName, sameVenue, themeColor }: WeddingEventDetailsProps) {
  const sectionRef = useScrollReveal();

  const cards: React.ReactNode[] = [];

  if (ceremonyTime) {
    cards.push(
      <DetailCard
        key="ceremony"
        icon={<Clock className="w-5 h-5" />}
        label="Cerimónia"
        value={ceremonyTime}
        themeColor={themeColor}
      />
    );
  }

  if (!sameVenue && partyTime) {
    cards.push(
      <DetailCard
        key="party"
        icon={<MapPin className="w-5 h-5" />}
        label="Copo d'Água"
        value={partyTime}
        subtitle={receptionVenueName || undefined}
        themeColor={themeColor}
      />
    );
  }

  if (dressCode) {
    cards.push(
      <DetailCard
        key="dresscode"
        icon={<Shirt className="w-5 h-5" />}
        label="Dress Code"
        value={dressCode}
        themeColor={themeColor}
      />
    );
  }

  if (cards.length === 0) return null;

  return (
    <section className="py-12 px-4 scroll-reveal" ref={sectionRef}>
      <h2 className="text-2xl font-serif text-center text-foreground mb-8">Detalhes do Evento</h2>
      <div className={`max-w-2xl mx-auto grid gap-4 ${cards.length === 1 ? "grid-cols-1 max-w-sm" : cards.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
        {cards}
      </div>
    </section>
  );
}
