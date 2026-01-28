import { LucideIcon, Inbox, Users, Calendar, DollarSign, Bell, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Título do estado vazio */
  title: string;
  /** Descrição adicional */
  description?: string;
  /** Ícone a exibir */
  icon?: LucideIcon;
  /** Texto do botão de ação */
  actionLabel?: string;
  /** Callback do botão de ação */
  onAction?: () => void;
  /** Classes CSS adicionais */
  className?: string;
  /** Variante visual */
  variant?: 'default' | 'compact';
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className,
  variant = 'default'
}: EmptyStateProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-6 text-center', className)}>
        <Icon className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">{title}</p>
        {actionLabel && onAction && (
          <Button variant="link" size="sm" onClick={onAction} className="mt-1">
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Variantes pré-configuradas para features específicas
export function EmptyGuests({ onAction, className }: { onAction?: () => void; className?: string }) {
  return (
    <EmptyState
      title="Nenhum convidado encontrado"
      description="Adicione convidados para começar a gerir a sua lista."
      icon={Users}
      actionLabel="Adicionar Convidado"
      onAction={onAction}
      className={className}
    />
  );
}

export function EmptyTimeline({ onAction, className }: { onAction?: () => void; className?: string }) {
  return (
    <EmptyState
      title="Nenhuma tarefa encontrada"
      description="Crie tarefas para organizar o planeamento do seu casamento."
      icon={Calendar}
      actionLabel="Adicionar Tarefa"
      onAction={onAction}
      className={className}
    />
  );
}

export function EmptyBudget({ onAction, className }: { onAction?: () => void; className?: string }) {
  return (
    <EmptyState
      title="Nenhuma categoria encontrada"
      description="Crie categorias para organizar o seu orçamento."
      icon={DollarSign}
      actionLabel="Adicionar Categoria"
      onAction={onAction}
      className={className}
    />
  );
}

export function EmptyNotifications({ className }: { className?: string }) {
  return (
    <EmptyState
      title="Sem notificações"
      description="Está tudo em dia! Não há notificações novas."
      icon={Bell}
      className={className}
      variant="compact"
    />
  );
}

export function EmptySearch({ searchTerm, className }: { searchTerm?: string; className?: string }) {
  return (
    <EmptyState
      title="Nenhum resultado encontrado"
      description={searchTerm ? `Não foram encontrados resultados para "${searchTerm}".` : 'Tente ajustar os seus filtros.'}
      icon={FileText}
      className={className}
      variant="compact"
    />
  );
}
