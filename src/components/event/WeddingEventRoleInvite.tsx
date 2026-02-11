import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Crown, Star, Check, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RoleInviteProps {
  guestName: string;
  role: string;
  themeColor: string;
  eventCode: string;
}

const ROLE_CONFIG: Record<string, { icon: typeof Heart; label: string }> = {
  padrinho: { icon: Crown, label: "Padrinho" },
  madrinha: { icon: Crown, label: "Madrinha" },
  "dama de honor": { icon: Star, label: "Dama de Honor" },
  pajem: { icon: Star, label: "Pajem" },
  florista: { icon: Star, label: "Florista" },
  "portador das aliancas": { icon: Heart, label: "Portador das Alianças" },
  celebrante: { icon: Crown, label: "Celebrante" },
  "convidado de honra": { icon: Star, label: "Convidado de Honra" },
};

function formatName(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Celebration Animation ─────────────────────────────────────────

function CelebrationOverlay({ themeColor }: { themeColor: string }) {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; delay: number; duration: number; emoji: string }[]
  >([]);

  useEffect(() => {
    const emojis = ["💍", "❤️", "✨", "🎉", "💐", "🥂", "🤍", "💒"];
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: 16 + Math.random() * 20,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-celebration-fall"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

// ── Accepted State ────────────────────────────────────────────────

interface AcceptedViewProps {
  names: string[];
  roleLabels: string[];
  isCouple: boolean;
  themeColor: string;
}

function AcceptedView({ names, roleLabels, isCouple, themeColor }: AcceptedViewProps) {
  return (
    <div className="text-center py-10 px-4">
      <CelebrationOverlay themeColor={themeColor} />

      <div className="animate-scale-in">
        <div
          className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-primary-foreground mb-6 shadow-xl"
          style={{ backgroundColor: themeColor }}
        >
          <PartyPopper className="w-12 h-12" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-3 animate-fade-in">
          {isCouple ? "Convite Aceite!" : "Convite Aceite!"}
        </h2>

        <p className="text-lg text-muted-foreground mb-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {isCouple
            ? `${names.join(" & ")}, obrigado por aceitarem!`
            : `${names[0]}, obrigado por aceitar!`}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          {roleLabels.map((label, i) => (
            <Badge
              key={i}
              className="text-lg px-6 py-2 text-primary-foreground"
              style={{ backgroundColor: themeColor }}
            >
              <Check className="w-4 h-4 mr-1" />
              {label}
            </Badge>
          ))}
        </div>

        <p className="text-muted-foreground text-sm animate-fade-in" style={{ animationDelay: "0.6s" }}>
          A sua presença e função estão confirmadas. Estamos ansiosos!
        </p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export function WeddingEventRoleInvite({ guestName, role, themeColor, eventCode }: RoleInviteProps) {
  const names = guestName.split(",").map((n) => n.trim());
  const roles = role.split(",").map((r) => r.trim());
  const isCouple = names.length > 1;

  const displayNames = names.map(formatName);
  const roleLabels = roles.map((r) => {
    const config = ROLE_CONFIG[r.toLowerCase()];
    return config?.label || r.replace(/\b\w/g, (c) => c.toUpperCase());
  });

  const [status, setStatus] = useState<"pending" | "accepting" | "accepted" | "error">("pending");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAccept = useCallback(async () => {
    setStatus("accepting");
    setErrorMsg("");

    try {
      // Confirm each guest via public_rsvp
      for (const name of names) {
        const formattedName = formatName(name);
        const { data, error } = await supabase.rpc("public_rsvp", {
          _event_code: eventCode,
          _guest_name: formattedName,
          _confirmed: true,
        });

        if (error || !(data as any)?.success) {
          const errCode = (data as any)?.error;
          if (errCode === "guest_not_found") {
            setErrorMsg(`Nome "${formattedName}" não encontrado na lista.`);
            setStatus("error");
            return;
          }
          throw new Error(errCode || "rpc_error");
        }
      }

      setStatus("accepted");
    } catch {
      setErrorMsg("Ocorreu um erro ao aceitar o convite. Tente novamente.");
      setStatus("error");
    }
  }, [names, eventCode]);

  // ── Accepted view with celebration ──
  if (status === "accepted") {
    return (
      <AcceptedView
        names={displayNames}
        roleLabels={roleLabels}
        isCouple={isCouple}
        themeColor={themeColor}
      />
    );
  }

  // ── Invite view (pending / error) ──
  const Icon = isCouple
    ? Heart
    : (ROLE_CONFIG[role.toLowerCase()]?.icon || Heart);

  return (
    <div className="text-center py-10 px-4 animate-fade-in">
      <div
        className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-primary-foreground mb-4 shadow-lg"
        style={{ backgroundColor: themeColor }}
      >
        <Icon className="w-10 h-10" />
      </div>

      <p className="text-lg text-muted-foreground mb-1">
        {isCouple ? "Queridos" : "Querido(a)"}
      </p>

      <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-3">
        {displayNames.join(" & ")}
      </h2>

      <p className="text-muted-foreground mb-4">
        {isCouple ? "Vocês foram convidados para ser" : "Você foi convidado(a) para ser"}
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {roleLabels.map((label, i) => (
          <Badge
            key={i}
            className="text-lg px-6 py-2 text-primary-foreground"
            style={{ backgroundColor: themeColor }}
          >
            {label}
          </Badge>
        ))}
      </div>

      <p className="text-muted-foreground text-sm mb-8">neste casamento especial</p>

      {/* Accept button */}
      <Button
        size="lg"
        className="text-lg px-10 py-6 rounded-full text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105"
        style={{ backgroundColor: themeColor }}
        onClick={handleAccept}
        disabled={status === "accepting"}
      >
        {status === "accepting" ? (
          <>
            <Heart className="w-5 h-5 mr-2 animate-pulse" />
            A confirmar...
          </>
        ) : (
          <>
            <Heart className="w-5 h-5 mr-2" />
            Aceitar Convite
          </>
        )}
      </Button>

      {status === "error" && errorMsg && (
        <p className="text-destructive text-sm mt-4">{errorMsg}</p>
      )}
    </div>
  );
}
