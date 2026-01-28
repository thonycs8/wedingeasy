import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  /** Título do erro */
  title?: string;
  /** Mensagem de erro */
  message?: string;
  /** Objeto de erro para extração de mensagem */
  error?: Error | unknown;
  /** Callback para retry */
  onRetry?: () => void;
  /** Texto do botão de retry */
  retryLabel?: string;
  /** Classes CSS adicionais */
  className?: string;
  /** Variante visual */
  variant?: 'default' | 'inline' | 'alert';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Ocorreu um erro inesperado.';
}

export function ErrorState({
  title = 'Erro',
  message,
  error,
  onRetry,
  retryLabel = 'Tentar novamente',
  className,
  variant = 'default'
}: ErrorStateProps) {
  const errorMessage = message || (error ? getErrorMessage(error) : 'Ocorreu um erro inesperado.');

  if (variant === 'alert') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{errorMessage}</span>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryLabel}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-destructive', className)}>
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{errorMessage}</span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-auto py-1 px-2">
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{errorMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

// Variante para erros de rede
export function NetworkError({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorState
      title="Erro de conexão"
      message="Não foi possível conectar ao servidor. Verifique a sua conexão à internet."
      onRetry={onRetry}
      className={className}
    />
  );
}

// Variante para erros de permissão
export function PermissionError({ className }: { className?: string }) {
  return (
    <ErrorState
      title="Acesso negado"
      message="Não tem permissão para aceder a este recurso."
      className={className}
    />
  );
}

// Variante para erros 404
export function NotFoundError({ resource = 'recurso', className }: { resource?: string; className?: string }) {
  return (
    <ErrorState
      title="Não encontrado"
      message={`O ${resource} que procura não existe ou foi removido.`}
      className={className}
    />
  );
}
