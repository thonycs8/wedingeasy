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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Copy, 
  Check, 
  UserPlus,
  Trash2,
  Crown
} from "lucide-react";

interface Collaborator {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface CollaboratorsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CollaboratorsManager = ({ open, onOpenChange }: CollaboratorsManagerProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [eventCode, setEventCode] = useState<string>("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      loadWeddingData();
    }
  }, [open, user]);

  const loadWeddingData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get wedding data with event code
      const { data: weddingData, error: weddingError } = await supabase
        .from('wedding_data')
        .select('id, event_code, user_id')
        .eq('user_id', user.id)
        .single();

      if (weddingError) {
        console.error('Error loading wedding data:', weddingError);
        setLoading(false);
        return;
      }

      if (weddingData) {
        setEventCode(weddingData.event_code);
        setIsOwner(weddingData.user_id === user.id);

        // Load collaborators with profile data
        const { data: collaboratorsData, error: collabError } = await supabase
          .from('wedding_collaborators')
          .select('id, user_id, role, joined_at')
          .eq('wedding_id', weddingData.id)
          .order('joined_at', { ascending: true });

        if (collabError) {
          console.error('Error loading collaborators:', collabError);
        } else if (collaboratorsData) {
          // Fetch profile data for each collaborator
          const collaboratorsWithProfiles = await Promise.all(
            collaboratorsData.map(async (collab) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name, email')
                .eq('user_id', collab.user_id)
                .single();
              
              return {
                ...collab,
                profiles: profile || { first_name: '', last_name: '', email: '' }
              };
            })
          );
          setCollaborators(collaboratorsWithProfiles);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyEventCode = async () => {
    try {
      await navigator.clipboard.writeText(eventCode);
      setCopied(true);
      toast({
        title: t('collaborators.codeCopied'),
        description: t('collaborators.codeCopiedDesc'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('collaborators.copyError'),
        variant: "destructive",
      });
    }
  };

  const removeCollaborator = async (collaboratorId: string, collaboratorUserId: string) => {
    if (!isOwner) {
      toast({
        title: t('common.error'),
        description: t('collaborators.onlyOwnerCanRemove'),
        variant: "destructive",
      });
      return;
    }

    if (collaboratorUserId === user?.id) {
      toast({
        title: t('common.error'),
        description: t('collaborators.cannotRemoveSelf'),
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('wedding_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;

      toast({
        title: t('collaborators.removed'),
        description: t('collaborators.removedDesc'),
      });

      loadWeddingData();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast({
        title: t('common.error'),
        description: t('collaborators.removeError'),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t('collaborators.title')}
          </DialogTitle>
          <DialogDescription>
            {t('collaborators.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Code Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    {t('collaborators.eventCode')}
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('collaborators.shareCode')}
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={eventCode}
                      readOnly
                      className="font-mono text-lg font-bold"
                    />
                    <Button 
                      onClick={copyEventCode}
                      variant="outline"
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collaborators List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                {t('collaborators.currentCollaborators')} ({collaborators.length})
              </h3>
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground py-4">
                {t('common.loading')}...
              </p>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <Card key={collaborator.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {collaborator.role === 'owner' ? (
                              <Crown className="w-5 h-5 text-primary" />
                            ) : (
                              <Users className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {collaborator.profiles?.first_name} {collaborator.profiles?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {collaborator.profiles?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={collaborator.role === 'owner' ? 'default' : 'secondary'}>
                            {collaborator.role === 'owner' ? t('collaborators.owner') : t('collaborators.collaborator')}
                          </Badge>
                          {isOwner && collaborator.role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCollaborator(collaborator.id, collaborator.user_id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
