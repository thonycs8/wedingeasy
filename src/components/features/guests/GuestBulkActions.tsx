import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface GuestBulkActionsProps {
  selectedCount: number;
  onSelectFiltered: () => void;
  onSelectUnassigned: () => void;
  onClearSelection: () => void;
  onBulkUpdate: (data: BulkUpdateData) => void;
  onBulkDelete: () => void;
}

export interface BulkUpdateData {
  side?: 'noivo' | 'noiva' | null;
  category?: string;
  age_band?: string | null;
}

export function GuestBulkActions({
  selectedCount,
  onSelectFiltered,
  onSelectUnassigned,
  onClearSelection,
  onBulkUpdate,
  onBulkDelete
}: GuestBulkActionsProps) {
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState('');
  
  const [bulkEditSide, setBulkEditSide] = useState<'noivo' | 'noiva' | 'none' | ''>('');
  const [bulkEditCategory, setBulkEditCategory] = useState('');
  const [bulkEditAgeBand, setBulkEditAgeBand] = useState('');

  const handleBulkUpdate = () => {
    const data: BulkUpdateData = {};
    if (bulkEditSide) data.side = bulkEditSide === 'none' ? null : bulkEditSide;
    if (bulkEditCategory) data.category = bulkEditCategory;
    if (bulkEditAgeBand) data.age_band = bulkEditAgeBand;

    onBulkUpdate(data);
    resetBulkEdit();
  };

  const handleBulkDelete = () => {
    if (bulkDeleteConfirmText.trim().toUpperCase() !== 'APAGAR') return;
    onBulkDelete();
    resetBulkDelete();
  };

  const resetBulkEdit = () => {
    setIsBulkEditOpen(false);
    setBulkEditSide('');
    setBulkEditCategory('');
    setBulkEditAgeBand('');
  };

  const resetBulkDelete = () => {
    setIsBulkDeleteOpen(false);
    setBulkDeleteConfirmText('');
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        {/* Selection buttons - always visible */}
        <Button size="sm" variant="outline" onClick={onSelectFiltered}>
          Selecionar filtrados
        </Button>
        <Button size="sm" variant="outline" onClick={onSelectUnassigned}>
          Selecionar sem lado
        </Button>

        {/* Actions - only visible when items selected */}
        {selectedCount > 0 && (
          <>
            <Badge variant="secondary">Selecionados: {selectedCount}</Badge>
            <Button size="sm" variant="outline" onClick={() => setIsBulkEditOpen(true)}>
              Atualizar selecionados
            </Button>
            <Button size="sm" variant="outline" onClick={onClearSelection}>
              Limpar
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setIsBulkDeleteOpen(true)}>
              Excluir selecionados
            </Button>
          </>
        )}
      </div>

      {/* Bulk Edit Dialog */}
      <Dialog open={isBulkEditOpen} onOpenChange={(open) => !open && resetBulkEdit()}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Atualizar em massa</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Atualizar <strong>{selectedCount}</strong> convidado(s). Campos vazios não serão alterados.
            </p>

            <div className="space-y-2">
              <Label>Lado</Label>
              <Select value={bulkEditSide} onValueChange={(v) => setBulkEditSide(v as typeof bulkEditSide)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Manter como está" />
                </SelectTrigger>
                <SelectContent className="bg-background z-[100]">
                  <SelectItem value="noivo">Noivo</SelectItem>
                  <SelectItem value="noiva">Noiva</SelectItem>
                  <SelectItem value="none">Sem lado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={bulkEditCategory} onValueChange={setBulkEditCategory}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Manter como está" />
                </SelectTrigger>
                <SelectContent className="bg-background z-[100]">
                  <SelectItem value="family">Família</SelectItem>
                  <SelectItem value="friends">Amigos</SelectItem>
                  <SelectItem value="work">Trabalho</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                  <SelectItem value="groomsmen">Padrinhos do Noivo</SelectItem>
                  <SelectItem value="bridesmaids">Madrinhas da Noiva</SelectItem>
                  <SelectItem value="groomsman_friends">Amigos do Noivo</SelectItem>
                  <SelectItem value="bridesmaid_friends">Amigas da Noiva</SelectItem>
                  <SelectItem value="witnesses">Testemunhas</SelectItem>
                  <SelectItem value="officiant">Celebrante</SelectItem>
                  <SelectItem value="pastor">Pastor</SelectItem>
                  <SelectItem value="musicians">Músicos</SelectItem>
                  <SelectItem value="honor_guests">Convidados de Honra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Faixa etária</Label>
              <Select value={bulkEditAgeBand} onValueChange={setBulkEditAgeBand}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Manter como está" />
                </SelectTrigger>
                <SelectContent className="bg-background z-[100]">
                  <SelectItem value="0_4">Bebés (0–4)</SelectItem>
                  <SelectItem value="5_10">Crianças (5–10)</SelectItem>
                  <SelectItem value="11_plus">Adolescentes (11+)</SelectItem>
                  <SelectItem value="adult">Adultos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={resetBulkEdit}>
                Cancelar
              </Button>
              <Button className="btn-gradient" onClick={handleBulkUpdate}>
                Aplicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={isBulkDeleteOpen} onOpenChange={(open) => !open && resetBulkDelete()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir em massa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Você está prestes a excluir <strong>{selectedCount}</strong> convidado(s). Esta ação não pode ser desfeita.
            </p>
            <div className="space-y-2">
              <Label htmlFor="bulk-delete-confirm">Digite <strong>APAGAR</strong> para confirmar</Label>
              <Input
                id="bulk-delete-confirm"
                value={bulkDeleteConfirmText}
                onChange={(e) => setBulkDeleteConfirmText(e.target.value)}
                placeholder="APAGAR"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetBulkDelete}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleBulkDelete}
                disabled={bulkDeleteConfirmText.trim().toUpperCase() !== 'APAGAR'}
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
