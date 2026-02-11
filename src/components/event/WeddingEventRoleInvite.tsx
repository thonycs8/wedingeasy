import { Badge } from "@/components/ui/badge";
import { Heart, Crown, Star } from "lucide-react";

interface RoleInviteProps {
  guestName: string;
  role: string;
  themeColor: string;
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

export function WeddingEventRoleInvite({ guestName, role, themeColor }: RoleInviteProps) {
  // Support comma-separated names/roles for couples
  const names = guestName.split(",").map((n) => n.trim());
  const roles = role.split(",").map((r) => r.trim());
  const isCouple = names.length > 1;

  if (isCouple) {
    const displayNames = names.map(formatName);
    const roleLabels = roles.map((r) => {
      const config = ROLE_CONFIG[r.toLowerCase()];
      return config?.label || r.replace(/\b\w/g, (c) => c.toUpperCase());
    });

    return (
      <div className="text-center py-10 px-4 animate-fade-in-up">
        <div
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-primary-foreground mb-4 shadow-lg"
          style={{ backgroundColor: themeColor }}
        >
          <Heart className="w-10 h-10" />
        </div>
        <p className="text-lg text-muted-foreground mb-1">Queridos</p>
        <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-3">
          {displayNames.join(" & ")}
        </h2>
        <p className="text-muted-foreground mb-4">
          Vocês foram convidados para ser
        </p>
        <div className="flex flex-wrap justify-center gap-2">
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
        <p className="mt-4 text-muted-foreground text-sm">neste casamento especial</p>
      </div>
    );
  }

  // Single person (original logic)
  const config = ROLE_CONFIG[role.toLowerCase()] || { icon: Heart, label: role };
  const Icon = config.icon;
  const displayName = formatName(guestName);

  return (
    <div className="text-center py-10 px-4 animate-fade-in-up">
      <div
        className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-primary-foreground mb-4 shadow-lg"
        style={{ backgroundColor: themeColor }}
      >
        <Icon className="w-10 h-10" />
      </div>
      <p className="text-lg text-muted-foreground mb-1">Querido(a)</p>
      <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-3">{displayName}</h2>
      <p className="text-muted-foreground mb-4">
        Você foi convidado(a) para ser
      </p>
      <Badge
        className="text-lg px-6 py-2 text-primary-foreground"
        style={{ backgroundColor: themeColor }}
      >
        {config.label}
      </Badge>
      <p className="mt-4 text-muted-foreground text-sm">neste casamento especial</p>
    </div>
  );
}
