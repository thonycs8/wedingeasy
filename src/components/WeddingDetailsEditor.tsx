import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { Calendar, Heart, Loader2, Users } from "lucide-react";

// Validation schemas
const nameSchema = z.string().trim().min(1, 'Nome não pode estar vazio').max(100, 'Nome muito longo');

const weddingDetailsSchema = z.object({
  coupleName: nameSchema,
  partnerName: nameSchema,
  weddingDate: z.string().optional(),
  guestCount: z.number().min(0, 'Número de convidados deve ser positivo').optional(),
});

interface WeddingDetailsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export const WeddingDetailsEditor = ({ open, onOpenChange, onUpdate }: WeddingDetailsEditorProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [weddingId, setWeddingId] = useState("");
  const [coupleName, setCoupleName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [guestCount, setGuestCount] = useState<number | undefined>(undefined);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadWeddingDetails();
    }
  }, [open, user]);

  const loadWeddingDetails = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Try to get wedding data where user is owner
      const { data: weddingData, error } = await supabase
        .from('wedding_data')
        .select('id, couple_name, partner_name, wedding_date, guest_count, user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!weddingData && !error) {
        // Check if user is collaborator
        const { data: collabData } = await supabase
          .from('wedding_collaborators')
          .select('wedding_id, role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (collabData) {
          // Load the wedding data they're collaborating on
          const { data: wedding } = await supabase
            .from('wedding_data')
            .select('id, couple_name, partner_name, wedding_date, guest_count, user_id')
            .eq('id', collabData.wedding_id)
            .single();

          if (wedding) {
            setWeddingId(wedding.id);
            setCoupleName(wedding.couple_name || '');
            setPartnerName(wedding.partner_name || '');
            setWeddingDate(wedding.wedding_date || '');
            setGuestCount(wedding.guest_count || undefined);
            setIsOwner(wedding.user_id === user.id);
          }
        }
      } else if (weddingData) {
        setWeddingId(weddingData.id);
        setCoupleName(weddingData.couple_name || '');
        setPartnerName(weddingData.partner_name || '');
        setWeddingDate(weddingData.wedding_date || '');
        setGuestCount(weddingData.guest_count || undefined);
        setIsOwner(weddingData.user_id === user.id);
      }
    } catch (error) {
      console.error('Error loading wedding details:', error);
      toast({
        title: t('common.error'),
        description: 'Erro ao carregar detalhes do casamento',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveWeddingDetails = async () => {
    // Validate all fields
    try {
      weddingDetailsSchema.parse({
        coupleName: coupleName.trim(),
        partnerName: partnerName.trim(),
        weddingDate: weddingDate || undefined,
        guestCount: guestCount
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('common.error'),
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('wedding_data')
        .update({
          couple_name: coupleName.trim(),
          partner_name: partnerName.trim(),
          wedding_date: weddingDate || null,
          guest_count: guestCount || null
        })
        .eq('id', weddingId);

      if (error) throw error;

      toast({
        title: "Detalhes atualizados",
        description: "Os detalhes do casamento foram salvos com sucesso",
      });

      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving wedding details:', error);
      toast({
        title: t('common.error'),
        description: 'Erro ao salvar detalhes do casamento',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <DialogTitle>Detalhes do Casamento</DialogTitle>
          </div>
          <DialogDescription>
            Edite as informações principais do seu evento
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coupleName">Nome do Noivo/Noiva *</Label>
              <div className="relative">
                <Heart className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="coupleName"
                  type="text"
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                  placeholder="Nome completo"
                  className="pl-9"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerName">Nome do(a) Parceiro(a) *</Label>
              <div className="relative">
                <Heart className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="partnerName"
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Nome completo"
                  className="pl-9"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weddingDate">Data do Casamento</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="weddingDate"
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestCount">Número de Convidados</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="guestCount"
                  type="number"
                  min="0"
                  value={guestCount || ''}
                  onChange={(e) => setGuestCount(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Número estimado"
                  className="pl-9"
                />
              </div>
            </div>

            <Button
              onClick={saveWeddingDetails}
              disabled={saving || !coupleName.trim() || !partnerName.trim()}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
