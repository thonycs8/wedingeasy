import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Check, 
  CheckCheck,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'reminder' | 'success';
  read: boolean;
  scheduled_for?: string;
  created_at: string;
}

export const NotificationCenter = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [isAddingNotification, setIsAddingNotification] = useState(false);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'reminder' as Notification['type'],
    scheduled_for: ''
  });

  useEffect(() => {
    if (user) {
      loadNotifications();
      createDefaultNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data || []).map(notification => ({
        ...notification,
        type: notification.type as Notification['type']
      })));
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultNotifications = async () => {
    try {
      // Check if user already has notifications
      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1);

      if (existingNotifications && existingNotifications.length > 0) return;

      // Create default notifications
      const defaultNotifications = [
        {
          title: "Bem-vindo ao Eternal Knot! 💕",
          message: "Parabéns por começar a planear o seu casamento connosco! Vamos ajudá-lo a criar o dia perfeito.",
          type: "success" as const,
          user_id: user?.id
        },
        {
          title: "Lembrete: Lista de Convidados 📝",
          message: "Não se esqueça de finalizar a sua lista de convidados para ter uma estimativa precisa dos custos.",
          type: "reminder" as const,
          user_id: user?.id,
          scheduled_for: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        },
        {
          title: "Dica: Orçamento 💰",
          message: "Defina um orçamento realista e acompanhe os gastos para evitar surpresas. Use a nossa ferramenta de gestão de orçamento!",
          type: "info" as const,
          user_id: user?.id
        },
        {
          title: "Importante: Documentação 📋",
          message: "Comece a reunir os documentos necessários para o casamento com antecedência. Cada região pode ter requisitos diferentes.",
          type: "warning" as const,
          user_id: user?.id
        }
      ];

      const { error } = await supabase
        .from('notifications')
        .insert(defaultNotifications);

      if (error) throw error;

      // Reload notifications
      loadNotifications();
    } catch (error) {
      console.error('Error creating default notifications:', error);
    }
  };

  const addNotification = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      toast({
        title: "Erro",
        description: "Título e mensagem são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const notificationData = {
        ...newNotification,
        user_id: user?.id,
        scheduled_for: newNotification.scheduled_for || null
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;

      setNotifications([{ ...data, type: data.type as Notification['type'] }, ...notifications]);
      setNewNotification({
        title: '',
        message: '',
        type: 'reminder',
        scheduled_for: ''
      });
      setIsAddingNotification(false);
      
      toast({
        title: "Sucesso",
        description: "Notificação criada com sucesso!",
      });
    } catch (error) {
      console.error('Error adding notification:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a notificação.",
        variant: "destructive"
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(notifications.map(n => ({ ...n, read: true })));
      
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(notifications.filter(n => n.id !== notificationId));
      
      toast({
        title: "Sucesso",
        description: "Notificação removida com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a notificação.",
        variant: "destructive"
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'success':
        return <CheckCheck className="w-5 h-5 text-green-500" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-orange-100 text-orange-800',
      success: 'bg-green-100 text-green-800',
      reminder: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      info: 'Info',
      warning: 'Aviso',
      success: 'Sucesso',
      reminder: 'Lembrete'
    };
    return labels[type as keyof typeof labels] || 'Info';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    if (filter !== 'all') return notification.type === filter;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">A carregar notificações...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <CardTitle>Central de Notificações</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount}</Badge>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Marcar Todas como Lidas
                </Button>
              )}
              <Dialog open={isAddingNotification} onOpenChange={setIsAddingNotification}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Notificação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Notificação</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                        placeholder="Título da notificação"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Mensagem *</Label>
                      <Textarea
                        id="message"
                        value={newNotification.message}
                        onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                        placeholder="Mensagem da notificação"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Tipo</Label>
                        <Select value={newNotification.type} onValueChange={(value: Notification['type']) => setNewNotification({ ...newNotification, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warning">Aviso</SelectItem>
                            <SelectItem value="success">Sucesso</SelectItem>
                            <SelectItem value="reminder">Lembrete</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="scheduled">Agendar Para</Label>
                        <Input
                          id="scheduled"
                          type="datetime-local"
                          value={newNotification.scheduled_for}
                          onChange={(e) => setNewNotification({ ...newNotification, scheduled_for: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingNotification(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={addNotification}>
                        Criar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Não Lidas ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
            >
              Lidas
            </Button>
            <Button
              variant={filter === 'reminder' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('reminder')}
            >
              Lembretes
            </Button>
            <Button
              variant={filter === 'warning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('warning')}
            >
              Avisos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma notificação encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? "Não há notificações para mostrar."
                  : `Não há notificações ${filter === 'unread' ? 'não lidas' : filter === 'read' ? 'lidas' : `do tipo ${filter}`}.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card key={notification.id} className={`border-l-4 ${
              notification.type === 'warning' ? 'border-l-orange-500' :
              notification.type === 'success' ? 'border-l-green-500' :
              notification.type === 'reminder' ? 'border-l-purple-500' : 'border-l-blue-500'
            } ${!notification.read ? 'bg-muted/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(notification.type)}
                      <h3 className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h3>
                      <Badge className={getTypeColor(notification.type)}>
                        {getTypeLabel(notification.type)}
                      </Badge>
                      {!notification.read && (
                        <Badge variant="destructive" className="text-xs">
                          Nova
                        </Badge>
                      )}
                    </div>
                    <p className={`mb-3 ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(notification.created_at).toLocaleDateString('pt-PT')}
                      </div>
                      {notification.scheduled_for && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Agendado para: {new Date(notification.scheduled_for).toLocaleDateString('pt-PT')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        title="Marcar como lida"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Remover notificação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};