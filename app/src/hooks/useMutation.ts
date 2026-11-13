import { useCallback, useState } from "react";
import { useToast } from "../components/ui/Toast";
import { emitDataChange } from "../utils/events";

/**
 * Wrap a service call: tracks pending state, toasts success or the error message,
 * and tells all queries to refresh. Resolves to the result, or undefined on failure.
 */
export function useMutation() {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async <T,>(fn: () => Promise<T>, successMessage?: string): Promise<T | undefined> => {
      setPending(true);
      try {
        const result = await fn();
        emitDataChange();
        if (successMessage) toast.success(successMessage);
        return result;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Something went wrong");
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [toast],
  );

  return { run, pending };
}
