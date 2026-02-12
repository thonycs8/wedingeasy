import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWeddingId } from "@/hooks/useWeddingId";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Globe, Send, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";

const ORDER_STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  requested: { label: "Pedido enviado", variant: "outline", icon: Clock },
  processing: { label: "Em processamento", variant: "secondary", icon: Clock },
  purchased: { label: "Domínio comprado", variant: "default", icon: CheckCircle },
  configuring: { label: "A configurar DNS", variant: "secondary", icon: Clock },
  active: { label: "Activo", variant: "default", icon: CheckCircle },
  rejected: { label: "Rejeitado", variant: "destructive", icon: AlertCircle },
};

export function WeddingDomainRequest() {
  const { user } = useAuth();
  const { weddingId } = useWeddingId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [desiredDomain, setDesiredDomain] = useState("");
  const [message, setMessage] = useState("");

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ["wedding-domains", weddingId],
    queryFn: async () => {
      if (!weddingId) return [];
      const { data, error } = await supabase
        .from("custom_domains")
        .select("*")
        .eq("wedding_id", weddingId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!weddingId,
  });

  const requestMutation = useMutation({
    mutationFn: async () => {
      if (!weddingId || !user) throw new Error("Missing data");
      const { error } = await supabase
        .from("custom_domains")
        .insert({
          wedding_id: weddingId,
          domain: desiredDomain.toLowerCase().trim(),
          desired_domain: desiredDomain.toLowerCase().trim(),
          requested_by: user.id,
          order_status: "requested",
          request_message: message.trim() || null,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding-domains"] });
      setDesiredDomain("");
      setMessage("");
      toast({ title: "Pedido enviado!", description: "O administrador irá processar o seu pedido de domínio." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível enviar o pedido.", variant: "destructive" });
    },
  });

  const activeDomain = domains.find((d: any) => d.order_status === "active" || d.status === "active");

  return (
    <div className="space-y-6">
      {/* Active domain highlight */}
      {activeDomain && (
        <Card className="p-6 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Domínio activo</h3>
              <p className="text-sm text-muted-foreground">
                A sua página de evento está disponível em:
              </p>
              <a
                href={`https://${(activeDomain as any).domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium flex items-center gap-1 mt-1"
              >
                {(activeDomain as any).domain}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <Badge variant="default">Activo</Badge>
          </div>
        </Card>
      )}

      {/* Request form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Pedir domínio personalizado</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Submeta um pedido para ter um domínio personalizado (ex: karina-e-anthony.com) para a página do seu evento. O administrador da plataforma irá processar a compra e configuração.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="desired-domain">Domínio desejado</Label>
            <Input
              id="desired-domain"
              placeholder="meu-casamento.com"
              value={desiredDomain}
              onChange={(e) => setDesiredDomain(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Indique o domínio que gostaria de usar. Pode sugerir alternativas na mensagem.
            </p>
          </div>

          <div>
            <Label htmlFor="request-message">Mensagem (opcional)</Label>
            <Textarea
              id="request-message"
              placeholder="Gostaria de usar este domínio para o nosso casamento. Alternativa: nosso-casamento.pt"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={() => requestMutation.mutate()}
            disabled={!desiredDomain.trim() || requestMutation.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar pedido
          </Button>
        </div>
      </Card>

      {/* Existing requests */}
      {domains.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Histórico de pedidos</h3>
          <div className="space-y-3">
            {domains.map((d: any) => {
              const status = ORDER_STATUS_MAP[d.order_status] ?? ORDER_STATUS_MAP.requested;
              const StatusIcon = status.icon;
              return (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{d.desired_domain || d.domain}</p>
                      {d.admin_notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">{d.admin_notes}</p>
                      )}
                      {d.price && (
                        <p className="text-xs text-muted-foreground">Preço: €{d.price}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">A carregar...</p>}
    </div>
  );
}
