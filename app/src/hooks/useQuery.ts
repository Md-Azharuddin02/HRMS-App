import { useCallback, useEffect, useRef, useState } from "react";
import { onDataChange } from "../utils/events";

export interface QueryState<T> {
  data: T | undefined;
  error: string | null;
  loading: boolean;
  reload: () => void;
  /** Re-fetch without showing a loading state. */
  refetch: () => void;
}

/**
 * Fetch data from a service. Re-runs when `deps` change and silently refreshes
 * after any mutation (see useMutation), so every screen stays in sync.
 */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[], opts: { keepPrevious?: boolean } = {}): QueryState<T> {
  const keepPrevious = !!opts.keepPrevious;
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fnRef = useRef(fn);
  const callId = useRef(0);

  useEffect(() => {
    fnRef.current = fn;
  });

  const run = useCallback((showLoading: boolean) => {
    const id = ++callId.current;
    if (showLoading) setLoading(true);
    fnRef
      .current()
      .then((res) => {
        if (id !== callId.current) return; // a newer request superseded this one
        setData(res);
        setError(null);
      })
      .catch((e: unknown) => {
        if (id === callId.current) setError(e instanceof Error ? e.message : "Something went wrong");
      })
      .finally(() => {
        if (id === callId.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    // New inputs (another user, date, filter): drop the old result so it is never shown as the new one.
    if (!keepPrevious) setData(undefined);
    run(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass their own dependency list
  }, deps);

  useEffect(() => onDataChange(() => run(false)), [run]);

  const reload = useCallback(() => run(true), [run]);
  const refetch = useCallback(() => run(false), [run]);
  return { data, error, loading, reload, refetch };
}
