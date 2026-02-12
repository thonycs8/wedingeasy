import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { User, Mail, Phone, Loader2, Heart, LogOut as LeaveIcon, Plus, X, Trash2, CreditCard, Receipt, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/i18n";
import { useSettings } from "@/contexts/SettingsContext";

// Validation schemas
const nameSchema = z.string().trim().min(1, 'Nome não pode estar vazio').max(100, 'Nome muito longo');
const emailSchema = z.string().trim().email('Email inválido').max(255, 'Email muito longo');
const phoneSchema = z.string().trim().regex(/^[\d\s\-\+\(\)]*$/, 'Telefone inválido').max(20, 'Telefone muito longo').optional().or(z.literal(''));
// Accept legacy (WEPLAN-XXXXXX) and hardened codes (WEPLAN-<16+ chars>)
const eventCodeSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine((v) => /^WEPLAN-[A-Z0-9]{6,32}$/.test(v), {
    message: 'Código inválido. Formato: WEPLAN-ABC123',
  });

const profileSchema = z.object({
  firstName: nameSchema,
  lastName: z.string().max(100, 'Sobrenome muito longo').optional().or(z.literal('')),
  email: emailSchema,
  phone: phoneSchema
});

interface WeddingEvent {
  id: string;
  event_code: string;
  couple_name: string | null;
  partner_name: string | null;
  wedding_date: string | null;
  role: string;
  is_owner: boolean;
}

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfile = ({ open, onOpenChange }: UserProfileProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currency } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [eventCode, setEventCode] = useState("");
  const [joiningEvent, setJoiningEvent] = useState(false);

  // Billing state
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [billingAddress, setBillingAddress] = useState({ street: "", city: "", postal_code: "", country: "PT" });
  const [savingBilling, setSavingBilling] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadProfile();
      loadEvents();
      loadBilling();
      loadPayments();
    }
  }, [open, user]);

  const loadBilling = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('billing_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setBillingName(data.billing_name || '');
        setBillingEmail(data.billing_email || '');
        setTaxId(data.tax_id || '');
        const addr = (data.billing_address as any) || {};
        setBillingAddress({ street: addr.street || '', city: addr.city || '', postal_code: addr.postal_code || '', country: addr.country || 'PT' });
      }
    } catch (e) {
      console.error('Error loading billing:', e);
    }
  };

  const saveBilling = async () => {
    if (!user) return;
    setSavingBilling(true);
    try {
      const { error } = await supabase.from('billing_profiles').upsert({
        user_id: user.id,
        billing_name: billingName.trim() || null,
        billing_email: billingEmail.trim() || null,
        tax_id: taxId.trim() || null,
        billing_address: billingAddress,
      }, { onConflict: 'user_id' });

      if (error) throw error;
      toast({ title: 'Dados de faturação salvos' });
    } catch (e) {
      console.error('Error saving billing:', e);
      toast({ title: 'Erro', description: 'Erro ao salvar dados de faturação', variant: 'destructive' });
    } finally {
      setSavingBilling(false);
    }
  };

  const loadPayments = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setPayments(data || []);
    } catch (e) {
      console.error('Error loading payments:', e);
    }
  };

  const openCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-billing');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (e) {
      console.error('Portal error:', e);
      toast({ title: 'Erro', description: 'Não foi possível abrir o portal de pagamento', variant: 'destructive' });
    } finally {
      setPortalLoading(false);
    }
  };

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmail(data.email || user.email || '');
        setPhone(data.phone || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: t('common.error'),
        description: 'Erro ao carregar perfil',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    // Validate all fields
    try {
      profileSchema.parse({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim()
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
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: t('common.error'),
        description: 'Erro ao salvar perfil',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const loadEvents = async () => {
    if (!user) return;

    try {
      // Get weddings where user is owner
      const { data: ownedWeddings } = await supabase
        .from('wedding_data')
        .select('id, event_code, couple_name, partner_name, wedding_date')
        .eq('user_id', user.id);

      // Get weddings where user is collaborator
      const { data: collaborations } = await supabase
        .from('wedding_collaborators')
        .select(`
          role,
          wedding_data:wedding_id (
            id,
            event_code,
            couple_name,
            partner_name,
            wedding_date
          )
        `)
        .eq('user_id', user.id);

      const allEvents: WeddingEvent[] = [];

      // Add owned weddings
      if (ownedWeddings) {
        ownedWeddings.forEach((wedding: any) => {
          allEvents.push({
            id: wedding.id,
            event_code: wedding.event_code,
            couple_name: wedding.couple_name,
            partner_name: wedding.partner_name,
            wedding_date: wedding.wedding_date,
            role: 'owner',
            is_owner: true
          });
        });
      }

      // Add collaborations
      if (collaborations) {
        collaborations.forEach((collab: any) => {
          if (collab.wedding_data) {
            allEvents.push({
              id: collab.wedding_data.id,
              event_code: collab.wedding_data.event_code,
              couple_name: collab.wedding_data.couple_name,
              partner_name: collab.wedding_data.partner_name,
              wedding_date: collab.wedding_data.wedding_date,
              role: collab.role,
              is_owner: false
            });
          }
        });
      }

      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const joinEvent = async () => {
    try {
      eventCodeSchema.parse(eventCode);
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

    setJoiningEvent(true);
    try {
      // Find wedding by event code
      const { data: wedding, error: weddingError } = await supabase
        .from('wedding_data')
        .select('id, event_code')
        .eq('event_code', eventCode.trim().toUpperCase())
        .maybeSingle();

      if (weddingError || !wedding) {
        toast({
          title: t('common.error'),
          description: 'Código do evento inválido',
          variant: "destructive",
        });
        return;
      }

      // Check if already a collaborator
      const { data: existingCollab } = await supabase
        .from('wedding_collaborators')
        .select('id')
        .eq('wedding_id', wedding.id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existingCollab) {
        toast({
          title: "Já participa",
          description: "Você já faz parte deste evento",
        });
        return;
      }

      // Add as collaborator
      const { error: collabError } = await supabase
        .from('wedding_collaborators')
        .insert({
          wedding_id: wedding.id,
          user_id: user?.id,
          role: 'colaborador'
        });

      if (collabError) throw collabError;

      toast({
        title: "Entrou no evento",
        description: "Você agora faz parte deste evento",
      });

      setEventCode("");
      loadEvents();
    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: t('common.error'),
        description: 'Erro ao entrar no evento',
        variant: "destructive",
      });
    } finally {
      setJoiningEvent(false);
    }
  };

  const leaveEvent = async (eventId: string, isOwner: boolean) => {
    if (isOwner) {
      toast({
        title: t('common.error'),
        description: 'Você não pode sair do seu próprio evento',
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Tem certeza que deseja sair deste evento?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('wedding_collaborators')
        .delete()
        .eq('wedding_id', eventId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Saiu do evento",
        description: "Você não faz mais parte deste evento",
      });

      loadEvents();
    } catch (error) {
      console.error('Error leaving event:', error);
      toast({
        title: t('common.error'),
        description: 'Erro ao sair do evento',
        variant: "destructive",
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Tem certeza que deseja apagar este evento? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('wedding_data')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Evento apagado",
        description: "O evento foi removido com sucesso",
      });

      loadEvents();
      
      // Reload page if this was the current wedding
      window.location.reload();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: t('common.error'),
        description: 'Erro ao apagar evento',
        variant: "destructive",
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] p-4 max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <CardTitle>Meu Perfil</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              Gerencie suas informações pessoais e eventos
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Personal Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Seu nome"
                          className="pl-9"
                          maxLength={100}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Seu sobrenome"
                          className="pl-9"
                          maxLength={100}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="pl-9"
                        maxLength={255}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+351 912 345 678"
                        className="pl-9"
                        maxLength={20}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={saveProfile}
                    disabled={saving || !firstName.trim() || !email.trim()}
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Perfil'
                    )}
                  </Button>
                </div>

                <Separator />

                {/* Billing Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Dados de Faturação
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome de Faturação</Label>
                      <Input value={billingName} onChange={(e) => setBillingName(e.target.value)} placeholder="Nome completo ou empresa" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email de Faturação</Label>
                      <Input type="email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} placeholder="faturacao@email.com" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>NIF / VAT</Label>
                      <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="123456789" />
                    </div>
                    <div className="space-y-2">
                      <Label>País</Label>
                      <Input value={billingAddress.country} onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))} placeholder="PT" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Morada</Label>
                    <Input value={billingAddress.street} onChange={(e) => setBillingAddress(prev => ({ ...prev, street: e.target.value }))} placeholder="Rua, número" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input value={billingAddress.city} onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))} placeholder="Lisboa" />
                    </div>
                    <div className="space-y-2">
                      <Label>Código Postal</Label>
                      <Input value={billingAddress.postal_code} onChange={(e) => setBillingAddress(prev => ({ ...prev, postal_code: e.target.value }))} placeholder="1000-001" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveBilling} disabled={savingBilling} className="flex-1">
                      {savingBilling ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                      Salvar Faturação
                    </Button>
                    <Button variant="outline" onClick={openCustomerPortal} disabled={portalLoading}>
                      {portalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ExternalLink className="w-4 h-4 mr-1" />}
                      Gerir Pagamentos
                    </Button>
                  </div>

                  {/* Payment History */}
                  {payments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Histórico de Pagamentos
                      </h4>
                      <div className="space-y-1">
                        {payments.map((p) => (
                          <div key={p.id} className="flex justify-between items-center text-sm p-2 rounded border">
                            <div>
                              <span className="font-medium">{p.description || p.payment_type}</span>
                              <span className="text-muted-foreground ml-2">
                                {new Date(p.created_at).toLocaleDateString('pt-PT')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatCurrency(p.amount, currency)}</span>
                              <Badge variant={p.status === 'succeeded' ? 'default' : 'secondary'} className="text-[10px]">
                                {p.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Events Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Meus Eventos ({events.length})
                  </h3>

                  {/* Join Event */}
                  <div className="space-y-2">
                    <Label htmlFor="eventCode">Entrar em Evento com Código</Label>
                    <div className="flex gap-2">
                      <Input
                        id="eventCode"
                        type="text"
                        value={eventCode}
                        onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                        placeholder="WEPLAN-XXXXXX"
                        maxLength={50}
                      />
                      <Button
                        onClick={joinEvent}
                        disabled={joiningEvent || !eventCode.trim()}
                        className="shrink-0"
                      >
                        {joiningEvent ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Events List */}
                  <div className="space-y-2">
                    {events.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Você ainda não faz parte de nenhum evento
                      </p>
                    ) : (
                      events.map((event) => (
                        <Card key={event.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium truncate">
                                    {event.partner_name && event.couple_name
                                      ? `${event.partner_name} & ${event.couple_name}`
                                      : 'Casamento'}
                                  </p>
                                  <Badge variant={event.is_owner ? 'default' : 'secondary'} className="shrink-0">
                                    {event.is_owner ? 'Organizador' : t(`roles.${event.role}`)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Código: {event.event_code}
                                </p>
                                {event.wedding_date && (
                                  <p className="text-sm text-muted-foreground">
                                    Data: {new Date(event.wedding_date).toLocaleDateString('pt-PT')}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                {!event.is_owner ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => leaveEvent(event.id, event.is_owner)}
                                    title="Sair do evento"
                                  >
                                    <LeaveIcon className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteEvent(event.id)}
                                    title="Apagar evento"
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};