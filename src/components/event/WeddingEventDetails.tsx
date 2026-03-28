import { Clock, Shirt, MapPin, Sparkles } from "lucide-react";
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
  index: number;
}

function DetailCard({ icon, label, value, subtitle, themeColor, index }: DetailCardProps) {
  const cardRef = useScrollReveal();

  return (
    <div
      ref={cardRef}
      className="scroll-reveal group relative overflow-hidden rounded-3xl p-8 text-center transition-all duration-500 hover:-translate-y-1"
      style={{
        background: `linear-gradient(160deg, ${themeColor}08, ${themeColor}04)`,
        border: `1px solid ${themeColor}15`,
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Subtle corner decoration */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-[0.04] transition-opacity group-hover:opacity-[0.08]"
        style={{ backgroundColor: themeColor }}
      />

      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{
          background: `linear-gradient(135deg, ${themeColor}20, ${themeColor}10)`,
          color: themeColor,
        }}
      >
        {icon}
      </div>

      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 mb-2 font-light">{label}</p>
      <p className="font-serif text-xl text-foreground">{value}</p>
      {subtitle && (
        <p className="text-sm text-muted-foreground/70 mt-2 font-light">{subtitle}</p>
      )}
    </div>
  );
}

export function WeddingEventDetails({ ceremonyTime, partyTime, dressCode, receptionVenueName, sameVenue, themeColor }: WeddingEventDetailsProps) {
  const sectionRef = useScrollReveal();

  const cards: { icon: React.ReactNode; label: string; value: string; subtitle?: string }[] = [];

  if (ceremonyTime) {
    cards.push({
      icon: <Clock className="w-6 h-6" />,
      label: "Cerimónia",
      value: ceremonyTime,
    });
  }

  if (!sameVenue && partyTime) {
    cards.push({
      icon: <MapPin className="w-6 h-6" />,
      label: "Copo d'Água",
      value: partyTime,
      subtitle: receptionVenueName || undefined,
    });
  }

  if (dressCode) {
    cards.push({
      icon: <Shirt className="w-6 h-6" />,
      label: "Dress Code",
      value: dressCode,
    });
  }

  if (cards.length === 0) return null;

  return (
    <section className="py-20 px-4 scroll-reveal" ref={sectionRef}>
      <div className="text-center mb-12">
        <Sparkles className="w-5 h-5 mx-auto mb-3 text-muted-foreground/40" />
        <h2 className="text-3xl sm:text-4xl font-serif text-foreground">Detalhes</h2>
      </div>
      <div className={`max-w-3xl mx-auto grid gap-6 ${cards.length === 1 ? "grid-cols-1 max-w-sm" : cards.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl" : "grid-cols-1 sm:grid-cols-3"}`}>
        {cards.map((card, i) => (
          <DetailCard key={i} {...card} themeColor={themeColor} index={i} />
        ))}
      </div>
    </section>
  );
}
