import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  retry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Error',
  message = 'Algo salió mal. Por favor, intenta nuevamente.',
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex min-h-[400px] items-center justify-center', className)}>
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
          {retry && (
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="mt-4 w-full"
            >
              Reintentar
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}

// Error inline para formularios
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3">
      <AlertCircle className="h-4 w-4 text-destructive" />
      <p className="text-sm text-destructive">{message}</p>
    </div>
  )
}