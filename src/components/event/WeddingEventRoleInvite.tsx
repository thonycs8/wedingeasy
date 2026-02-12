import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Crown, Star, Check, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WeddingEventRoleGuide } from "./WeddingEventRoleGuide";

interface RoleInviteProps {
  guestName: string;
  role: string;
  themeColor: string;
  eventCode: string;
  side?: string;
  groomName?: string;
  brideName?: string;
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

// ── Smart Role Label Deduplication ────────────────────────────────

const PLURAL_MAP: Record<string, string> = {
  "Celebrante": "Celebrantes",
  "Padrinho": "Padrinhos",
  "Madrinha": "Madrinhas",
  "Dama de Honor": "Damas de Honor",
  "Pajem": "Pajens",
  "Florista": "Floristas",
  "Portador das Alianças": "Portadores das Alianças",
  "Convidado de Honra": "Convidados de Honra",
};

const GENDERED_PAIRS: [string, string][] = [
  ["Padrinho", "Madrinha"],
  ["Dama de Honor", "Pajem"],
];

function smartRoleLabels(roleLabels: string[], isCouple: boolean): string[] {
  if (!isCouple || roleLabels.length <= 1) return roleLabels;

  // All same → plural
  if (roleLabels.every((r) => r === roleLabels[0])) {
    return [PLURAL_MAP[roleLabels[0]] || roleLabels[0]];
  }

  // Known gendered pair → "X & Y"
  if (roleLabels.length === 2) {
    for (const [a, b] of GENDERED_PAIRS) {
      const set = new Set(roleLabels);
      if (set.has(a) && set.has(b)) {
        return [`${a} & ${b}`];
      }
    }
  }

  // Different roles → keep separate
  return roleLabels;
}

function formatName(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Family Role Detection ─────────────────────────────────────────

const FAMILY_ROLE_KEYS = [
  "pai do noivo", "mae do noivo", "pai da noiva", "mae da noiva",
  "irmao(a)", "irmao", "irma",
];

function isFamilyRole(roleKey: string): boolean {
  return FAMILY_ROLE_KEYS.some((f) => roleKey.toLowerCase().includes(f));
}

function getFamilyMessage(
  roleKeys: string[],
  displayNames: string[],
  isCouple: boolean,
  side?: string,
  groomName?: string,
  brideName?: string,
): { greeting: string; message: string } {
  const firstRole = roleKeys[0]?.toLowerCase() || "";
  const namesStr = isCouple ? displayNames.join(" & ") : displayNames[0];

  // Parents
  if (firstRole.includes("pai da noiva") || firstRole.includes("mae da noiva")) {
    const brideFirst = brideName || "a noiva";
    return {
      greeting: isCouple ? `Queridos ${namesStr}` : `Querido(a) ${namesStr}`,
      message: `Como ${getRoleFamilyLabel(firstRole)}, ${brideFirst} gostaria que ${isCouple ? "entrassem" : "entrasse"} com ela neste dia tão especial.`,
    };
  }

  if (firstRole.includes("pai do noivo") || firstRole.includes("mae do noivo")) {
    const groomFirst = groomName || "o noivo";
    return {
      greeting: isCouple ? `Queridos ${namesStr}` : `Querido(a) ${namesStr}`,
      message: `Como ${getRoleFamilyLabel(firstRole)}, ${groomFirst} gostaria que ${isCouple ? "entrassem" : "entrasse"} com ele neste dia tão especial.`,
    };
  }

  // Siblings
  if (firstRole.includes("irmao") || firstRole.includes("irma")) {
    const sideLabel = side === "noiva" ? "da Noiva" : side === "noivo" ? "do Noivo" : "";
    return {
      greeting: isCouple ? `Queridos ${namesStr}` : `Querido(a) ${namesStr}`,
      message: `Como ${isCouple ? "irmãos" : "irmão(ã)"} ${sideLabel}, gostaríamos que ${isCouple ? "fizessem" : "fizesse"} parte da entrada especial do nosso casamento.`,
    };
  }

  // Generic family fallback
  return {
    greeting: isCouple ? `Queridos ${namesStr}` : `Querido(a) ${namesStr}`,
    message: `Como nossos familiares queridos, gostaríamos de vos honrar com uma entrada especial no nosso casamento.`,
  };
}

function getRoleFamilyLabel(roleKey: string): string {
  const map: Record<string, string> = {
    "pai do noivo": "Pai do Noivo",
    "mae do noivo": "Mãe do Noivo",
    "pai da noiva": "Pai da Noiva",
    "mae da noiva": "Mãe da Noiva",
  };
  return map[roleKey] || roleKey.replace(/\b\w/g, (c) => c.toUpperCase());
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
  isFamily?: boolean;
}

function AcceptedView({ names, roleLabels, isCouple, themeColor, isFamily }: AcceptedViewProps) {
  const displayLabels = smartRoleLabels(roleLabels, isCouple);

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
          Convite Aceite!
        </h2>

        <p className="text-lg text-muted-foreground mb-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {isCouple
            ? `${names.join(" & ")}, obrigado por aceitarem!`
            : `${names[0]}, obrigado por aceitar!`}
        </p>

        {!isFamily && (
          <div className="flex flex-wrap justify-center gap-2 mb-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {displayLabels.map((label, i) => (
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
        )}

        <p className="text-muted-foreground text-sm mb-8 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          {isFamily
            ? "A sua presença está confirmada. Estamos ansiosos por partilhar este momento convosco!"
            : "A sua presença e função estão confirmadas. Estamos ansiosos!"}
        </p>

        {/* Role guide appears after accepting (only for non-family roles) */}
        {!isFamily && (
          <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <WeddingEventRoleGuide role={roleLabels[0]} themeColor={themeColor} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export function WeddingEventRoleInvite({ guestName, role, themeColor, eventCode, side, groomName, brideName }: RoleInviteProps) {
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

  const isFamily = roles.some((r) => isFamilyRole(r));

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
        isFamily={isFamily}
      />
    );
  }

  // ── Family invite view (pending / error) ──
  if (isFamily) {
    const familyMsg = getFamilyMessage(roles, displayNames, isCouple, side, groomName, brideName);

    return (
      <div className="text-center py-10 px-4 animate-fade-in">
        <div
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-primary-foreground mb-4 shadow-lg"
          style={{ backgroundColor: themeColor }}
        >
          <Heart className="w-10 h-10" />
        </div>

        <p className="text-lg text-muted-foreground mb-1">{familyMsg.greeting}</p>

        <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
          {displayNames.join(" & ")}
        </h2>

        <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
          {familyMsg.message}
        </p>

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

  // ── Standard role invite view (pending / error) ──
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
        {smartRoleLabels(roleLabels, isCouple).map((label, i) => (
          <Badge
            key={i}
            className="text-lg px-6 py-2 text-primary-foreground"
            style={{ backgroundColor: themeColor }}
          >
            {label}
          </Badge>
        ))}
      </div>

      <p className="text-muted-foreground text-sm mb-6">neste casamento especial</p>

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

