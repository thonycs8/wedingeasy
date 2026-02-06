import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface UserWithWedding {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  wedding_name: string | null;
  plan_name: string | null;
}

export const AdminUsersManager = () => {
  const [users, setUsers] = useState<UserWithWedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get all profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get all weddings and subscriptions for mapping
      const [weddingsRes, subsRes] = await Promise.all([
        supabase.from("wedding_data").select("id, user_id, couple_name, partner_name"),
        supabase.from("wedding_subscriptions").select("wedding_id, subscription_plans(display_name)"),
      ]);

      const weddingMap = new Map<string, string>();
      (weddingsRes.data || []).forEach((w: any) => {
        const name = [w.partner_name, w.couple_name].filter(Boolean).join(" & ");
        weddingMap.set(w.user_id, name || "Sem nome");
      });

      const planMap = new Map<string, string>();
      (subsRes.data || []).forEach((s: any) => {
        // Find wedding owner for this subscription
        const wedding = (weddingsRes.data || []).find((w: any) => w.id === s.wedding_id);
        if (wedding) {
          planMap.set(wedding.user_id, s.subscription_plans?.display_name || "—");
        }
      });

      const enriched: UserWithWedding[] = (profiles || []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        phone: p.phone,
        created_at: p.created_at,
        wedding_name: weddingMap.get(p.user_id) || null,
        plan_name: planMap.get(p.user_id) || null,
      }));

      setUsers(enriched);
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os utilizadores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.wedding_name?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Utilizadores</CardTitle>
            <CardDescription>
              {users.length} utilizadores registados
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Registo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum utilizador encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                    </TableCell>
                    <TableCell>{user.email || "—"}</TableCell>
                    <TableCell>{user.phone || "—"}</TableCell>
                    <TableCell>
                      {user.wedding_name ? (
                        <span className="text-sm">{user.wedding_name}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sem evento</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.plan_name ? (
                        <Badge variant="secondary" className="text-xs">
                          {user.plan_name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.created_at), "dd MMM yyyy", { locale: pt })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
