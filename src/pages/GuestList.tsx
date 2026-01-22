import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GuestListManager from "@/components/GuestListManager";
import { useAuth } from "@/hooks/useAuth";

const GuestList = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto p-4 sm:p-6 space-y-4">
        <Card className="card-romantic">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Users className="w-5 h-5 text-primary" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold truncate">Lista de Convidados</h1>
                <p className="text-sm text-muted-foreground truncate">
                  Edição rápida em formato de tabela
                </p>
              </div>
            </div>

            <Button variant="outline" onClick={() => navigate("/dashboard")}
              className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>

        <GuestListManager />
      </div>
    </div>
  );
};

export default GuestList;
