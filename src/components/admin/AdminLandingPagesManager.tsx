import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Eye, ExternalLink, RefreshCw, Users, Save, Pencil, Globe, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPublicBaseUrl } from "@/utils/getPublicBaseUrl";
import { AdminRoleInvitesManager } from "./AdminRoleInvitesManager";

interface LandingPageRow {
  id: string;
  wedding_id: string;
  is_published: boolean;
  theme_preset: string | null;
  theme_color: string | null;
  hero_message: string | null;
  venue_name: string | null;
  venue_address: string | null;
  ceremony_time: string | null;
  party_time: string | null;
  dress_code: string | null;
  custom_message: string | null;
  intro_text: string | null;
  verse_text: string | null;
  video_url: string | null;
  cover_image_url: string | null;
  font_family: string | null;
  same_venue: boolean;
  reception_venue_name: string | null;
  reception_venue_address: string | null;
  gallery_urls: string[];
  show_countdown: boolean;
  show_map: boolean;
  show_rsvp: boolean;
  show_gallery: boolean;
  show_video: boolean;
  show_verse: boolean;
  created_at: string;
  updated_at: string;
  wedding_data: {
    couple_name: string | null;
    partner_name: string | null;
    event_code: string;
    wedding_date: string | null;
    is_active: boolean | null;
  } | null;
}

const THEME_PRESETS = [
  { id: "romantic", label: "Romântico" },
  { id: "rustic", label: "Rústico" },
  { id: "classic", label: "Clássico" },
  { id: "modern", label: "Moderno" },
  { id: "garden", label: "Jardim" },
  { id: "beach", label: "Praia" },
];

export const AdminLandingPagesManager = () => {
  const [pages, setPages] = useState<LandingPageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editPage, setEditPage] = useState<LandingPageRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("wedding_landing_pages")
        .select("*, wedding_data(couple_name, partner_name, event_code, wedding_date, is_active)")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setPages((data as unknown as LandingPageRow[]) || []);
    } catch (error) {
      console.error("Erro ao carregar landing pages:", error);
      toast({ title: "Erro", description: "Não foi possível carregar as landing pages.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (page: LandingPageRow) => {
    try {
      const { error } = await supabase
        .from("wedding_landing_pages")
        .update({ is_published: !page.is_published })
        .eq("id", page.id);
      if (error) throw error;
      setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, is_published: !p.is_published } : p)));
      toast({ title: page.is_published ? "Página despublicada" : "Página publicada" });
    } catch {
      toast({ title: "Erro", description: "Não foi possível alterar o estado.", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!editPage) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("wedding_landing_pages")
        .update({
          hero_message: editPage.hero_message,
          intro_text: editPage.intro_text,
          verse_text: editPage.verse_text,
          custom_message: editPage.custom_message,
          dress_code: editPage.dress_code,
          venue_name: editPage.venue_name,
          venue_address: editPage.venue_address,
          ceremony_time: editPage.ceremony_time,
          party_time: editPage.party_time,
          same_venue: editPage.same_venue,
          reception_venue_name: editPage.reception_venue_name,
          reception_venue_address: editPage.reception_venue_address,
          theme_preset: editPage.theme_preset,
          theme_color: editPage.theme_color,
          font_family: editPage.font_family,
          cover_image_url: editPage.cover_image_url,
          video_url: editPage.video_url,
          show_countdown: editPage.show_countdown,
          show_map: editPage.show_map,
          show_rsvp: editPage.show_rsvp,
          show_gallery: editPage.show_gallery,
          show_video: editPage.show_video,
          show_verse: editPage.show_verse,
          is_published: editPage.is_published,
        })
        .eq("id", editPage.id);

      if (error) throw error;

      setPages((prev) => prev.map((p) => (p.id === editPage.id ? { ...editPage, updated_at: new Date().toISOString() } : p)));
      toast({ title: "Guardado!", description: "Landing page atualizada com sucesso." });
      setEditOpen(false);
    } catch {
      toast({ title: "Erro ao guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateEdit = (field: keyof LandingPageRow, value: any) => {
    setEditPage((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const getCoupleLabel = (page: LandingPageRow) => {
    const w = page.wedding_data;
    if (!w) return "—";
    return [w.partner_name, w.couple_name].filter(Boolean).join(" & ") || "Sem nome";
  };

  const getEventUrl = (page: LandingPageRow) => {
    const code = page.wedding_data?.event_code;
    if (!code) return "";
    return `${getPublicBaseUrl()}/evento/${code}`;
  };

  const filteredPages = pages.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const couple = getCoupleLabel(p).toLowerCase();
    const code = p.wedding_data?.event_code?.toLowerCase() || "";
    const venue = p.venue_name?.toLowerCase() || "";
    return couple.includes(q) || code.includes(q) || venue.includes(q);
  });

  const publishedCount = pages.filter((p) => p.is_published).length;
  const activeModules = (p: LandingPageRow) => {
    const modules = [];
    if (p.show_countdown) modules.push("Countdown");
    if (p.show_map) modules.push("Mapa");
    if (p.show_rsvp) modules.push("RSVP");
    if (p.show_gallery) modules.push("Galeria");
    if (p.show_video) modules.push("Vídeo");
    if (p.show_verse) modules.push("Verso");
    return modules;
  };

  if (loading) {
    return <div className="text-muted-foreground">Carregando landing pages...</div>;
  }

  return (
    <Tabs defaultValue="pages" className="space-y-6">
      <TabsList>
        <TabsTrigger value="pages" className="flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> Landing Pages
        </TabsTrigger>
        <TabsTrigger value="role-invites" className="flex items-center gap-1.5">
          <Users className="w-4 h-4" /> Convites por Papel
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pages">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pages.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Landing pages criadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Publicadas</CardTitle>
                <Eye className="w-5 h-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{publishedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Visíveis ao público</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rascunhos</CardTitle>
                <FileText className="w-5 h-5 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{pages.length - publishedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Ainda não publicadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por casal, código ou local..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchPages}>
              <RefreshCw className="w-4 h-4 mr-1" /> Atualizar
            </Button>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Casal</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Tema</TableHead>
                      <TableHead>Módulos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {search ? "Nenhum resultado encontrado" : "Nenhuma landing page criada"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPages.map((page) => (
                        <TableRow key={page.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{getCoupleLabel(page)}</p>
                              {page.wedding_data?.wedding_date && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(page.wedding_data.wedding_date).toLocaleDateString("pt-PT")}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-0.5 rounded">
                              {page.wedding_data?.event_code || "—"}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {page.theme_color && (
                                <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: page.theme_color }} />
                              )}
                              <span className="text-sm">{page.theme_preset || "Padrão"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {activeModules(page).map((m) => (
                                <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch checked={page.is_published} onCheckedChange={() => togglePublish(page)} />
                              <Badge variant={page.is_published ? "default" : "outline"}>
                                {page.is_published ? "Publicada" : "Rascunho"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditPage({ ...page });
                                  setEditOpen(true);
                                }}
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              {page.is_published && getEventUrl(page) && (
                                <Button size="sm" variant="outline" onClick={() => window.open(getEventUrl(page), "_blank")}>
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Full Edit Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pencil className="w-5 h-5" />
                  Editar Landing Page
                </DialogTitle>
                <DialogDescription>
                  {editPage ? getCoupleLabel(editPage) : ""} — Código: {editPage?.wedding_data?.event_code}
                </DialogDescription>
              </DialogHeader>

              {editPage && (
                <Tabs defaultValue="general" className="mt-2">
                  <TabsList className="flex-wrap h-auto gap-1 mb-4">
                    <TabsTrigger value="general">Geral</TabsTrigger>
                    <TabsTrigger value="content">Conteúdo</TabsTrigger>
                    <TabsTrigger value="venue">Local</TabsTrigger>
                    <TabsTrigger value="media">Multimédia</TabsTrigger>
                    <TabsTrigger value="modules">Módulos</TabsTrigger>
                  </TabsList>

                  {/* General Tab */}
                  <TabsContent value="general" className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">Estado de Publicação</p>
                        <p className="text-xs text-muted-foreground">
                          {editPage.is_published ? "Visível ao público" : "Apenas rascunho"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editPage.is_published}
                          onCheckedChange={(v) => updateEdit("is_published", v)}
                        />
                        <Badge variant={editPage.is_published ? "default" : "outline"}>
                          {editPage.is_published ? "Publicada" : "Rascunho"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tema Pre-definido</Label>
                        <Select value={editPage.theme_preset || ""} onValueChange={(v) => updateEdit("theme_preset", v || null)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar tema" />
                          </SelectTrigger>
                          <SelectContent>
                            {THEME_PRESETS.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Cor do Tema</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={editPage.theme_color || "#e11d48"}
                            onChange={(e) => updateEdit("theme_color", e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer border border-border"
                          />
                          <Input
                            value={editPage.theme_color || ""}
                            onChange={(e) => updateEdit("theme_color", e.target.value)}
                            className="w-28"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Família de Fonte</Label>
                      <Input
                        value={editPage.font_family || ""}
                        onChange={(e) => updateEdit("font_family", e.target.value || null)}
                        placeholder="Ex: Playfair Display, serif"
                      />
                    </div>
                  </TabsContent>

                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <Label>Mensagem Hero</Label>
                      <Input
                        value={editPage.hero_message || ""}
                        onChange={(e) => updateEdit("hero_message", e.target.value)}
                        placeholder="Ex: Vamos casar!"
                      />
                    </div>
                    <div>
                      <Label>Texto de Introdução</Label>
                      <Textarea
                        value={editPage.intro_text || ""}
                        onChange={(e) => updateEdit("intro_text", e.target.value)}
                        placeholder="Texto de boas-vindas..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Verso / Poema</Label>
                      <Textarea
                        value={editPage.verse_text || ""}
                        onChange={(e) => updateEdit("verse_text", e.target.value)}
                        placeholder="Um verso especial..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Mensagem Personalizada</Label>
                      <Textarea
                        value={editPage.custom_message || ""}
                        onChange={(e) => updateEdit("custom_message", e.target.value)}
                        placeholder="Mensagem para os convidados..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Dress Code</Label>
                      <Input
                        value={editPage.dress_code || ""}
                        onChange={(e) => updateEdit("dress_code", e.target.value)}
                        placeholder="Ex: Traje formal"
                      />
                    </div>
                  </TabsContent>

                  {/* Venue Tab */}
                  <TabsContent value="venue" className="space-y-4">
                    <div>
                      <Label>Nome do Local (Cerimónia)</Label>
                      <Input
                        value={editPage.venue_name || ""}
                        onChange={(e) => updateEdit("venue_name", e.target.value)}
                        placeholder="Ex: Quinta da Regaleira"
                      />
                    </div>
                    <div>
                      <Label>Morada da Cerimónia</Label>
                      <Input
                        value={editPage.venue_address || ""}
                        onChange={(e) => updateEdit("venue_address", e.target.value)}
                        placeholder="Morada completa..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Horário da Cerimónia</Label>
                        <Input
                          type="time"
                          value={editPage.ceremony_time || ""}
                          onChange={(e) => updateEdit("ceremony_time", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Horário do Copo d'Água</Label>
                        <Input
                          type="time"
                          value={editPage.party_time || ""}
                          onChange={(e) => updateEdit("party_time", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Mesmo local para Cerimónia e Copo d'Água</p>
                      </div>
                      <Switch
                        checked={editPage.same_venue}
                        onCheckedChange={(v) => updateEdit("same_venue", v)}
                      />
                    </div>

                    {!editPage.same_venue && (
                      <>
                        <div>
                          <Label>Nome do Local (Copo d'Água)</Label>
                          <Input
                            value={editPage.reception_venue_name || ""}
                            onChange={(e) => updateEdit("reception_venue_name", e.target.value)}
                            placeholder="Nome do espaço da recepção..."
                          />
                        </div>
                        <div>
                          <Label>Morada (Copo d'Água)</Label>
                          <Input
                            value={editPage.reception_venue_address || ""}
                            onChange={(e) => updateEdit("reception_venue_address", e.target.value)}
                            placeholder="Morada do espaço da recepção..."
                          />
                        </div>
                      </>
                    )}
                  </TabsContent>

                  {/* Media Tab */}
                  <TabsContent value="media" className="space-y-4">
                    <div>
                      <Label>URL da Imagem de Capa</Label>
                      <Input
                        value={editPage.cover_image_url || ""}
                        onChange={(e) => updateEdit("cover_image_url", e.target.value)}
                        placeholder="https://..."
                      />
                      {editPage.cover_image_url && (
                        <div className="mt-2 rounded-lg overflow-hidden border h-32">
                          <img src={editPage.cover_image_url} alt="Capa" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>URL do Vídeo (YouTube/Vimeo)</Label>
                      <Input
                        value={editPage.video_url || ""}
                        onChange={(e) => updateEdit("video_url", e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                    <div>
                      <Label>Galeria de Imagens</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        {editPage.gallery_urls?.length || 0} imagens na galeria
                      </p>
                      {editPage.gallery_urls?.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {editPage.gallery_urls.map((url, i) => (
                            <div key={i} className="relative group rounded overflow-hidden border aspect-square">
                              <img src={url} alt={`Galeria ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Modules Tab */}
                  <TabsContent value="modules" className="space-y-3">
                    <p className="text-sm text-muted-foreground">Ativar ou desativar secções da landing page:</p>
                    {[
                      { key: "show_countdown" as const, label: "Countdown", desc: "Contagem regressiva para o evento" },
                      { key: "show_map" as const, label: "Mapa", desc: "Localização do evento no mapa" },
                      { key: "show_rsvp" as const, label: "RSVP", desc: "Confirmação de presença online" },
                      { key: "show_gallery" as const, label: "Galeria", desc: "Galeria de imagens do casal" },
                      { key: "show_video" as const, label: "Vídeo", desc: "Vídeo incorporado (YouTube/Vimeo)" },
                      { key: "show_verse" as const, label: "Verso", desc: "Verso ou poema especial" },
                    ].map((mod) => (
                      <div key={mod.key} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{mod.label}</p>
                          <p className="text-xs text-muted-foreground">{mod.desc}</p>
                        </div>
                        <Switch
                          checked={editPage[mod.key]}
                          onCheckedChange={(v) => updateEdit(mod.key, v)}
                        />
                      </div>
                    ))}
                  </TabsContent>

                  {/* Save Button */}
                  <div className="flex justify-between items-center pt-4 border-t mt-4">
                    {editPage.is_published && getEventUrl(editPage) && (
                      <Button variant="outline" size="sm" onClick={() => window.open(getEventUrl(editPage), "_blank")}>
                        <ExternalLink className="w-4 h-4 mr-1" /> Ver Página
                      </Button>
                    )}
                    <div className="ml-auto">
                      <Button onClick={handleSave} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Guardando..." : "Guardar Alterações"}
                      </Button>
                    </div>
                  </div>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </TabsContent>

      <TabsContent value="role-invites">
        <AdminRoleInvitesManager />
      </TabsContent>
    </Tabs>
  );
};
