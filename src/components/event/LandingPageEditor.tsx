import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useWeddingId } from "@/hooks/useWeddingId";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, ExternalLink, Save, Globe, Eye, EyeOff, Link2, Users } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";

interface LandingPageData {
  id?: string;
  wedding_id: string;
  is_published: boolean;
  hero_message: string;
  venue_name: string;
  venue_address: string;
  venue_lat: number | null;
  venue_lng: number | null;
  ceremony_time: string;
  party_time: string;
  dress_code: string;
  custom_message: string;
  show_countdown: boolean;
  show_map: boolean;
  show_rsvp: boolean;
  theme_color: string;
  cover_image_url: string;
}

const DEFAULT_DATA: Omit<LandingPageData, "wedding_id"> = {
  is_published: false,
  hero_message: "Vamos casar!",
  venue_name: "",
  venue_address: "",
  venue_lat: null,
  venue_lng: null,
  ceremony_time: "",
  party_time: "",
  dress_code: "",
  custom_message: "",
  show_countdown: true,
  show_map: true,
  show_rsvp: true,
  theme_color: "#e11d48",
  cover_image_url: "",
};

export function LandingPageEditor() {
  const { weddingId } = useWeddingId();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LandingPageData | null>(null);
  const [eventCode, setEventCode] = useState<string>("");

  // Fetch existing landing page config + event code
  const { data: existing, isLoading } = useQuery({
    queryKey: ["landing-page", weddingId],
    queryFn: async () => {
      if (!weddingId) return null;

      const { data: wedding } = await supabase
        .from("wedding_data")
        .select("event_code")
        .eq("id", weddingId)
        .single();

      if (wedding) setEventCode(wedding.event_code);

      const { data } = await supabase
        .from("wedding_landing_pages")
        .select("*")
        .eq("wedding_id", weddingId)
        .maybeSingle();

      return data;
    },
    enabled: !!weddingId,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        id: existing.id,
        wedding_id: existing.wedding_id,
        is_published: existing.is_published,
        hero_message: existing.hero_message || "",
        venue_name: existing.venue_name || "",
        venue_address: existing.venue_address || "",
        venue_lat: existing.venue_lat ? Number(existing.venue_lat) : null,
        venue_lng: existing.venue_lng ? Number(existing.venue_lng) : null,
        ceremony_time: existing.ceremony_time || "",
        party_time: existing.party_time || "",
        dress_code: existing.dress_code || "",
        custom_message: existing.custom_message || "",
        show_countdown: existing.show_countdown,
        show_map: existing.show_map,
        show_rsvp: existing.show_rsvp,
        theme_color: existing.theme_color || "#e11d48",
        cover_image_url: existing.cover_image_url || "",
      });
    } else if (weddingId) {
      setForm({ ...DEFAULT_DATA, wedding_id: weddingId });
    }
  }, [existing, weddingId]);

  const saveMutation = useMutation({
    mutationFn: async (data: LandingPageData) => {
      if (!weddingId || !user) throw new Error("No wedding");

      const payload = {
        wedding_id: weddingId,
        is_published: data.is_published,
        hero_message: data.hero_message || null,
        venue_name: data.venue_name || null,
        venue_address: data.venue_address || null,
        venue_lat: data.venue_lat,
        venue_lng: data.venue_lng,
        ceremony_time: data.ceremony_time || null,
        party_time: data.party_time || null,
        dress_code: data.dress_code || null,
        custom_message: data.custom_message || null,
        show_countdown: data.show_countdown,
        show_map: data.show_map,
        show_rsvp: data.show_rsvp,
        theme_color: data.theme_color,
        cover_image_url: data.cover_image_url || null,
      };

      if (data.id) {
        const { error } = await supabase
          .from("wedding_landing_pages")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wedding_landing_pages")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-page", weddingId] });
      toast({ title: "Página guardada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao guardar", description: "Tente novamente.", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (form) saveMutation.mutate(form);
  };

  const togglePublish = () => {
    if (!form) return;
    const updated = { ...form, is_published: !form.is_published };
    setForm(updated);
    saveMutation.mutate(updated);
  };

  const getPublicUrl = () => {
    const base = window.location.origin;
    return `${base}/evento/${eventCode}`;
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!" });
  };

  const getRoleLink = (role: string, guestName: string) => {
    const slug = guestName.toLowerCase().replace(/\s+/g, "-");
    return `${getPublicUrl()}?role=${encodeURIComponent(role.toLowerCase())}&guest=${encodeURIComponent(slug)}`;
  };

  if (isLoading || !form) return <LoadingState />;

  const update = (field: keyof LandingPageData, value: any) =>
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);

  return (
    <div className="space-y-6">
      {/* Header with publish status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Página do Evento</h2>
          <p className="text-muted-foreground text-sm">
            Configure a landing page pública do seu casamento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={form.is_published ? "default" : "secondary"}>
            {form.is_published ? (
              <><Globe className="w-3 h-3 mr-1" /> Publicada</>
            ) : (
              <><EyeOff className="w-3 h-3 mr-1" /> Rascunho</>
            )}
          </Badge>
          <Button variant="outline" size="sm" onClick={togglePublish}>
            {form.is_published ? <><EyeOff className="w-4 h-4 mr-2" /> Despublicar</> : <><Eye className="w-4 h-4 mr-2" /> Publicar</>}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-2" /> Guardar
          </Button>
        </div>
      </div>

      {/* Public link */}
      {form.is_published && eventCode && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link2 className="w-5 h-5 text-primary shrink-0" />
            <code className="text-sm flex-1 break-all text-foreground">{getPublicUrl()}</code>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => copyLink(getPublicUrl())}>
                <Copy className="w-4 h-4 mr-1" /> Copiar
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={getPublicUrl()} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" /> Abrir
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="venue">Local</TabsTrigger>
          <TabsTrigger value="options">Opções</TabsTrigger>
          <TabsTrigger value="roles">Convites por Papel</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mensagens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mensagem Principal (Hero)</Label>
                <Input value={form.hero_message} onChange={(e) => update("hero_message", e.target.value)} placeholder="Vamos casar!" />
              </div>
              <div>
                <Label>Mensagem Personalizada</Label>
                <Textarea value={form.custom_message} onChange={(e) => update("custom_message", e.target.value)} placeholder="Uma mensagem especial para os convidados..." rows={4} />
              </div>
              <div>
                <Label>Dress Code</Label>
                <Input value={form.dress_code} onChange={(e) => update("dress_code", e.target.value)} placeholder="Ex: Traje formal, Casual elegante..." />
              </div>
              <div>
                <Label>URL da Imagem de Capa</Label>
                <Input value={form.cover_image_url} onChange={(e) => update("cover_image_url", e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label>Cor do Tema</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.theme_color} onChange={(e) => update("theme_color", e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-border" />
                  <Input value={form.theme_color} onChange={(e) => update("theme_color", e.target.value)} className="w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Venue Tab */}
        <TabsContent value="venue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Local & Horários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome do Local</Label>
                <Input value={form.venue_name} onChange={(e) => update("venue_name", e.target.value)} placeholder="Ex: Quinta da Regaleira" />
              </div>
              <div>
                <Label>Morada</Label>
                <Input value={form.venue_address} onChange={(e) => update("venue_address", e.target.value)} placeholder="Rua..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitude (opcional)</Label>
                  <Input type="number" step="any" value={form.venue_lat ?? ""} onChange={(e) => update("venue_lat", e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div>
                  <Label>Longitude (opcional)</Label>
                  <Input type="number" step="any" value={form.venue_lng ?? ""} onChange={(e) => update("venue_lng", e.target.value ? Number(e.target.value) : null)} />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hora da Cerimónia</Label>
                  <Input type="time" value={form.ceremony_time} onChange={(e) => update("ceremony_time", e.target.value)} />
                </div>
                <div>
                  <Label>Hora da Festa</Label>
                  <Input type="time" value={form.party_time} onChange={(e) => update("party_time", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Options Tab */}
        <TabsContent value="options" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Secções Visíveis</CardTitle>
              <CardDescription>Escolha o que mostrar na página pública</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Mostrar Countdown</Label>
                <Switch checked={form.show_countdown} onCheckedChange={(v) => update("show_countdown", v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Mostrar Mapa</Label>
                <Switch checked={form.show_map} onCheckedChange={(v) => update("show_map", v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Permitir RSVP (Confirmação de Presença)</Label>
                <Switch checked={form.show_rsvp} onCheckedChange={(v) => update("show_rsvp", v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Invites Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" /> Links de Convite por Papel
              </CardTitle>
              <CardDescription>
                Gere links personalizados para convidados com papéis especiais na cerimónia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleLinkGenerator
                eventCode={eventCode}
                getPublicUrl={getPublicUrl}
                getRoleLink={getRoleLink}
                copyLink={copyLink}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RoleLinkGenerator({
  eventCode,
  getPublicUrl,
  getRoleLink,
  copyLink,
}: {
  eventCode: string;
  getPublicUrl: () => string;
  getRoleLink: (role: string, guest: string) => string;
  copyLink: (url: string) => void;
}) {
  const [role, setRole] = useState("padrinho");
  const [guestName, setGuestName] = useState("");

  const roles = [
    "Padrinho", "Madrinha", "Dama de Honor", "Pajem",
    "Florista", "Portador das Alianças", "Celebrante", "Convidado de Honra",
  ];

  const generatedLink = guestName.trim() ? getRoleLink(role, guestName.trim()) : "";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Papel</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {roles.map((r) => (
              <option key={r} value={r.toLowerCase()}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Nome do Convidado</Label>
          <Input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Ex: João Silva"
          />
        </div>
      </div>
      {generatedLink && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <code className="text-xs flex-1 break-all text-foreground">{generatedLink}</code>
          <Button size="sm" variant="outline" onClick={() => copyLink(generatedLink)}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
