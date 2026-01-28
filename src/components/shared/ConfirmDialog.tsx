import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  /** Controla se o dialog está aberto */
  open: boolean;
  /** Callback quando o estado muda */
  onOpenChange: (open: boolean) => void;
  /** Título do dialog */
  title: string;
  /** Descrição/mensagem do dialog */
  description: string;
  /** Texto do botão de confirmação */
  confirmLabel?: string;
  /** Texto do botão de cancelar */
  cancelLabel?: string;
  /** Callback de confirmação */
  onConfirm: () => void;
  /** Callback de cancelamento */
  onCancel?: () => void;
  /** Variante visual do botão de confirmação */
  variant?: 'default' | 'destructive';
  /** Se true, requer digitação de texto para confirmar */
  requireConfirmText?: string;
  /** Placeholder do input de confirmação */
  confirmPlaceholder?: string;
  /** Se está a processar (loading) */
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'default',
  requireConfirmText,
  confirmPlaceholder,
  isLoading = false
}: ConfirmDialogProps) {
  const [confirmInput, setConfirmInput] = useState('');

  const isConfirmEnabled = !requireConfirmText || confirmInput === requireConfirmText;

  const handleConfirm = () => {
    if (isConfirmEnabled) {
      onConfirm();
      setConfirmInput('');
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
    setConfirmInput('');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {requireConfirmText && (
          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-input" className="text-sm text-muted-foreground">
              Digite <span className="font-mono font-bold text-foreground">{requireConfirmText}</span> para confirmar
            </Label>
            <Input
              id="confirm-input"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={confirmPlaceholder || requireConfirmText}
              className={cn(
                confirmInput && confirmInput !== requireConfirmText && 'border-destructive'
              )}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmEnabled || isLoading}
            className={cn(
              variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            )}
          >
            {isLoading ? 'A processar...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Variante para exclusão
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  itemCount,
  onConfirm,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
  itemCount?: number;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  const isBulk = itemCount && itemCount > 1;
  
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isBulk ? `Apagar ${itemCount} itens` : 'Apagar item'}
      description={
        isBulk
          ? `Tem a certeza que deseja apagar ${itemCount} itens? Esta ação não pode ser desfeita.`
          : itemName
            ? `Tem a certeza que deseja apagar "${itemName}"? Esta ação não pode ser desfeita.`
            : 'Tem a certeza que deseja apagar este item? Esta ação não pode ser desfeita.'
      }
      confirmLabel="Apagar"
      variant="destructive"
      requireConfirmText="APAGAR"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}

// Variante para saída/descarte
export function DiscardConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Descartar alterações"
      description="Tem alterações não guardadas. Tem a certeza que deseja sair sem guardar?"
      confirmLabel="Descartar"
      cancelLabel="Continuar a editar"
      variant="destructive"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
