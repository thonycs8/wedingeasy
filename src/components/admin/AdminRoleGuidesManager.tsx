import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Pencil, Save, Plus, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RoleGuide {
  id?: string;
  role_key: string;
  title: string;
  intro: string;
  responsibilities: string[];
  dos: string[];
  donts: string[];
  faq: { q: string; a: string }[];
}

const DEFAULT_ROLES = [
  "padrinho", "madrinha", "celebrante", "dama de honor", "pajem", "florista",
  "portador das alianças", "convidado de honra"
];

export const AdminRoleGuidesManager = () => {
  const [guides, setGuides] = useState<RoleGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editGuide, setEditGuide] = useState<RoleGuide | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchGuides(); }, []);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("role_guides").select("*").order("role_key");
      if (error) throw error;

      const fetched = (data || []).map((d: any) => ({
        id: d.id,
        role_key: d.role_key,
        title: d.title,
        intro: d.intro,
        responsibilities: d.responsibilities || [],
        dos: d.dos || [],
        donts: d.donts || [],
        faq: (d.faq as any[]) || [],
      }));
      setGuides(fetched);
    } catch (error) {
      console.error("Erro ao carregar guias:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (roleKey: string) => {
    const existing = guides.find(g => g.role_key === roleKey);
    if (existing) {
      setEditGuide({ ...existing });
    } else {
      setEditGuide({
        role_key: roleKey,
        title: `Guia do ${roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}`,
        intro: "",
        responsibilities: [""],
        dos: [""],
        donts: [""],
        faq: [{ q: "", a: "" }],
      });
    }
    setEditOpen(true);
  };

  const saveGuide = async () => {
    if (!editGuide) return;
    setSaving(true);
    try {
      const payload = {
        role_key: editGuide.role_key,
        title: editGuide.title,
        intro: editGuide.intro,
        responsibilities: editGuide.responsibilities.filter(r => r.trim()),
        dos: editGuide.dos.filter(d => d.trim()),
        donts: editGuide.donts.filter(d => d.trim()),
        faq: editGuide.faq.filter(f => f.q.trim() || f.a.trim()),
      };

      if (editGuide.id) {
        const { error } = await supabase.from("role_guides").update(payload).eq("id", editGuide.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("role_guides").insert(payload);
        if (error) throw error;
      }

      toast({ title: "Guia guardado com sucesso!" });
      fetchGuides();
      setEditOpen(false);
    } catch {
      toast({ title: "Erro ao guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateListItem = (field: "responsibilities" | "dos" | "donts", index: number, value: string) => {
    if (!editGuide) return;
    const list = [...editGuide[field]];
    list[index] = value;
    setEditGuide({ ...editGuide, [field]: list });
  };

  const addListItem = (field: "responsibilities" | "dos" | "donts") => {
    if (!editGuide) return;
    setEditGuide({ ...editGuide, [field]: [...editGuide[field], ""] });
  };

  const removeListItem = (field: "responsibilities" | "dos" | "donts", index: number) => {
    if (!editGuide) return;
    const list = editGuide[field].filter((_, i) => i !== index);
    setEditGuide({ ...editGuide, [field]: list });
  };

  const updateFaq = (index: number, field: "q" | "a", value: string) => {
    if (!editGuide) return;
    const faq = [...editGuide.faq];
    faq[index] = { ...faq[index], [field]: value };
    setEditGuide({ ...editGuide, faq });
  };

  const addFaq = () => {
    if (!editGuide) return;
    setEditGuide({ ...editGuide, faq: [...editGuide.faq, { q: "", a: "" }] });
  };

  const removeFaq = (index: number) => {
    if (!editGuide) return;
    setEditGuide({ ...editGuide, faq: editGuide.faq.filter((_, i) => i !== index) });
  };

  if (loading) {
    return <div className="text-muted-foreground">Carregando guias...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Manuais por Papel
          </h3>
          <p className="text-sm text-muted-foreground">Editar o conteúdo dos guias para cada papel da cerimónia</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchGuides}>
          <RefreshCw className="w-4 h-4 mr-1" /> Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEFAULT_ROLES.map((role) => {
          const guide = guides.find(g => g.role_key === role);
          return (
            <Card key={role} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => openEdit(role)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="capitalize">{role}</span>
                  {guide ? (
                    <Badge variant="default" className="text-xs">Personalizado</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Padrão</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {guide?.intro || "A usar conteúdo padrão. Clique para personalizar."}
                </p>
                <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{guide?.responsibilities?.length || 0} responsabilidades</span>
                  <span>•</span>
                  <span>{guide?.faq?.length || 0} FAQ</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" /> Editar Guia: {editGuide?.role_key}
            </DialogTitle>
            <DialogDescription>Personalizar todas as secções do manual</DialogDescription>
          </DialogHeader>

          {editGuide && (
            <div className="space-y-6">
              {/* Title & Intro */}
              <div className="space-y-4">
                <div>
                  <Label>Título do Guia</Label>
                  <Input value={editGuide.title} onChange={(e) => setEditGuide({ ...editGuide, title: e.target.value })} />
                </div>
                <div>
                  <Label>Introdução</Label>
                  <Textarea value={editGuide.intro} onChange={(e) => setEditGuide({ ...editGuide, intro: e.target.value })} rows={3} />
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Responsabilidades</Label>
                  <Button size="sm" variant="outline" onClick={() => addListItem("responsibilities")}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {editGuide.responsibilities.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={item} onChange={(e) => updateListItem("responsibilities", i, e.target.value)} placeholder={`Responsabilidade ${i + 1}`} />
                      <Button size="icon" variant="ghost" onClick={() => removeListItem("responsibilities", i)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Dicas Úteis</Label>
                  <Button size="sm" variant="outline" onClick={() => addListItem("dos")}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {editGuide.dos.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={item} onChange={(e) => updateListItem("dos", i, e.target.value)} placeholder={`Dica ${i + 1}`} />
                      <Button size="icon" variant="ghost" onClick={() => removeListItem("dos", i)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Cuidados a Ter</Label>
                  <Button size="sm" variant="outline" onClick={() => addListItem("donts")}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {editGuide.donts.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={item} onChange={(e) => updateListItem("donts", i, e.target.value)} placeholder={`Cuidado ${i + 1}`} />
                      <Button size="icon" variant="ghost" onClick={() => removeListItem("donts", i)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Perguntas Frequentes</Label>
                  <Button size="sm" variant="outline" onClick={addFaq}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                </div>
                <div className="space-y-3">
                  {editGuide.faq.map((item, i) => (
                    <div key={i} className="p-3 rounded-lg border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">FAQ {i + 1}</span>
                        <Button size="icon" variant="ghost" onClick={() => removeFaq(i)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      <Input value={item.q} onChange={(e) => updateFaq(i, "q", e.target.value)} placeholder="Pergunta" />
                      <Textarea value={item.a} onChange={(e) => updateFaq(i, "a", e.target.value)} placeholder="Resposta" rows={2} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={saveGuide} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" /> {saving ? "Guardando..." : "Guardar Guia"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
