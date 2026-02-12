import { Edit, Trash2, Mail, Users, Crown, Heart, Music, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { LucideIcon } from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  category: string;
  confirmed: boolean;
  plus_one: boolean;
  special_role?: string[] | null;
  age_band?: string | null;
  printed_invitation?: boolean;
  side?: string | null;
}

interface GuestCardProps {
  guest: Guest;
  isSelected: boolean;
  isVirtual: boolean;
  onToggleConfirmation: () => void;
  onToggleSelection: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GuestCard({
  guest,
  isSelected,
  isVirtual,
  onToggleConfirmation,
  onToggleSelection,
  onEdit,
  onDelete
}: GuestCardProps) {
  const CategoryIcon = getCategoryIcon(guest.category);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 gap-3">
      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={guest.confirmed}
            onCheckedChange={onToggleConfirmation}
            disabled={isVirtual}
            className="mt-1"
          />
          <CategoryIcon className="w-5 h-5 text-primary flex-shrink-0" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium truncate">{guest.name}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Badge variant="secondary" className="text-xs shrink-0">
              {getCategoryLabel(guest.category)}
            </Badge>
            <Badge variant="outline" className="text-xs shrink-0">
              {getAgeBandLabel(guest.age_band)}
            </Badge>
            {guest.special_role && guest.special_role.length > 0 && guest.special_role.map(role => (
              <Badge
                key={role}
                variant={role === 'Noivo' || role === 'Noiva' ? 'couple' : 'outline'}
                className="text-xs shrink-0"
              >
                {getSpecialRoleLabel(role)}
              </Badge>
            ))}
            <div className="flex items-center gap-1 shrink-0">
              {guest.confirmed ? (
                <span className="text-success text-xs">Confirmado</span>
              ) : (
                <span className="text-muted-foreground text-xs">Pendente</span>
              )}
              {guest.plus_one && <span>+1</span>}
              {guest.printed_invitation && <span>📜</span>}
            </div>
          </div>
          {guest.email && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate mt-1">
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">{guest.email}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <div className="flex items-center gap-2 pr-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelection}
            disabled={isVirtual}
            aria-label="Selecionar convidado"
          />
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onEdit}
          disabled={isVirtual}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          disabled={isVirtual}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Helper functions
function getCategoryIcon(category: string): LucideIcon {
  switch (category) {
    case 'groomsmen':
    case 'bridesmaids':
      return Crown;
    case 'witnesses':
      return UserCheck;
    case 'officiant':
    case 'pastor':
      return Heart;
    case 'musicians':
      return Music;
    case 'honor_guests':
      return Sparkles;
    default:
      return Users;
  }
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    family: 'Família',
    friends: 'Amigos',
    work: 'Trabalho',
    other: 'Outros',
    groomsmen: 'Padrinhos do Noivo',
    bridesmaids: 'Madrinhas da Noiva',
    groomsman_friends: 'Amigos do Noivo',
    bridesmaid_friends: 'Amigas da Noiva',
    witnesses: 'Testemunhas',
    officiant: 'Celebrante',
    pastor: 'Pastor',
    musicians: 'Músicos',
    honor_guests: 'Convidados de Honra'
  };
  return labels[category] || category;
}

function getAgeBandLabel(ageBand?: string | null): string {
  switch (ageBand) {
    case '0_4':
      return 'Bebés (0–4)';
    case '5_10':
      return 'Crianças (5–10)';
    case '11_plus':
      return 'Adolescentes (11+)';
    case 'adult':
    default:
      return 'Adultos';
  }
}

function getSpecialRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    best_man: 'Padrinho de Casamento',
    maid_of_honor: 'Madrinha de Casamento',
    groomsman: 'Padrinho',
    bridesmaid: 'Madrinha',
    witness: 'Testemunha',
    officiant: 'Celebrante',
    pastor: 'Pastor',
    musician: 'Músico',
    honor_guest: 'Convidado de Honra',
    flower_girl: 'Menina das Flores',
    ring_bearer: 'Menino das Alianças',
    reader: 'Leitor',
    usher: 'Recepcionista',
    Noivo: 'Noivo',
    Noiva: 'Noiva'
  };
  return labels[role] || role;
}

// Export helpers for use elsewhere
export { getCategoryIcon, getCategoryLabel, getAgeBandLabel, getSpecialRoleLabel };
