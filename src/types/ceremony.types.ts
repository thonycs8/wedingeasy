import type { Side } from './common.types';

// Papéis especiais permitidos (alinhado com constraint do DB)
export const SPECIAL_ROLES = [
  'Padrinho',
  'Madrinha',
  'Dama de Honor',
  'Pajem',
  'Florista',
  'Portador das Alianças',
  'Amigo(a) do Noivo/Noiva',
  'Convidado de Honra',
  'Pais (Pai/Mãe)',
  'Celebrante',
  'Irmão(ã)'
] as const;

export type SpecialRole = typeof SPECIAL_ROLES[number];

// Papéis que requerem seleção manual de lado
export const ROLES_REQUIRING_SIDE: SpecialRole[] = [
  'Padrinho',
  'Madrinha',
  'Irmão(ã)'
];

// Tipo para papel de cerimónia (baseado em Guest com special_role)
export interface CeremonyRole {
  id: string;
  guestId: string;
  guestName: string;
  role: SpecialRole | string;
  side: Side;
  notes: string | null;
  confirmed: boolean;
  // Campos extras do guest para exibição
  email?: string | null;
  phone?: string | null;
}

// Tipo para atribuição de papel
export interface CeremonyRoleAssignment {
  guestId: string;
  role: SpecialRole | string;
  side?: Side;
}

// Filtros para cerimónia
export interface CeremonyFilters {
  search?: string;
  role?: SpecialRole | string | 'all';
  side?: Side | 'all';
  confirmed?: boolean | 'all';
}

// Estatísticas de cerimónia
export interface CeremonyStats {
  totalRoles: number;
  confirmed: number;
  pending: number;
  bySide: {
    noivo: number;
    noiva: number;
    semLado: number;
  };
  byRole: Record<string, number>;
}

// Papel virtual (casal)
export interface VirtualCeremonyRole extends CeremonyRole {
  isVirtual: true;
  coupleRole: 'noivo' | 'noiva';
}

// Helper para verificar se requer lado
export const roleRequiresSide = (role: string): boolean => {
  return ROLES_REQUIRING_SIDE.includes(role as SpecialRole);
};

// Labels para papéis
export const SPECIAL_ROLE_LABELS: Record<SpecialRole, string> = {
  'Padrinho': 'Padrinho',
  'Madrinha': 'Madrinha',
  'Dama de Honor': 'Dama de Honor',
  'Pajem': 'Pajem',
  'Florista': 'Florista',
  'Portador das Alianças': 'Portador das Alianças',
  'Amigo(a) do Noivo/Noiva': 'Amigo(a) do Noivo/Noiva',
  'Convidado de Honra': 'Convidado de Honra',
  'Pais (Pai/Mãe)': 'Pais (Pai/Mãe)',
  'Celebrante': 'Celebrante',
  'Irmão(ã)': 'Irmão(ã)'
};
