import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { WeddingEventCountdown } from "@/components/event/WeddingEventCountdown";
import { WeddingEventMap } from "@/components/event/WeddingEventMap";
import { WeddingEventRSVP } from "@/components/event/WeddingEventRSVP";
import { WeddingEventRoleInvite } from "@/components/event/WeddingEventRoleInvite";
import { WeddingEventVerse } from "@/components/event/WeddingEventVerse";
import { WeddingEventVideo } from "@/components/event/WeddingEventVideo";
import { WeddingEventGallery } from "@/components/event/WeddingEventGallery";
import { WeddingOrnament } from "@/components/event/WeddingOrnament";
import { WeddingEventHero } from "@/components/event/WeddingEventHero";
import { WeddingEventDetails } from "@/components/event/WeddingEventDetails";
import { WeddingEventFooter } from "@/components/event/WeddingEventFooter";
import { Heart } from "lucide-react";
import { getThemeById } from "@/config/weddingThemes";
import lavenderLeft from "@/assets/wedding-lavender-left.png";
import lavenderRight from "@/assets/wedding-lavender-right.png";
import { decodeInviteToken } from "@/utils/inviteToken";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function WeddingEvent() {
  const { eventCode } = useParams<{ eventCode: string }>();
  const [searchParams] = useSearchParams();

  const { role, guest, side } = useMemo(() => {
    const inviteToken = searchParams.get("invite");
    if (inviteToken) {
      const decoded = decodeInviteToken(inviteToken);
      if (decoded) return decoded;
    }
    return {
      role: searchParams.get("role"),
      guest: searchParams.get("guest"),
      side: undefined as string | undefined,
    };
  }, [searchParams]);

  const verseRef = useScrollReveal();
  const roleRef = useScrollReveal();
  const customMsgRef = useScrollReveal();
  const introRef = useScrollReveal();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["wedding-event", eventCode],
    queryFn: async () => {
      if (!eventCode) throw new Error("No event code");
      const { data: wedding, error: wErr } = await supabase
        .from("wedding_data")
        .select("id, couple_name, partner_name, wedding_date, event_code")
        .eq("event_code", eventCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      if (wErr || !wedding) throw new Error("Wedding not found");
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
        <div className="text-center">
          <div className="relative inline-block">
            <Heart className="w-10 h-10 text-primary animate-heartbeat" />
            <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse" />
          </div>
          <p className="text-muted-foreground/60 mt-6 text-sm tracking-wide font-light">A carregar...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-2xl font-serif text-foreground mb-3">Evento não encontrado</h1>
          <p className="text-muted-foreground/60 font-light">O link que utilizou é inválido ou o evento ainda não foi publicado.</p>
        </div>
      </div>
    );
  }

  const { wedding, landing } = data;
  const theme = getThemeById(landing.theme_preset);
  const themeColor = landing.theme_color || theme?.primaryColor || "#e11d48";
  const fontFamily = landing.font_family || theme?.fontFamily || undefined;
  const heroOverlay = theme?.heroOverlay || `linear-gradient(135deg, ${themeColor}cc, ${themeColor}99)`;
  const coupleNames = [wedding.partner_name, wedding.couple_name].filter(Boolean).join(" & ");
  const weddingDate = wedding.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const sameVenue = landing.same_venue ?? true;

  return (
    <>
      <Helmet>
        <title>{coupleNames} — Casamento</title>
        <meta property="og:title" content={`${coupleNames} — Casamento`} />
        <meta property="og:description" content={landing.hero_message || `Celebre connosco! ${weddingDate || ""}`} />
        {landing.cover_image_url && <meta property="og:image" content={landing.cover_image_url} />}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden" style={fontFamily ? { fontFamily } : undefined}>
        {/* Decorative lavender branches - subtle */}
        <img
          src={lavenderLeft}
          alt=""
          aria-hidden="true"
          className="hidden lg:block fixed left-0 top-[20%] w-36 xl:w-48 opacity-50 pointer-events-none select-none z-0"
        />
        <img
          src={lavenderRight}
          alt=""
          aria-hidden="true"
          className="hidden lg:block fixed right-0 top-[25%] w-36 xl:w-48 opacity-50 pointer-events-none select-none z-0"
        />

        {/* Hero */}
        <WeddingEventHero
          coupleNames={coupleNames}
          heroMessage={landing.hero_message}
          weddingDate={weddingDate}
          coverImageUrl={landing.cover_image_url}
          heroOverlay={heroOverlay}
        />

        {/* Content container */}
        <div className="relative z-10">
          {/* Intro Text */}
          {(landing as any).intro_text && (
            <div ref={introRef} className="scroll-reveal">
              <section className="py-16 px-4 text-center">
                <p className="max-w-xl mx-auto text-lg text-muted-foreground/70 leading-relaxed whitespace-pre-line font-light">
                  {(landing as any).intro_text}
                </p>
              </section>
            </div>
          )}

          {/* Verse */}
          {landing.show_verse && landing.verse_text && (
            <div ref={verseRef} className="scroll-reveal">
              <WeddingEventVerse text={landing.verse_text} themeColor={themeColor} />
              <WeddingOrnament color={themeColor} />
            </div>
          )}

          {/* Role invite */}
          {role && guest && (
            <div ref={roleRef} className="scroll-reveal">
              <WeddingEventRoleInvite guestName={guest} role={role} themeColor={themeColor} eventCode={eventCode} side={side} groomName={wedding.couple_name || ''} brideName={wedding.partner_name || ''} />
              <WeddingOrnament color={themeColor} />
            </div>
          )}

          {/* Countdown */}
          {landing.show_countdown && wedding.wedding_date && (
            <>
              <WeddingEventCountdown weddingDate={wedding.wedding_date} themeColor={themeColor} />
              <WeddingOrnament color={themeColor} />
            </>
          )}

          {/* Video */}
          {landing.show_video && landing.video_url && (
            <>
              <WeddingEventVideo videoUrl={landing.video_url} />
              <WeddingOrnament color={themeColor} />
            </>
          )}

          {/* Event Details */}
          {(landing.venue_name || landing.ceremony_time || landing.party_time || landing.dress_code) && (
            <>
              <WeddingEventDetails
                ceremonyTime={landing.ceremony_time}
                partyTime={landing.party_time}
                dressCode={landing.dress_code}
                receptionVenueName={landing.reception_venue_name}
                sameVenue={sameVenue}
                themeColor={themeColor}
              />
              <WeddingOrnament color={themeColor} />
            </>
          )}

          {/* Gallery */}
          {landing.show_gallery && landing.gallery_urls && landing.gallery_urls.length > 0 && (
            <>
              <WeddingEventGallery urls={landing.gallery_urls} />
              <WeddingOrnament color={themeColor} />
            </>
          )}

          {/* Map - Ceremony */}
          {landing.show_map && landing.venue_name && (
            <>
              <WeddingEventMap
                venueName={landing.venue_name}
                venueAddress={landing.venue_address || ""}
                lat={landing.venue_lat ? Number(landing.venue_lat) : null}
                lng={landing.venue_lng ? Number(landing.venue_lng) : null}
                label={!sameVenue ? "Local da Cerimónia" : "Localização"}
              />
            </>
          )}

          {/* Map - Reception */}
          {landing.show_map && !sameVenue && landing.reception_venue_name && (
            <WeddingEventMap
              venueName={landing.reception_venue_name}
              venueAddress={landing.reception_venue_address || ""}
              label="Local do Copo d'Água"
            />
          )}

          {/* Custom Message */}
          {landing.custom_message && (
            <div ref={customMsgRef} className="scroll-reveal">
              <WeddingOrnament color={themeColor} />
              <section className="py-16 px-4 text-center">
                <p className="max-w-lg mx-auto text-muted-foreground/70 italic text-lg leading-relaxed font-light">
                  "{landing.custom_message}"
                </p>
              </section>
            </div>
          )}

          {/* RSVP */}
          {landing.show_rsvp && eventCode && (
            <>
              <WeddingOrnament color={themeColor} />
              <WeddingEventRSVP eventCode={eventCode} themeColor={themeColor} initialGuestName={guest || undefined} />
            </>
          )}

          {/* Footer */}
          <WeddingEventFooter coupleNames={coupleNames} weddingDate={weddingDate} themeColor={themeColor} />
        </div>
      </div>
    </>
  );
}
