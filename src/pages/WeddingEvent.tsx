import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WeddingEventCountdown } from "@/components/event/WeddingEventCountdown";
import { WeddingEventMap } from "@/components/event/WeddingEventMap";
import { WeddingEventRSVP } from "@/components/event/WeddingEventRSVP";
import { WeddingEventRoleInvite } from "@/components/event/WeddingEventRoleInvite";
import { Heart, Clock, Shirt } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function WeddingEvent() {
  const { eventCode } = useParams<{ eventCode: string }>();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  const guest = searchParams.get("guest");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["wedding-event", eventCode],
    queryFn: async () => {
      if (!eventCode) throw new Error("No event code");

      // Get wedding data
      const { data: wedding, error: wErr } = await supabase
        .from("wedding_data")
        .select("id, couple_name, partner_name, wedding_date, event_code")
        .eq("event_code", eventCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (wErr || !wedding) throw new Error("Wedding not found");

      // Get landing page config
      const { data: landing, error: lErr } = await supabase
        .from("wedding_landing_pages")
        .select("*")
        .eq("wedding_id", wedding.id)
        .eq("is_published", true)
        .maybeSingle();

      if (lErr || !landing) throw new Error("Landing page not found");

      return { wedding, landing };
    },
    staleTime: 1000 * 60 * 30,
    enabled: !!eventCode,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4 animate-float" />
          <p className="text-muted-foreground">A carregar o evento...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-foreground mb-2">Evento não encontrado</h1>
          <p className="text-muted-foreground">
            O link que utilizou é inválido ou o evento ainda não foi publicado.
          </p>
        </div>
      </div>
    );
  }

  const { wedding, landing } = data;
  const themeColor = landing.theme_color || "#e11d48";
  const coupleNames = [wedding.partner_name, wedding.couple_name]
    .filter(Boolean)
    .join(" & ");

  const weddingDate = wedding.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center text-center px-4"
        style={{
          background: landing.cover_image_url
            ? `linear-gradient(to bottom, ${themeColor}cc, ${themeColor}99), url(${landing.cover_image_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${themeColor}, ${themeColor}aa)`,
        }}
      >
        <div className="animate-fade-in-up">
          <Heart className="w-10 h-10 text-primary-foreground/80 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-6xl font-serif text-primary-foreground mb-4 drop-shadow-lg">
            {coupleNames}
          </h1>
          {landing.hero_message && (
            <p className="text-xl text-primary-foreground/90 mb-4">{landing.hero_message}</p>
          )}
          {weddingDate && (
            <p className="text-lg text-primary-foreground/80 font-medium">{weddingDate}</p>
          )}
        </div>
      </section>

      {/* Role-specific invite */}
      {role && guest && (
        <>
          <WeddingEventRoleInvite guestName={guest} role={role} themeColor={themeColor} eventCode={eventCode} />
          <Separator className="max-w-xs mx-auto" />
        </>
      )}

      {/* Countdown */}
      {landing.show_countdown && wedding.wedding_date && (
        <>
          <WeddingEventCountdown weddingDate={wedding.wedding_date} themeColor={themeColor} />
          <Separator className="max-w-xs mx-auto" />
        </>
      )}

      {/* Event Details */}
      {(landing.venue_name || landing.ceremony_time || landing.party_time || landing.dress_code) && (
        <section className="py-12 px-4">
          <h2 className="text-2xl font-serif text-center text-foreground mb-8">Detalhes do Evento</h2>
          <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            {landing.ceremony_time && (
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Cerimónia</p>
                  <p className="font-medium text-foreground">{landing.ceremony_time}</p>
                </div>
              </div>
            )}
            {landing.party_time && (
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Festa</p>
                  <p className="font-medium text-foreground">{landing.party_time}</p>
                </div>
              </div>
            )}
            {landing.dress_code && (
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <Shirt className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Dress Code</p>
                  <p className="font-medium text-foreground">{landing.dress_code}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Map */}
      {landing.show_map && landing.venue_name && (
        <>
          <Separator className="max-w-xs mx-auto" />
          <WeddingEventMap
            venueName={landing.venue_name}
            venueAddress={landing.venue_address || ""}
            lat={landing.venue_lat ? Number(landing.venue_lat) : null}
            lng={landing.venue_lng ? Number(landing.venue_lng) : null}
          />
        </>
      )}

      {/* Custom Message */}
      {landing.custom_message && (
        <>
          <Separator className="max-w-xs mx-auto" />
          <section className="py-12 px-4 text-center">
            <p className="max-w-lg mx-auto text-muted-foreground italic text-lg leading-relaxed">
              "{landing.custom_message}"
            </p>
          </section>
        </>
      )}

      {/* RSVP */}
      {landing.show_rsvp && eventCode && (
        <>
          <Separator className="max-w-xs mx-auto" />
          <WeddingEventRSVP
            eventCode={eventCode}
            themeColor={themeColor}
            initialGuestName={guest || undefined}
          />
        </>
      )}

      {/* Footer */}
      <footer className="py-8 text-center">
        <Heart className="w-5 h-5 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground/50">Powered by weddingeasy</p>
      </footer>
    </div>
  );
}
