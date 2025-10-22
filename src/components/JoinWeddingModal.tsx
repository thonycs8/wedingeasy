import { useState } from "react";
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
import { UserPlus, Loader2 } from "lucide-react";

interface JoinWeddingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const JoinWeddingModal = ({ open, onOpenChange, onSuccess }: JoinWeddingModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinWedding = async () => {
    if (!user || !joinCode.trim()) {
      toast({
        title: t('common.error'),
        description: t('collaborators.enterCode'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Find the wedding by event code
      const { data: weddingData, error: weddingError } = await supabase
        .from('wedding_data')
        .select('id, user_id')
        .eq('event_code', joinCode.trim().toUpperCase())
        .maybeSingle();

      if (weddingError || !weddingData) {
        toast({
          title: t('common.error'),
          description: t('collaborators.invalidCode'),
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if already a collaborator
      const { data: existingCollab } = await supabase
        .from('wedding_collaborators')
        .select('id')
        .eq('wedding_id', weddingData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingCollab) {
        toast({
          title: t('common.error'),
          description: t('collaborators.alreadyJoined'),
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Add as collaborator
      const { error: insertError } = await supabase
        .from('wedding_collaborators')
        .insert({
          wedding_id: weddingData.id,
          user_id: user.id,
          role: 'collaborator'
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: t('collaborators.joinSuccess'),
        description: t('collaborators.joinSuccess'),
      });

      setJoinCode("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error joining wedding:', error);
      toast({
        title: t('common.error'),
        description: t('collaborators.joinError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {t('collaborators.joinWithCode')}
          </DialogTitle>
          <DialogDescription>
            {t('collaborators.enterCode')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="joinCode">{t('collaborators.eventCode')}</Label>
            <Input
              id="joinCode"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="WEPLAN-ABC123"
              className="mt-2 font-mono"
              maxLength={13}
            />
          </div>

          <Button 
            onClick={handleJoinWedding}
            disabled={loading || !joinCode.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.loading')}...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                {t('collaborators.joinButton')}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
