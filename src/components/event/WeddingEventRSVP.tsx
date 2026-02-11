import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RSVPProps {
  eventCode: string;
  themeColor: string;
  initialGuestName?: string;
}

export function WeddingEventRSVP({ eventCode, themeColor, initialGuestName }: RSVPProps) {
  const [guestName, setGuestName] = useState(initialGuestName?.replace(/-/g, " ") || "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmed, setConfirmed] = useState<boolean | null>(null);

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
  };

  if (status === "success") {
    return (
      <section className="py-12 px-4">
        <Card className="max-w-md mx-auto border-border shadow-lg">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-primary-foreground"
              style={{ backgroundColor: themeColor }}
            >
              {confirmed ? <Heart className="w-8 h-8" /> : <X className="w-8 h-8" />}
            </div>
            <h3 className="text-xl font-serif text-foreground">
              {confirmed ? "Presença Confirmada!" : "Resposta Registada"}
            </h3>
            <p className="text-muted-foreground">
              {confirmed
                ? `Obrigado, ${guestName}! Estamos ansiosos por celebrar consigo.`
                : `Obrigado por nos informar, ${guestName}. Sentiremos a sua falta!`}
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <h2 className="text-2xl font-serif text-center text-foreground mb-2">Confirme a sua Presença</h2>
      <p className="text-center text-muted-foreground mb-8 text-sm">
        Insira o seu primeiro e último nome
      </p>
      <Card className="max-w-md mx-auto border-border shadow-lg">
        <CardContent className="pt-6 space-y-4">
          <Input
            placeholder="Primeiro e último nome"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            disabled={status === "loading"}
            className="text-center"
          />
          {errorMsg && <p className="text-destructive text-sm text-center">{errorMsg}</p>}
          <div className="flex gap-3">
            <Button
              className="flex-1 text-primary-foreground"
              style={{ backgroundColor: themeColor }}
              onClick={() => handleRSVP(true)}
              disabled={status === "loading"}
            >
              <Check className="w-4 h-4 mr-2" /> Estarei Presente
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleRSVP(false)}
              disabled={status === "loading"}
            >
              <X className="w-4 h-4 mr-2" /> Não Poderei Ir
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
