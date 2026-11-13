import { AlertTriangle, Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../utils/format";
import { Button } from "./Button";

export function EmptyState({ icon: Icon = Inbox, title, message, action }: { icon?: LucideIcon; title: string; message?: string; action?: ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center px-4 py-10 text-center">
      <Icon className="size-8 text-slate-300" aria-hidden />
      <h3 className="mt-3 text-sm font-medium text-slate-900">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center px-4 py-10 text-center">
      <AlertTriangle className="size-8 text-red-400" aria-hidden />
      <h3 className="mt-3 text-sm font-medium text-slate-900">Couldn't load this</h3>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-slate-200/70", className)} />;
}

export function ListSkeleton({ rows = 5, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-3 p-4" aria-busy="true" aria-label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

/** Renders loading / error / content for a useQuery result. */
export function QueryView<T>({ query, children, skeleton }: { query: { data: T | undefined; error: string | null; loading: boolean; reload: () => void }; children: (data: T) => ReactNode; skeleton?: ReactNode }) {
  if (query.error && !query.data) return <ErrorState message={query.error} onRetry={query.reload} />;
  if (query.data === undefined) return <>{skeleton ?? <ListSkeleton />}</>;
  return <>{children(query.data)}</>;
}
