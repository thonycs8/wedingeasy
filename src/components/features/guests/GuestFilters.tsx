import { Search, Filter, Users, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type FilterSide = 'all' | 'noivo' | 'noiva' | 'none';
export type FilterStatus = 'all' | 'confirmed' | 'pending';

interface GuestFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  filterSide: FilterSide;
  onSideChange: (value: FilterSide) => void;
  filterStatus: FilterStatus;
  onStatusChange: (value: FilterStatus) => void;
}

export function GuestFilters({
  searchTerm,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterSide,
  onSideChange,
  filterStatus,
  onStatusChange
}: GuestFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar convidados..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-64"
        />
      </div>

      {/* Category Filter */}
      <Select value={filterCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-40 bg-background">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent className="bg-background z-[100]">
          <SelectItem value="all">Todas categorias</SelectItem>
          <SelectItem value="family">Família</SelectItem>
          <SelectItem value="friends">Amigos</SelectItem>
          <SelectItem value="work">Trabalho</SelectItem>
          <SelectItem value="groomsmen">Padrinhos do Noivo</SelectItem>
          <SelectItem value="bridesmaids">Madrinhas da Noiva</SelectItem>
          <SelectItem value="witnesses">Testemunhas</SelectItem>
          <SelectItem value="officiant">Celebrante</SelectItem>
          <SelectItem value="musicians">Músicos</SelectItem>
          <SelectItem value="honor_guests">Convidados de Honra</SelectItem>
        </SelectContent>
      </Select>

      {/* Side Filter */}
      <Select value={filterSide} onValueChange={(v) => onSideChange(v as FilterSide)}>
        <SelectTrigger className="w-36 bg-background">
          <Users className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Lado" />
        </SelectTrigger>
        <SelectContent className="bg-background z-[100]">
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="noivo">Noivo</SelectItem>
          <SelectItem value="noiva">Noiva</SelectItem>
          <SelectItem value="none">Sem lado</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={filterStatus} onValueChange={(v) => onStatusChange(v as FilterStatus)}>
        <SelectTrigger className="w-44 bg-background">
          <UserCheck className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Confirmação" />
        </SelectTrigger>
        <SelectContent className="bg-background z-[100]">
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="confirmed">Confirmados</SelectItem>
          <SelectItem value="pending">Não confirmados</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
