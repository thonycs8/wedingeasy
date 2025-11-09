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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { 
  Users, 
  Copy, 
  Check, 
  UserPlus,
  Trash2,
  Crown,
  Mail,
  Loader2,
  Clock,
  Settings
} from "lucide-react";

interface Collaborator {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
}

// Validation schemas
const emailSchema = z.string().trim().email('Email inválido').max(255, 'Email muito longo');
const nameSchema = z.string().trim().min(1, 'Nome não pode estar vazio').max(100, 'Nome muito longo');

const directAddSchema = z.object({
  firstName: nameSchema,
  lastName: z.string().trim().max(100, 'Sobrenome muito longo'),
  email: emailSchema,
  role: z.string().min(1, 'Papel é obrigatório')
});

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
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddDirectModal, setShowAddDirectModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("colaborador");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [addingDirect, setAddingDirect] = useState(false);
  const [directFirstName, setDirectFirstName] = useState("");
  const [directLastName, setDirectLastName] = useState("");
  const [directEmail, setDirectEmail] = useState("");
  const [directRole, setDirectRole] = useState("noiva");
  const [weddingId, setWeddingId] = useState<string>("");
  const [weddingNames, setWeddingNames] = useState<string>("");
  const [inviterName, setInviterName] = useState<string>("");
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    if (open && user) {
      loadWeddingData();
    }
  }, [open, user]);

  const loadWeddingData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('[CollaboratorsManager] Loading wedding data for user:', user.id);
      
      // Try to get wedding data where user is owner
      let { data: weddingData, error: weddingError } = await supabase
        .from('wedding_data')
        .select('id, event_code, user_id, couple_name, partner_name')
        .eq('user_id', user.id)
        .maybeSingle();

      // If not owner, check if user is collaborator
      if (!weddingData) {
        console.log('[CollaboratorsManager] User is not owner, checking collaborations...');
        const { data: collabData, error: collabError } = await supabase
          .from('wedding_collaborators')
          .select('wedding_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (collabError) {
          console.error('[CollaboratorsManager] Error checking collaborations:', collabError);
          setLoading(false);
          return;
        }

        if (collabData) {
          console.log('[CollaboratorsManager] User is collaborator, loading wedding:', collabData.wedding_id);
          // Load the wedding data they're collaborating on
          const { data: wedding, error: wError } = await supabase
            .from('wedding_data')
            .select('id, event_code, user_id, couple_name, partner_name')
            .eq('id', collabData.wedding_id)
            .single();

          if (wError) {
            console.error('[CollaboratorsManager] Error loading wedding:', wError);
            setLoading(false);
            return;
          }

          weddingData = wedding;
        }
      }

      if (weddingError && weddingError.code !== 'PGRST116') {
        console.error('Error loading wedding data:', weddingError);
        setLoading(false);
        return;
      }

      if (weddingData) {
        console.log('[CollaboratorsManager] Wedding data loaded:', weddingData);
        setEventCode(weddingData.event_code);
        setIsOwner(weddingData.user_id === user.id);
        setWeddingId(weddingData.id);
        setWeddingNames(weddingData.couple_name && weddingData.partner_name 
          ? `${weddingData.couple_name} & ${weddingData.partner_name}` 
          : 'Nosso Casamento');

        // Get inviter name
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setInviterName(`${profile.first_name} ${profile.last_name || ''}`.trim());
        }

        // Load collaborators
        const { data: collaboratorsData, error: collabError } = await supabase
          .from('wedding_collaborators')
          .select('id, user_id, role, joined_at')
          .eq('wedding_id', weddingData.id)
          .order('joined_at', { ascending: true });

        console.log('[CollaboratorsManager] Collaborators data:', collaboratorsData);
        console.log('[CollaboratorsManager] Collaborators error:', collabError);

        const allCollaborators: Collaborator[] = [];

        // Collect all user IDs to fetch profiles
        const userIds = new Set<string>();
        userIds.add(weddingData.user_id); // Add owner

        if (collaboratorsData) {
          collaboratorsData.forEach(collab => userIds.add(collab.user_id));
        }

        // Fetch all profiles in one query
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', Array.from(userIds));

        const profilesMap = new Map(
          allProfiles?.map(p => [p.user_id, p]) || []
        );

        // Add owner first
        const ownerProfile = profilesMap.get(weddingData.user_id);
        if (ownerProfile) {
          allCollaborators.push({
            id: 'owner-' + weddingData.user_id,
            user_id: weddingData.user_id,
            role: 'noivo',
            joined_at: new Date().toISOString(),
            profiles: {
              first_name: ownerProfile.first_name || 'Sem nome',
              last_name: ownerProfile.last_name || '',
              email: ownerProfile.email || 'Sem email'
            }
          });
        }

        // Add other collaborators with their profiles
        if (!collabError && collaboratorsData) {
          collaboratorsData.forEach(collab => {
            const profile = profilesMap.get(collab.user_id);
            if (profile) {
              allCollaborators.push({
                ...collab,
                profiles: {
                  first_name: profile.first_name || 'Sem nome',
                  last_name: profile.last_name || '',
                  email: profile.email || 'Sem email'
                }
              });
            }
          });
        }

        setCollaborators(allCollaborators);

        // Load pending invitations
        const { data: invitationsData, error: invError } = await supabase
          .from('wedding_invitations')
          .select('id, email, role, created_at, expires_at')
          .eq('wedding_id', weddingData.id)
          .is('accepted_at', null)
          .order('created_at', { ascending: false });

        if (!invError && invitationsData) {
          setInvitations(invitationsData);
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

  const updateCollaboratorRole = async () => {
    if (!editingCollaborator || !newRole) return;

    // Check if current user is admin (owner, noiva, or celebrante)
    const { data: wedding } = await supabase
      .from('wedding_data')
      .select('user_id')
      .eq('id', weddingId)
      .single();

    const isOwner = wedding && wedding.user_id === user?.id;

    // Check if user is admin collaborator
    const { data: userCollab } = await supabase
      .from('wedding_collaborators')
      .select('role')
      .eq('wedding_id', weddingId)
      .eq('user_id', user?.id)
      .maybeSingle();

    const isAdmin = isOwner || (userCollab && ['noiva', 'celebrante'].includes(userCollab.role));

    if (!isAdmin) {
      toast({
        title: t('common.error'),
        description: 'Apenas administradores podem editar papéis',
        variant: "destructive",
      });
      return;
    }

    // Cannot edit admin roles
    if (['noivo', 'noiva', 'celebrante'].includes(editingCollaborator.role)) {
      toast({
        title: t('common.error'),
        description: 'Não é possível editar papéis de administradores',
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('wedding_collaborators')
        .update({ role: newRole as any })
        .eq('id', editingCollaborator.id);

      if (error) throw error;

      toast({
        title: "Papel atualizado",
        description: `O papel foi alterado para ${t(`roles.${newRole}`)}`,
      });

      setEditingCollaborator(null);
      setNewRole("");
      loadWeddingData();
    } catch (error) {
      console.error('Error updating collaborator role:', error);
      toast({
        title: t('common.error'),
        description: 'Erro ao atualizar papel',
        variant: "destructive",
      });
    }
  };

  const removeCollaborator = async (collaboratorId: string, collaboratorUserId: string) => {
    // Check if current user is admin (owner, noiva, or celebrante)
    const { data: wedding } = await supabase
      .from('wedding_data')
      .select('user_id')
      .eq('id', weddingId)
      .single();

    const isOwner = wedding && wedding.user_id === user?.id;

    // Check if user is admin collaborator
    const { data: userCollab } = await supabase
      .from('wedding_collaborators')
      .select('role')
      .eq('wedding_id', weddingId)
      .eq('user_id', user?.id)
      .maybeSingle();

    const isAdmin = isOwner || (userCollab && ['noiva', 'celebrante'].includes(userCollab.role));

    if (!isAdmin) {
      toast({
        title: t('common.error'),
        description: 'Apenas administradores podem remover colaboradores',
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

    // Check if trying to remove another admin
    const { data: targetCollab } = await supabase
      .from('wedding_collaborators')
      .select('role')
      .eq('id', collaboratorId)
      .maybeSingle();

    if (targetCollab && ['noiva', 'celebrante'].includes(targetCollab.role)) {
      toast({
        title: t('common.error'),
        description: 'Não é possível remover administradores (noiva/celebrante)',
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

  const sendInvitation = async () => {
    // Validate email
    try {
      emailSchema.parse(inviteEmail);
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

    setSendingInvite(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-wedding-invitation', {
        body: {
          email: inviteEmail.toLowerCase().trim(),
          role: inviteRole,
          weddingId: weddingId,
          inviterName: inviterName,
          weddingNames: weddingNames,
        },
      });

      if (error) throw error;

      toast({
        title: t('collaborators.inviteSent'),
        description: t('collaborators.inviteSentDesc'),
      });

      setInviteEmail("");
      setInviteRole("colaborador");
      setShowInviteModal(false);
      loadWeddingData();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: t('common.error'),
        description: t('collaborators.inviteError'),
        variant: "destructive",
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const deleteInvitation = async (invitationId: string) => {
    // Check if current user is admin (owner, noiva, or celebrante)
    const { data: wedding } = await supabase
      .from('wedding_data')
      .select('user_id')
      .eq('id', weddingId)
      .single();

    const isOwner = wedding && wedding.user_id === user?.id;

    // Check if user is admin collaborator
    const { data: userCollab } = await supabase
      .from('wedding_collaborators')
      .select('role')
      .eq('wedding_id', weddingId)
      .eq('user_id', user?.id)
      .maybeSingle();

    const isAdmin = isOwner || (userCollab && ['noiva', 'celebrante'].includes(userCollab.role));

    if (!isAdmin) {
      toast({
        title: t('common.error'),
        description: 'Apenas administradores podem cancelar convites',
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('wedding_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Convite cancelado",
        description: "O convite foi removido",
      });

      loadWeddingData();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast({
        title: t('common.error'),
        description: "Erro ao cancelar convite",
        variant: "destructive",
      });
    }
  };

  const addCollaboratorDirect = async () => {
    // Validate all fields
    try {
      directAddSchema.parse({
        firstName: directFirstName,
        lastName: directLastName,
        email: directEmail,
        role: directRole
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

    setAddingDirect(true);
    try {
      const cleanEmail = directEmail.toLowerCase().trim();

      // Check if user exists with this email
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUser) {
        // User exists, check if already collaborator
        const { data: existingCollab } = await supabase
          .from('wedding_collaborators')
          .select('id')
          .eq('wedding_id', weddingId)
          .eq('user_id', existingUser.user_id)
          .maybeSingle();

        if (existingCollab) {
          toast({
            title: t('common.error'),
            description: 'Este usuário já é colaborador do casamento',
            variant: "destructive",
          });
          setAddingDirect(false);
          return;
        }

        // Add as collaborator
        const { error: collabError } = await supabase
          .from('wedding_collaborators')
          .insert({
            wedding_id: weddingId,
            user_id: existingUser.user_id,
            role: directRole as any,
            invited_by: user?.id
          });

        if (collabError) throw collabError;

        toast({
          title: "Colaborador adicionado",
          description: `${directFirstName} foi adicionado como ${t(`roles.${directRole}`)}`,
        });

        setDirectFirstName("");
        setDirectLastName("");
        setDirectEmail("");
        setDirectRole("noiva");
        setShowAddDirectModal(false);
        loadWeddingData();
      } else {
        // User doesn't exist, send invitation
        const { error } = await supabase.functions.invoke('send-wedding-invitation', {
          body: {
            email: cleanEmail,
            role: directRole,
            weddingId: weddingId,
            inviterName: inviterName,
            weddingNames: weddingNames,
          },
        });

        if (error) throw error;

        toast({
          title: "Convite enviado",
          description: `Um convite foi enviado para ${cleanEmail}. Quando aceitar, o perfil será criado com os dados informados.`,
        });

        setDirectFirstName("");
        setDirectLastName("");
        setDirectEmail("");
        setDirectRole("noiva");
        setShowAddDirectModal(false);
        loadWeddingData();
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast({
        title: t('common.error'),
        description: 'Erro ao adicionar colaborador',
        variant: "destructive",
      });
    } finally {
      setAddingDirect(false);
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowAddDirectModal(true)} variant="outline" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Adicionar Diretamente
            </Button>
            <Button onClick={() => setShowInviteModal(true)} className="gap-2">
              <Mail className="w-4 h-4" />
              {t('collaborators.inviteByEmail')}
            </Button>
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('collaborators.pendingInvitations')} ({invitations.length})
              </h3>
              <div className="space-y-2">
                {invitations.map((invitation) => (
                  <Card key={invitation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Mail className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{invitation.email}</p>
                            <p className="text-sm text-muted-foreground">
                              Convite enviado • Expira em {new Date(invitation.expires_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {t(`roles.${invitation.role}`)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteInvitation(invitation.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

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
                              {collaborator.profiles?.first_name || 'Sem nome'} {collaborator.profiles?.last_name || ''}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {collaborator.profiles?.email || 'Sem email'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={collaborator.role === 'noivo' || collaborator.role === 'noiva' ? 'default' : 'secondary'}>
                            {t(`roles.${collaborator.role}`)}
                          </Badge>
                          {/* Show Admin badge for noiva and celebrante */}
                          {(collaborator.role === 'noiva' || collaborator.role === 'celebrante') && (
                            <Badge variant="destructive" className="gap-1">
                              <Crown className="w-3 h-3" />
                              Admin
                            </Badge>
                          )}
                          {/* Show Owner badge for noivo */}
                          {(collaborator.role === 'noivo' || collaborator.id.startsWith('owner-')) && (
                            <Badge variant="destructive" className="gap-1">
                              <Crown className="w-3 h-3" />
                              Owner
                            </Badge>
                          )}
                          {/* Only admins can edit/remove non-admin collaborators */}
                          {!['noivo', 'noiva', 'celebrante'].includes(collaborator.role) && 
                           !collaborator.id.startsWith('owner-') && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingCollaborator(collaborator);
                                  setNewRole(collaborator.role);
                                }}
                                title="Editar papel"
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCollaborator(collaborator.id, collaborator.user_id)}
                                title="Remover"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
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

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {t('collaborators.inviteByEmail')}
            </DialogTitle>
            <DialogDescription>
              O convite será enviado por email com um link para aceitar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="inviteEmail">{t('collaborators.emailAddress')}</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="inviteRole">{t('collaborators.selectRole')}</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="colaborador">{t('roles.colaborador')}</SelectItem>
                  <SelectItem value="noivo">{t('roles.noivo')}</SelectItem>
                  <SelectItem value="noiva">{t('roles.noiva')}</SelectItem>
                  <SelectItem value="celebrante">{t('roles.celebrante')}</SelectItem>
                  <SelectItem value="padrinho">{t('roles.padrinho')}</SelectItem>
                  <SelectItem value="madrinha">{t('roles.madrinha')}</SelectItem>
                  <SelectItem value="fotografo">{t('roles.fotografo')}</SelectItem>
                  <SelectItem value="organizador">{t('roles.organizador')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={sendInvitation}
              disabled={sendingInvite || !inviteEmail.trim()}
              className="w-full"
            >
              {sendingInvite ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {t('collaborators.sendInvite')}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Direct Modal */}
      <Dialog open={showAddDirectModal} onOpenChange={setShowAddDirectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Adicionar Colaborador Diretamente
            </DialogTitle>
            <DialogDescription>
              Se a pessoa já tem conta, será adicionada imediatamente. Caso contrário, receberá um convite.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="directFirstName">Nome *</Label>
              <Input
                id="directFirstName"
                type="text"
                value={directFirstName}
                onChange={(e) => setDirectFirstName(e.target.value)}
                placeholder="Nome"
                className="mt-2"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="directLastName">Sobrenome</Label>
              <Input
                id="directLastName"
                type="text"
                value={directLastName}
                onChange={(e) => setDirectLastName(e.target.value)}
                placeholder="Sobrenome"
                className="mt-2"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="directEmail">E-mail *</Label>
              <Input
                id="directEmail"
                type="email"
                value={directEmail}
                onChange={(e) => setDirectEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="mt-2"
                maxLength={255}
              />
            </div>

            <div>
              <Label htmlFor="directRole">Papel *</Label>
              <Select value={directRole} onValueChange={setDirectRole}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noiva">{t('roles.noiva')}</SelectItem>
                  <SelectItem value="noivo">{t('roles.noivo')}</SelectItem>
                  <SelectItem value="colaborador">{t('roles.colaborador')}</SelectItem>
                  <SelectItem value="celebrante">{t('roles.celebrante')}</SelectItem>
                  <SelectItem value="padrinho">{t('roles.padrinho')}</SelectItem>
                  <SelectItem value="madrinha">{t('roles.madrinha')}</SelectItem>
                  <SelectItem value="fotografo">{t('roles.fotografo')}</SelectItem>
                  <SelectItem value="organizador">{t('roles.organizador')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={addCollaboratorDirect}
              disabled={addingDirect || !directFirstName.trim() || !directEmail.trim()}
              className="w-full"
            >
              {addingDirect ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Collaborator Role Modal */}
      <Dialog open={!!editingCollaborator} onOpenChange={(open) => {
        if (!open) {
          setEditingCollaborator(null);
          setNewRole("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Editar Papel do Colaborador
            </DialogTitle>
            <DialogDescription>
              Altere o papel de {editingCollaborator?.profiles?.first_name} para dividir tarefas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="newRole">Novo Papel</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger id="newRole">
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="colaborador">{t('roles.colaborador')}</SelectItem>
                  <SelectItem value="padrinho">{t('roles.padrinho')}</SelectItem>
                  <SelectItem value="madrinha">{t('roles.madrinha')}</SelectItem>
                  <SelectItem value="fotografo">{t('roles.fotografo')}</SelectItem>
                  <SelectItem value="organizador">{t('roles.organizador')}</SelectItem>
                  <SelectItem value="convidado">{t('roles.convidado')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Apenas papéis de colaboradores regulares podem ser editados
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={updateCollaboratorRole}
                disabled={!newRole || newRole === editingCollaborator?.role}
                className="flex-1"
              >
                Salvar Alteração
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setEditingCollaborator(null);
                  setNewRole("");
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
