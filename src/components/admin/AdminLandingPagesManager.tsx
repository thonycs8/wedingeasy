import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { FileText, Search, Eye, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPublicBaseUrl } from "@/utils/getPublicBaseUrl";

interface LandingPageRow {
  id: string;
  wedding_id: string;
  is_published: boolean;
  theme_preset: string | null;
  theme_color: string | null;
  hero_message: string | null;
  venue_name: string | null;
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

export const AdminLandingPagesManager = () => {
  const [pages, setPages] = useState<LandingPageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPage, setSelectedPage] = useState<LandingPageRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("wedding_landing_pages")
        .select("id, wedding_id, is_published, theme_preset, theme_color, hero_message, venue_name, show_countdown, show_map, show_rsvp, show_gallery, show_video, show_verse, created_at, updated_at, wedding_data(couple_name, partner_name, event_code, wedding_date, is_active)")
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

      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, is_published: !p.is_published } : p))
      );

      toast({
        title: page.is_published ? "Página despublicada" : "Página publicada",
        description: `Landing page de ${getCoupleLabel(page)} foi ${page.is_published ? "despublicada" : "publicada"}.`,
      });
    } catch {
      toast({ title: "Erro", description: "Não foi possível alterar o estado.", variant: "destructive" });
    }
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
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: page.theme_color }}
                            />
                          )}
                          <span className="text-sm">{page.theme_preset || "Padrão"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {activeModules(page).map((m) => (
                            <Badge key={m} variant="secondary" className="text-xs">
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={page.is_published}
                            onCheckedChange={() => togglePublish(page)}
                          />
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
                              setSelectedPage(page);
                              setDetailOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {page.is_published && getEventUrl(page) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(getEventUrl(page), "_blank")}
                            >
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Landing Page</DialogTitle>
            <DialogDescription>
              {selectedPage ? getCoupleLabel(selectedPage) : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedPage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Código do Evento</p>
                  <p className="font-medium">{selectedPage.wedding_data?.event_code || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data do Casamento</p>
                  <p className="font-medium">
                    {selectedPage.wedding_data?.wedding_date
                      ? new Date(selectedPage.wedding_data.wedding_date).toLocaleDateString("pt-PT")
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tema</p>
                  <div className="flex items-center gap-2">
                    {selectedPage.theme_color && (
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: selectedPage.theme_color }}
                      />
                    )}
                    <span className="font-medium">{selectedPage.theme_preset || "Padrão"}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Estado</p>
                  <Badge variant={selectedPage.is_published ? "default" : "outline"}>
                    {selectedPage.is_published ? "Publicada" : "Rascunho"}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Local</p>
                  <p className="font-medium">{selectedPage.venue_name || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mensagem Hero</p>
                  <p className="font-medium">{selectedPage.hero_message || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Evento Ativo</p>
                  <Badge variant={selectedPage.wedding_data?.is_active ? "default" : "destructive"}>
                    {selectedPage.wedding_data?.is_active ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Última Atualização</p>
                  <p className="font-medium">
                    {new Date(selectedPage.updated_at).toLocaleDateString("pt-PT", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Módulos Ativos</p>
                <div className="flex flex-wrap gap-2">
                  {activeModules(selectedPage).length > 0 ? (
                    activeModules(selectedPage).map((m) => (
                      <Badge key={m} variant="secondary">{m}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Nenhum módulo ativo</span>
                  )}
                </div>
              </div>

              {selectedPage.is_published && getEventUrl(selectedPage) && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => window.open(getEventUrl(selectedPage), "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Landing Page
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
