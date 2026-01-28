import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  /** Tipo de loading: spinner ou skeleton */
  variant?: 'spinner' | 'skeleton';
  /** Texto a exibir durante o loading */
  text?: string;
  /** Número de linhas de skeleton */
  skeletonLines?: number;
  /** Classes CSS adicionais */
  className?: string;
  /** Tamanho do spinner */
  size?: 'sm' | 'md' | 'lg';
}

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

export function LoadingState({
  variant = 'spinner',
  text,
  skeletonLines = 3,
  className,
  size = 'md'
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: skeletonLines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              'h-4',
              i === 0 && 'w-3/4',
              i === 1 && 'w-full',
              i === 2 && 'w-1/2',
              i > 2 && 'w-full'
            )} 
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-8', className)}>
      <Loader2 className={cn('animate-spin text-muted-foreground', spinnerSizes[size])} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

// Variantes pré-configuradas para uso comum
export function LoadingSpinner({ className }: { className?: string }) {
  return <LoadingState variant="spinner" className={className} />;
}

export function LoadingSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return <LoadingState variant="skeleton" skeletonLines={lines} className={className} />;
}

// Loading para cards
export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

// Loading para tabelas
export function LoadingTable({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-8 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
