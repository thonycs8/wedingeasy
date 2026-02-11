import type { Side, AgeBand, Category, ConfirmationStatus } from './common.types';

// Tipo base do Guest alinhado com o schema Supabase
export interface Guest {
  id: string;
  user_id: string;
  wedding_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  category: Category | string;
  side: Side;
  age_band: AgeBand | string | null;
  confirmed: boolean;
  plus_one: boolean;
  table_number: number | null;
  dietary_restrictions: string | null;
  notes: string | null;
  special_role: string | null;
  relationship: string | null;
  printed_invitation: boolean;
  couple_pair_id: string | null;
  created_at: string;
  updated_at: string;
}

// Tipo para criação de Guest (sem campos automáticos)
export interface GuestCreate {
  user_id: string;
  wedding_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  category: Category | string;
  side?: Side;
  age_band?: AgeBand | string | null;
  confirmed?: boolean;
  plus_one?: boolean;
  table_number?: number | null;
  dietary_restrictions?: string | null;
  notes?: string | null;
  special_role?: string | null;
  relationship?: string | null;
  printed_invitation?: boolean;
}

// Tipo para atualização de Guest (campos parciais)
export interface GuestUpdate extends Partial<Omit<Guest, 'id' | 'user_id' | 'created_at' | 'updated_at'>> {
  id: string;
}

// Filtros para busca de guests
export interface GuestFilters {
  search?: string;
  category?: Category | string | 'all';
  side?: Side | 'all';
  confirmationStatus?: ConfirmationStatus;
  ageBand?: AgeBand | 'all';
  hasSpecialRole?: boolean;
}

// Estatísticas de guests
export interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  byCategory: Record<string, number>;
  bySide: {
    noivo: number;
    noiva: number;
    semLado: number;
  };
  byAgeBand: Record<AgeBand, number>;
  withPlusOne: number;
}

// Payload para bulk update
export interface GuestBulkUpdate {
  ids: string[];
  data: Partial<Omit<Guest, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
}

// Virtual guest (casal - não pode ser editado/deletado)
export interface VirtualGuest extends Omit<Guest, 'id'> {
  id: string;
  isVirtual: true;
  role: 'noivo' | 'noiva';
}

// Guest com flag de virtual
export type GuestWithVirtual = Guest | VirtualGuest;

// Helper para verificar se é virtual
export const isVirtualGuest = (guest: GuestWithVirtual): guest is VirtualGuest => {
  return 'isVirtual' in guest && guest.isVirtual === true;
};
