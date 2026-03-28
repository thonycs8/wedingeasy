import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Heart, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface RSVPProps {
  eventCode: string;
  themeColor: string;
  initialGuestName?: string;
}

function CelebrationHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <Heart
          key={i}
          className="absolute text-pink-400/40"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: "-5%",
            width: `${14 + Math.random() * 22}px`,
            animation: `confetti-fall ${2.5 + Math.random() * 2.5}s ease-in ${Math.random() * 2}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

export function WeddingEventRSVP({ eventCode, themeColor, initialGuestName }: RSVPProps) {
  const [guestName, setGuestName] = useState(initialGuestName?.replace(/-/g, " ") || "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const sectionRef = useScrollReveal();

  const handleRSVP = async (willAttend: boolean) => {
    if (!guestName.trim()) {
      setErrorMsg("Por favor insira o seu nome.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    const { data, error } = await supabase.rpc("public_rsvp", {
      _event_code: eventCode,
      _guest_name: guestName.trim(),
      _confirmed: willAttend,
    });

    if (error || !(data as any)?.success) {
      setStatus("error");
      const errCode = (data as any)?.error;
      if (errCode === "guest_not_found") {
        setErrorMsg("Nome não encontrado na lista de convidados. Verifique a ortografia.");
      } else if (errCode === "rsvp_disabled") {
        setErrorMsg("As confirmações estão desativadas neste momento.");
      } else {
        setErrorMsg("Ocorreu um erro. Tente novamente.");
      }
      return;
    }

    setStatus("success");
    setConfirmed(willAttend);
    if (willAttend) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    }
  };

  if (status === "success") {
    return (
      <>
        {showCelebration && <CelebrationHearts />}
        <section className="py-20 px-4">
          <div className="max-w-md mx-auto text-center animate-scale-in">
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                color: "white",
              }}
            >
              {confirmed ? <Heart className="w-10 h-10" /> : <X className="w-10 h-10" />}
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-foreground mb-3">
              {confirmed ? "Presença Confirmada!" : "Resposta Registada"}
            </h3>
            <p className="text-muted-foreground font-light leading-relaxed">
              {confirmed
                ? `Obrigado, ${guestName}! Estamos ansiosos por celebrar consigo.`
                : `Obrigado por nos informar, ${guestName}. Sentiremos a sua falta!`}
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <section className="py-20 px-4 scroll-reveal" ref={sectionRef}>
      <div className="max-w-md mx-auto text-center">
        <Mail className="w-5 h-5 mx-auto mb-3 text-muted-foreground/40" />
        <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-2">Confirme a sua Presença</h2>
        <p className="text-muted-foreground/70 mb-10 text-sm font-light">
          Insira o seu primeiro e último nome
        </p>

        <div
          className="rounded-3xl p-8 space-y-5"
          style={{
            background: `linear-gradient(160deg, ${themeColor}06, ${themeColor}03)`,
            border: `1px solid ${themeColor}12`,
          }}
        >
          <Input
            placeholder="Primeiro e último nome"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            disabled={status === "loading"}
            className="text-center capitalize h-12 rounded-2xl border-border/50 bg-background/50 backdrop-blur-sm text-base"
          />
          {errorMsg && <p className="text-destructive text-sm">{errorMsg}</p>}
          <div className="flex gap-3">
            <Button
              className="flex-1 h-12 rounded-2xl text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
                color: "white",
              }}
              onClick={() => handleRSVP(true)}
              disabled={status === "loading"}
            >
              <Check className="w-4 h-4 mr-2" /> Estarei Presente
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-2xl text-sm font-medium border-border/50 hover:-translate-y-0.5"
              onClick={() => handleRSVP(false)}
              disabled={status === "loading"}
            >
              <X className="w-4 h-4 mr-2" /> Não Poderei Ir
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
