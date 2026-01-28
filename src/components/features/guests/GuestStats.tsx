import { Badge } from '@/components/ui/badge';

interface AgeBandStats {
  total: number;
  babies: number;
  children: number;
  teens: number;
  adults: number;
}

interface GuestStatsProps {
  totalGuests: number;
  confirmedGuests: number;
  withPlusOne: number;
  specialRoles: number;
  groomStats: AgeBandStats;
  brideStats: AgeBandStats;
}

export function GuestStats({
  totalGuests,
  confirmedGuests,
  withPlusOne,
  specialRoles,
  groomStats,
  brideStats
}: GuestStatsProps) {
  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="text-center p-2">
          <p className="text-xl sm:text-2xl font-bold text-primary truncate">{totalGuests}</p>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">Total</p>
        </div>
        <div className="text-center p-2">
          <p className="text-xl sm:text-2xl font-bold text-success truncate">{confirmedGuests}</p>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">Confirmados</p>
        </div>
        <div className="text-center p-2">
          <p className="text-xl sm:text-2xl font-bold text-warning truncate">{withPlusOne}</p>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">Com Acompanhante</p>
        </div>
        <div className="text-center p-2">
          <p className="text-xl sm:text-2xl font-bold text-info truncate">{specialRoles}</p>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">Funções Especiais</p>
        </div>
      </div>

      {/* Side + Age breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <SideBreakdown title="Lado do Noivo" stats={groomStats} />
        <SideBreakdown title="Lado da Noiva" stats={brideStats} />
      </div>
    </div>
  );
}

function SideBreakdown({ title, stats }: { title: string; stats: AgeBandStats }) {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary">{stats.total}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
        <div className="flex items-center justify-between gap-2">
          <span>Bebés (0–4)</span>
          <span className="font-medium text-foreground">{stats.babies}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Crianças (5–10)</span>
          <span className="font-medium text-foreground">{stats.children}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Adolescentes (11+)</span>
          <span className="font-medium text-foreground">{stats.teens}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Adultos</span>
          <span className="font-medium text-foreground">{stats.adults}</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate age band stats
export function calculateAgeBandStats(guests: Array<{ age_band?: string | null }>): AgeBandStats {
  const normalized = guests.map((g) => ({ 
    ...g, 
    age_band: (g.age_band || 'adult') as string 
  }));
  
  return {
    total: normalized.length,
    babies: normalized.filter((g) => g.age_band === '0_4').length,
    children: normalized.filter((g) => g.age_band === '5_10').length,
    teens: normalized.filter((g) => g.age_band === '11_plus').length,
    adults: normalized.filter((g) => g.age_band === 'adult').length,
  };
}
